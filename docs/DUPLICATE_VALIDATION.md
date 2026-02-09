# Validación de Libros Duplicados

## Resumen

Este documento explica cómo se implementa la validación para evitar guardar libros duplicados en la base de datos.

## Estrategia de Validación

La validación de duplicados utiliza un enfoque de dos niveles:

### 1. Validación por ISBN (Más confiable)

- Si el libro tiene un ISBN, se busca primero por este campo
- El ISBN está marcado como `@unique` en el schema de Prisma
- Esta es la forma más confiable de detectar duplicados

### 2. Validación por Título + Autor (Fallback)

- Si no hay ISBN o no se encontró coincidencia por ISBN
- Se busca por título normalizado + primer autor
- Útil para libros sin ISBN o ediciones diferentes

## Implementación

### Funciones en el Repository (`books.repository.ts`)

```typescript
/**
 * Busca un libro por ISBN
 */
export const findByIsbn = (isbn: string) =>
  prisma.book.findUnique({
    where: { isbn },
    include: defaultInclude,
  });

/**
 * Busca libros con el mismo título y al menos un autor en común
 */
export const findByTitleAndAuthor = (title: string, authorName: string) =>
  prisma.book.findFirst({
    where: {
      title,
      authors: {
        some: { name: authorName },
      },
    },
    include: defaultInclude,
  });

/**
 * Verifica si existe un libro duplicado
 * Retorna el libro existente si lo encuentra, null si no existe
 */
export const checkBookExists = async (
  isbn: string | null,
  title: string,
  authors: string[],
) => {
  // Si tiene ISBN, buscar por ISBN primero (más confiable)
  if (isbn) {
    const bookByIsbn = await findByIsbn(isbn);
    if (bookByIsbn) return bookByIsbn;
  }

  // Si no tiene ISBN o no se encontró, buscar por título + autor
  if (authors.length > 0) {
    const bookByTitleAuthor = await findByTitleAndAuthor(title, authors[0]);
    if (bookByTitleAuthor) return bookByTitleAuthor;
  }

  return null;
};
```

### Uso en el Service (`books.service.ts`)

```typescript
export const createBook = async (input: CreateBookDTO) => {
  // Normalizar datos para la comparación
  const normalizedTitle = normalizeString(input.title);
  const normalizedAuthors = input.authors.map(normalizeString);
  const normalizedIsbn = input.isbn ?? null;

  // ✅ Verificar si el libro ya existe
  const existingBook = await repo.checkBookExists(
    normalizedIsbn,
    normalizedTitle,
    normalizedAuthors,
  );

  if (existingBook) {
    throw {
      status: 409,
      message: "Este libro ya existe en tu biblioteca",
      book: existingBook,
    };
  }

  // ... resto de la lógica de creación
};
```

## Códigos de Respuesta HTTP

- **409 Conflict**: Cuando se intenta crear un libro que ya existe
  - Incluye el libro existente en la respuesta
  - Mensaje: "Este libro ya existe en tu biblioteca"

## Manejo en el Frontend

Cuando el backend retorna un error 409, el frontend puede:

1. Mostrar un mensaje al usuario indicando que el libro ya existe
2. Opcionalmente, mostrar los detalles del libro existente
3. Ofrecer opciones como:
   - Ver el libro existente en la biblioteca
   - Editar el libro existente
   - Cancelar la operación

### Ejemplo de manejo de error en el frontend:

```typescript
try {
  await createBook(bookData);
} catch (error) {
  if (error.status === 409) {
    // Libro duplicado
    console.log("Libro existente:", error.book);
    showMessage("Este libro ya está en tu biblioteca");
  }
}
```

## Casos de Uso

### Caso 1: Libro con ISBN único

```
Input: ISBN "978-0-123456-78-9", Título "El Quijote"
Resultado: ✅ Se crea si no existe, ❌ Error 409 si existe
```

### Caso 2: Libro sin ISBN

```
Input: Título "Don Quijote de la Mancha", Autor "Miguel de Cervantes"
Resultado: Busca por título + autor normalizado
```

### Caso 3: Misma obra, diferentes ediciones

```
Input: ISBN "978-1-234567-89-0" (edición 2020)
Existente: ISBN "978-0-987654-32-1" (edición 2010)
Resultado: ✅ Se permite, son ISBNs diferentes
```

### Caso 4: Mismo título, diferentes autores

```
Input: Título "1984", Autor "George Orwell"
Existente: Título "1984", Autor "Haruki Murakami"
Resultado: ✅ Se permite, son autores diferentes
```

## Normalización de Datos

Todos los textos se normalizan antes de la comparación:

- **Función**: `normalizeString()` en `utils/formatters.ts`
- **Proceso**:
  - Convierte a minúsculas
  - Elimina acentos y diacríticos
  - Trim de espacios
  - Esto asegura que "El Quijote" y "el quijote" se consideren iguales

## Mejoras Futuras

### Opciones avanzadas que podrías considerar:

1. **Validación más flexible**:

   ```typescript
   // Permitir al usuario decidir si quiere guardar duplicados
   export const createBook = async (input: CreateBookDTO, options?: {
     allowDuplicates?: boolean
   }) => {
     if (!options?.allowDuplicates) {
       const existing = await repo.checkBookExists(...);
       if (existing) throw ...;
     }
     // ...
   }
   ```

2. **Similitud de títulos (fuzzy matching)**:
   - Usar bibliotecas como `fuse.js` o `string-similarity`
   - Detectar títulos muy similares: "El Quijote" vs "Don Quijote"

3. **Tracking de ediciones**:
   - Relacionar diferentes ediciones del mismo libro
   - Agregar campo `editionId` para agrupar ediciones

4. **Historial de duplicados detectados**:
   - Log de intentos de crear duplicados
   - Analytics sobre qué libros se intentan agregar múltiples veces

## Testing

### Tests recomendados:

```typescript
describe("Duplicate validation", () => {
  test("should reject book with duplicate ISBN", async () => {
    // ...
  });

  test("should reject book with same title and author", async () => {
    // ...
  });

  test("should allow books with same title but different authors", async () => {
    // ...
  });

  test("should allow different editions (different ISBNs)", async () => {
    // ...
  });
});
```

## Referencias

- Schema Prisma: `backend/prisma/schema.prisma`
- Repository: `backend/src/modules/books/books.repository.ts`
- Service: `backend/src/modules/books/books.service.ts`
- Normalización: `backend/src/utils/formatters.ts`
