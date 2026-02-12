# 📡 Guía de APIs - Book Library

Esta guía documenta las APIs utilizadas en el proyecto Book Library, tanto la API backend propia como las APIs externas para búsqueda de metadatos.

## 🏠 API Backend Propia

El backend expone una API REST completa para la gestión de la biblioteca.

### Base URL

```
http://localhost:3001/api
```

### Documentación Interactiva

Swagger UI disponible en: `http://localhost:3001/api-docs`

### Endpoints Disponibles

#### 1. Listar Todos los Libros

```http
GET /api/books
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "isbn": "978-0-123456-78-9",
    "title": "El Nombre del Libro",
    "authors": "Autor Principal, Co-autor",
    "publisher": "Editorial",
    "publishedDate": "2023-01-15",
    "description": "Descripción del libro...",
    "pageCount": 350,
    "language": "es",
    "coverImage": "http://localhost:3001/covers/cover-123.jpg",
    "filePath": "C:/Books/libro.epub",
    "fileHash": "abc123def456",
    "fileFormat": "epub",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

#### 2. Obtener un Libro

```http
GET /api/books/:id
```

**Parámetros:**

- `id` (número): ID del libro

**Respuesta:** Objeto libro (ver ejemplo anterior)

#### 3. Crear Libro

```http
POST /api/books
Content-Type: application/json
```

**Body:**

```json
{
  "isbn": "978-0-123456-78-9",
  "title": "Nuevo Libro",
  "authors": "Autor",
  "publisher": "Editorial",
  "publishedDate": "2023-01-15",
  "description": "Descripción...",
  "pageCount": 300,
  "language": "es",
  "coverImage": "https://example.com/cover.jpg",
  "filePath": "C:/Books/nuevo-libro.pdf",
  "fileFormat": "pdf"
}
```

**Respuesta:** Libro creado con ID asignado

#### 4. Actualizar Libro

```http
PUT /api/books/:id
Content-Type: application/json
```

**Body:** Campos a actualizar (parcial permitido)

```json
{
  "title": "Título Actualizado",
  "description": "Nueva descripción"
}
```

#### 5. Eliminar Libro

```http
DELETE /api/books/:id
```

**Respuesta:**

```json
{
  "message": "Libro eliminado exitosamente"
}
```

#### 6. Escanear Biblioteca

```http
POST /api/books/scan
Content-Type: application/json
```

**Body:**

```json
{
  "path": "C:/Users/Usuario/Books"
}
```

**Respuesta:**

```json
{
  "scanned": 150,
  "added": 45,
  "duplicates": 5,
  "errors": 2,
  "books": [
    {
      "title": "Libro Encontrado",
      "filePath": "C:/Users/Usuario/Books/libro.epub",
      "status": "added"
    }
  ]
}
```

#### 7. Buscar en APIs Externas

```http
POST /api/books/search
Content-Type: application/json
```

**Body:**

```json
{
  "isbn": "978-0-123456-78-9"
}
```

**Respuesta:** Array de resultados de Google Books y Open Library

### Manejo de Errores

Todos los endpoints devuelven errores en formato estándar:

```json
{
  "error": "Mensaje de error descriptivo",
  "code": "ERROR_CODE"
}
```

**Códigos de estado HTTP:**

- `200` - OK
- `201` - Creado
- `400` - Bad Request (datos inválidos)
- `404` - Not Found
- `409` - Conflict (duplicado)
- `500` - Internal Server Error

### Ejemplo de Uso con Axios (Frontend)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Obtener todos los libros
const books = await api.get("/books");

// Crear libro
const newBook = await api.post("/books", {
  isbn: "978-0-123456-78-9",
  title: "Mi Libro",
  authors: "Autor",
});

// Escanear biblioteca
const scanResult = await api.post("/books/scan", {
  path: "C:/Users/Usuario/Books",
});
```

## 🌐 APIs Externas

El proyecto utiliza APIs externas para enriquecer los metadatos de los libros.

### 1. Google Books API

Búsqueda de libros por ISBN con metadatos completos.

#### Endpoint

```
GET https://www.googleapis.com/books/v1/volumes?q=isbn:{ISBN}
```

#### Ejemplo de Uso

```typescript
// frontend/src/services/googleBooksService.ts
import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY; // Opcional

export async function searchByISBN(isbn: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  const params = API_KEY ? { key: API_KEY } : {};

  const response = await axios.get(url, { params });
  return response.data.items?.[0];
}
```

#### Respuesta Típica

```json
{
  "items": [
    {
      "id": "abc123",
      "volumeInfo": {
        "title": "Título del Libro",
        "authors": ["Autor Principal", "Co-autor"],
        "publisher": "Editorial",
        "publishedDate": "2023-01-15",
        "description": "Descripción completa...",
        "pageCount": 350,
        "language": "es",
        "imageLinks": {
          "thumbnail": "http://books.google.com/cover.jpg",
          "smallThumbnail": "http://books.google.com/cover-small.jpg"
        },
        "industryIdentifiers": [
          {
            "type": "ISBN_13",
            "identifier": "9780123456789"
          }
        ]
      }
    }
  ]
}
```

#### Mapeo de Datos

```typescript
function mapGoogleBooksToBook(googleBook: any) {
  const info = googleBook.volumeInfo;

  return {
    isbn:
      info.industryIdentifiers?.find((id: any) => id.type === "ISBN_13")
        ?.identifier || "",
    title: info.title,
    authors: info.authors?.join(", ") || "Desconocido",
    publisher: info.publisher || "",
    publishedDate: info.publishedDate || "",
    description: info.description || "",
    pageCount: info.pageCount || 0,
    language: info.language || "es",
    coverImage: info.imageLinks?.thumbnail || "",
  };
}
```

#### Límites

