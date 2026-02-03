# 🏗️ Arquitectura Backend Limpia

**Node.js · Express · TypeScript · Prisma**

---

## 1️⃣ Objetivo de esta arquitectura

El objetivo principal es:

- ✅ **Separar responsabilidades**
- ✅ **Evitar duplicación de código**
- ✅ **Centralizar la lógica de negocio**
- ✅ **Facilitar mantenimiento y escalado**
- ✅ **Poder reutilizar lógica entre endpoints**

Problema típico que queremos evitar:

> “Tengo la misma consulta o lógica repetida en varios endpoints”

---

## 2️⃣ Capas principales del backend

La arquitectura se basa en **capas bien definidas**, cada una con una única responsabilidad.

```
Request (HTTP)
   ↓
Controller
   ↓
Service (Business Logic)
   ↓
Repository (Data Access)
   ↓
Database
```

---

## 3️⃣ Controller Layer (Capa de Controladores)

### 📌 Responsabilidad

- Manejar **HTTP**
- Leer:
  - `req.params`
  - `req.query`
  - `req.body`
- Llamar al **service**
- Devolver una respuesta HTTP

### ❌ Lo que NO debe hacer

- Lógica de negocio
- Consultas a base de datos
- Reglas complejas
- Normalización de datos

### ✅ Ejemplo

```ts
export const getBooksController = async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
};
```

📌 El controller **no sabe cómo** se obtienen los libros.

---

## 4️⃣ Service Layer (Lógica de negocio / Dominio)

### 📌 Responsabilidad

Aquí vive **toda la lógica importante del sistema**.

- Reglas de negocio
- Validaciones complejas
- Decidir qué repositorios usar
- Reutilizar lógica entre endpoints
- Transformar DTOs → datos persistibles

### ✅ Ejemplos de lógica aquí

- Normalizar strings
- Comprobar que un recurso existe
- Decidir si se crea o conecta una relación
- Combinar varias consultas
- Aplicar reglas (permisos, estados, etc.)

### ✅ Ejemplo

```ts
export const getAllBooks = async () => {
  const books = await findAllBooks();

  // Ejemplo de lógica de negocio
  return books.filter(book => book.isPublished);
};
```

📌 Si otro endpoint necesita libros → reutiliza esta función.

---

## 5️⃣ Repository Layer (Acceso a datos / Integración)

### 📌 Responsabilidad

- Hablar **exclusivamente** con la base de datos
- Usar Prisma (u otro ORM)
- No contiene lógica de negocio
- No conoce HTTP

### ❌ Lo que NO debe recibir

- DTOs de API
- Campos virtuales (`seriesName`)
- Datos que Prisma no entienda

### ✅ Ejemplo

```ts
export const findAllBooks = async () => {
  return prisma.book.findMany({
    include: {
      authors: true,
      categories: true,
      series: true,
    },
  });
};
```

📌 Si mañana cambias Prisma → solo tocas esta capa.

---

## 6️⃣ DTOs y modelos de dominio

### 📌 Concepto clave

- **DTO (Data Transfer Object)** → contrato de entrada/salida
- **Modelo Prisma** → modelo de base de datos
- **NO son lo mismo**

Ejemplo:

```ts
// DTO
seriesName?: string;

// Prisma model
series?: Series;
```

✅ El DTO puede tener campos que **no existen en la BD**  
✅ El service transforma DTO → modelo persistente

---

## 7️⃣ Error común: pasar DTOs directamente a Prisma

### ❌ Ejemplo incorrecto

```ts
prisma.book.create({
  data: {
    ...data, // ← aquí entra seriesName ❌
  },
});
```

Resultado:

```
Unknown argument `seriesName`
```

### ✅ Forma correcta

```ts
const { seriesName, ...bookData } = data;

prisma.book.create({
  data: {
    ...bookData,
    ...(seriesName && {
      series: {
        connectOrCreate: {
          where: { name: seriesName },
          create: { name: seriesName },
        },
      },
    }),
  },
});
```

📌 El repository **filtra y transforma**.

---

## 8️⃣ Uso de transacciones (`$transaction`)

### 📌 Por qué son importantes

En operaciones complejas:

- Crear libro
- Crear/conectar autores
- Crear/conectar categorías
- Crear/conectar serie

Si algo falla a mitad → **datos inconsistentes**.

### ✅ Solución

```ts
await prisma.$transaction(async (tx) => {
  await tx.book.create(...);
  await tx.author.connectOrCreate(...);
});
```

✅ Todo o nada  
✅ Rollback automático  
✅ BD consistente

---

## 9️⃣ Ejemplo completo: Obtener todos los libros

### Controller

```ts
export const getBooksController = async (req, res) => {
  const books = await getAllBooks();
  res.json(books);
};
```

### Service

```ts
export const getAllBooks = async () => {
  return booksRepository.findAll();
};
```

### Repository

```ts
export const findAll = () => {
  return prisma.book.findMany({
    include: {
      authors: true,
      categories: true,
      series: true,
    },
  });
};
```

✅ Sin duplicación  
✅ Fácil de reutilizar  
✅ Código claro

---

## 🔟 Organización de carpetas recomendada

```
src/
 ├── modules/
 │    └── books/
 │         ├── books.routes.ts
 │         ├── books.controller.ts
 │         ├── books.service.ts
 │         ├── books.repository.ts
 │         ├── books.types.ts
 │         └── books.external.ts
 ├── lib/
 │    └── prisma.ts
 ├── utils/
 │    └── formatters.ts
 ├── app.ts
 └── server.ts
```

---

## 1️⃣1️⃣ Beneficios reales de esta arquitectura

- ✅ Código reutilizable
- ✅ Fácil de testear
- ✅ Fácil de mantener
- ✅ Fácil de escalar
- ✅ Cambios localizados
- ✅ Claridad mental al programar

---

## 1️⃣2️⃣ Principios clave a recordar

- **Controller** → HTTP
- **Service** → reglas de negocio
- **Repository** → base de datos
- **DTO ≠ Prisma Model**
- **Nunca pasar DTOs directamente a Prisma**
- **Usar transacciones en operaciones complejas**

---

## 🏁 Conclusión

Esta arquitectura:

- Es **profesional**
- Es **realista**
- Es **la que se usa en proyectos reales**
- Escala muy bien cuando el proyecto crece

Te permite añadir nuevos endpoints **sin duplicar lógica** y sin que el código se vuelva inmanejable.

---