- **Sin API Key**: 1,000 requests/día
- **Con API Key**: Hasta 10,000 requests/día (gratis)
- Rate limit: ~10 requests/segundo

### 2. Open Library API

API alternativa para búsqueda de libros, especialmente útil cuando Google Books no tiene resultados.

#### Endpoint

```
GET https://openlibrary.org/api/books?bibkeys=ISBN:{ISBN}&format=json&jscmd=data
```

#### Ejemplo de Uso

```typescript
// frontend/src/services/openLibraryService.ts
import axios from "axios";

export async function searchByISBN(isbn: string) {
  const url = `https://openlibrary.org/api/books`;
  const params = {
    bibkeys: `ISBN:${isbn}`,
    format: "json",
    jscmd: "data",
  };

  const response = await axios.get(url, { params });
  return response.data[`ISBN:${isbn}`];
}
```

#### Respuesta Típica

```json
{
  "ISBN:9780123456789": {
    "title": "Título del Libro",
    "authors": [{ "name": "Autor Principal" }],
    "publishers": [{ "name": "Editorial" }],
    "publish_date": "2023",
    "number_of_pages": 350,
    "cover": {
      "small": "https://covers.openlibrary.org/b/id/123-S.jpg",
      "medium": "https://covers.openlibrary.org/b/id/123-M.jpg",
      "large": "https://covers.openlibrary.org/b/id/123-L.jpg"
    }
  }
}
```

#### Mapeo de Datos

```typescript
function mapOpenLibraryToBook(olBook: any) {
  return {
    title: olBook.title,
    authors:
      olBook.authors?.map((a: any) => a.name).join(", ") || "Desconocido",
    publisher: olBook.publishers?.[0]?.name || "",
    publishedDate: olBook.publish_date || "",
    pageCount: olBook.number_of_pages || 0,
    coverImage: olBook.cover?.large || olBook.cover?.medium || "",
  };
}
```

#### Límites

- Sin autenticación requerida
- Rate limit razonable (no especificado oficialmente)
- Respuesta más lenta que Google Books

### 3. Servicio Combinado

El frontend implementa un servicio que intenta múltiples APIs:

```typescript
// frontend/src/services/bookMetadataService.ts
import * as googleBooks from "./googleBooksService";
import * as openLibrary from "./openLibraryService";

export async function searchBookByISBN(isbn: string) {
  // Intentar primero con Google Books
  try {
    const googleResult = await googleBooks.searchByISBN(isbn);
    if (googleResult) {
      return {
        source: "google",
        data: googleResult,
      };
    }
  } catch (error) {
    console.warn("Google Books falló:", error);
  }

  // Fallback a Open Library
  try {
    const olResult = await openLibrary.searchByISBN(isbn);
    if (olResult) {
      return {
        source: "openlibrary",
        data: olResult,
      };
    }
  } catch (error) {
    console.warn("Open Library falló:", error);
  }

  throw new Error("No se encontraron resultados en ninguna API");
}
```

## 🔐 Configuración de API Keys

### Google Books API Key (Opcional)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar "Books API"
4. Crear credenciales (API Key)
5. Agregar al frontend:

```env
# frontend/.env
VITE_GOOGLE_BOOKS_API_KEY=tu_api_key_aqui
```

## 🎯 Mejores Prácticas

### 1. Caché de Respuestas

```typescript
const cache = new Map();

async function fetchWithCache(isbn: string) {
  if (cache.has(isbn)) {
    return cache.get(isbn);
  }

  const result = await searchByISBN(isbn);
  cache.set(isbn, result);
  return result;
}
```

### 2. Manejo de Errores

```typescript
try {
  const book = await searchByISBN(isbn);
  return book;
} catch (error) {
  if (error.response?.status === 404) {
    return null; // No encontrado
  }
  throw error; // Propagar otros errores
}
```

### 3. Rate Limiting

```typescript
import pLimit from "p-limit";

const limit = pLimit(5); // Máximo 5 requests concurrentes

const promises = isbns.map((isbn) => limit(() => searchByISBN(isbn)));

const results = await Promise.all(promises);
```

### 4. Timeout

```typescript
const api = axios.create({
  timeout: 5000, // 5 segundos
});
```

## 📊 Comparación de APIs

| Característica        | Backend Propio | Google Books | Open Library |
| --------------------- | -------------- | ------------ | ------------ |
| Autenticación         | No requerida   | Opcional     | No requerida |
| Rate Limit            | Ilimitado      | 1k-10k/día   | Razonable    |
| Velocidad             | Rápida         | Rápida       | Media        |
| Cobertura             | Tu biblioteca  | Muy amplia   | Amplia       |
| Portadas              | Local          | Buena        | Buena        |
| Metadatos completos   | ✅             | ✅           | Parcial      |
| Offline               | ✅             | ❌           | ❌           |
| Búsqueda por archivo  | ✅             | ❌           | ❌           |
| Validación duplicados | ✅             | ❌           | ❌           |

## 🚀 Recomendaciones

1. **Usa el backend propio** para toda la gestión de tu biblioteca
2. **Usa APIs externas** solo para búsquedas de nuevos libros por ISBN
3. **Implementa caché** para reducir llamadas a APIs externas
4. **Considera la API Key de Google Books** si haces muchas búsquedas
5. **Fallback entre APIs** para mejor cobertura
6. **Almacena metadatos localmente** una vez obtenidos

## � Recursos

- [Google Books API Docs](https://developers.google.com/books)
- [Open Library API Docs](https://openlibrary.org/developers/api)
- [Swagger UI](http://localhost:3001/api-docs) (cuando el backend esté corriendo)
- [Prisma Docs](https://www.prisma.io/docs) (ORM del backend)

---

**Última actualización**: Febrero 2026
