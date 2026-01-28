# 📚 Ejemplos de Uso de APIs

Este documento contiene ejemplos de cómo usar los servicios y hooks del proyecto.

## 🔍 Búsqueda de Metadatos

### Usando el Servicio Orquestador (Recomendado)

```typescript
import { BookMetadataService } from '@/services/bookMetadataService';

// Buscar por ISBN (intenta Google Books, luego Open Library)
const metadata = await BookMetadataService.searchByISBN('9780134685991');

if (metadata) {
  console.log(metadata.title);        // "Effective Java"
  console.log(metadata.authors);      // ["Joshua Bloch"]
  console.log(metadata.imageUrl);     // URL de portada
}

// Búsqueda por texto
const results = await BookMetadataService.search('javascript programming', 10);
results.forEach(book => {
  console.log(`${book.title} - ${book.authors.join(', ')}`);
});
```

### Usando Google Books Directamente

```typescript
import { GoogleBooksService } from '@/services/googleBooksService';

// Buscar por ISBN
const book = await GoogleBooksService.searchByISBN('9780134685991');

// Búsqueda general
const books = await GoogleBooksService.search('react hooks', 20);
```

### Usando Open Library Directamente

```typescript
import { OpenLibraryService } from '@/services/openLibraryService';

// Buscar por ISBN
const book = await OpenLibraryService.searchByISBN('9780134685991');

// Obtener URL de portada
const coverUrl = OpenLibraryService.getCoverUrl('9780134685991', 'L');
```

## 🪝 Usando el Hook Personalizado

### En un Componente React

```typescript
import { useBookMetadata } from '@/hooks/useBookMetadata';

function BookSearch() {
  const {
    metadata,
    searchResults,
    loading,
    error,
    searchByISBN,
    search,
    reset
  } = useBookMetadata();

  const handleISBNSearch = async () => {
    await searchByISBN('9780134685991');
  };

  const handleTextSearch = async () => {
    await search('react programming');
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleISBNSearch}>Buscar por ISBN</button>
      <button onClick={handleTextSearch}>Buscar por texto</button>
      <button onClick={reset}>Reset</button>
      
      {metadata && (
        <BookCard book={metadata} />
      )}
      
      {searchResults.map((book, idx) => (
        <BookCard key={idx} book={book} />
      ))}
    </div>
  );
}
```

### Manejo Avanzado de Estados

```typescript
function AdvancedBookSearch() {
  const { searchByISBN, loading, error, metadata } = useBookMetadata();
  const [isbn, setIsbn] = useState('');

  const handleSearch = async () => {
    try {
      await searchByISBN(isbn);
      
      // Hacer algo después de búsqueda exitosa
      if (metadata) {
        console.log('Libro encontrado:', metadata.title);
        // Añadir a biblioteca, etc.
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  };

  return (
    <div>
      <input
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleSearch} disabled={loading || !isbn}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
      
      {error && (
        <div className="error">
          <strong>Error desde {error.source}:</strong> {error.message}
        </div>
      )}
    </div>
  );
}
```

## 🎨 Componentes

### BookCard

```typescript
import { BookCard } from '@/components/BookCard';

function MyLibrary() {
  const book = {
    isbn: '9780134685991',
    title: 'Effective Java',
    authors: ['Joshua Bloch'],
    publisher: 'Addison-Wesley',
    publishedDate: '2018-01-06',
    pageCount: 416,
    imageUrl: 'https://...',
    description: 'The definitive guide to Java programming...'
  };

  const handleAdd = () => {
    console.log('Añadiendo libro a biblioteca');
    // Lógica para añadir a biblioteca
  };

  return (
    <BookCard 
      book={book} 
      onAdd={handleAdd}  // Opcional
    />
  );
}
```

### ISBNSearchForm

```typescript
import { ISBNSearchForm } from '@/components/ISBNSearchForm';

function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (isbn: string) => {
    setIsSearching(true);
    try {
      const result = await BookMetadataService.searchByISBN(isbn);
      console.log('Resultado:', result);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ISBNSearchForm 
      onSearch={handleSearch}
      loading={isSearching}
    />
  );
}
```

## 🔄 Manejo de Errores

### Captura de Errores Específicos

```typescript
import { APIError } from '@/types/book';

try {
  const metadata = await BookMetadataService.searchByISBN('invalid-isbn');
} catch (error) {
  if (isAPIError(error)) {
    switch (error.source) {
      case 'google-books':
        console.error('Error en Google Books:', error.message);
        // Intentar con Open Library manualmente, o notificar al usuario
        break;
      case 'open-library':
        console.error('Error en Open Library:', error.message);
        // Ambas APIs fallaron
        break;
      case 'local':
        console.error('Error local:', error.message);
        break;
    }
  } else {
    console.error('Error desconocido:', error);
  }
}

function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'source' in error
  );
}
```

### Reintentos con Delay

```typescript
async function searchWithRetry(isbn: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await BookMetadataService.searchByISBN(isbn);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Esperar antes de reintentar (backoff exponencial)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}

// Uso
try {
  const book = await searchWithRetry('9780134685991');
} catch (error) {
  console.error('Falló después de 3 intentos');
}
```

## 🎯 Casos de Uso Comunes

### 1. Búsqueda con Validación de ISBN

```typescript
function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  // ISBN-10 o ISBN-13
  return /^(97[89])?\d{9}[\dX]$/i.test(cleaned);
}

async function safeSearchByISBN(isbn: string) {
  if (!validateISBN(isbn)) {
    throw new Error('ISBN inválido');
  }
  
  return await BookMetadataService.searchByISBN(isbn);
}
```

### 2. Cache de Resultados

```typescript
const cache = new Map<string, BookMetadata>();

async function cachedSearch(isbn: string) {
  // Verificar cache
  if (cache.has(isbn)) {
    console.log('Usando resultado cacheado');
    return cache.get(isbn)!;
  }

  // Buscar y cachear
  const result = await BookMetadataService.searchByISBN(isbn);
  if (result) {
    cache.set(isbn, result);
  }
  
  return result;
}
```

### 3. Búsqueda Múltiple

```typescript
async function searchMultipleISBNs(isbns: string[]) {
  const results = await Promise.allSettled(
    isbns.map(isbn => BookMetadataService.searchByISBN(isbn))
  );

  const successful = results
    .filter((r): r is PromiseFulfilledResult<BookMetadata | null> => 
      r.status === 'fulfilled' && r.value !== null
    )
    .map(r => r.value);

  const failed = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason);

  return { successful, failed };
}

// Uso
const { successful, failed } = await searchMultipleISBNs([
  '9780134685991',
  '9780596517748',
  '9781491950296'
]);

console.log(`${successful.length} encontrados, ${failed.length} fallaron`);
```

### 4. Transformación de Datos

```typescript
import { Book, BookMetadata } from '@/types/book';

function metadataToBook(metadata: BookMetadata): Book {
  return {
    id: crypto.randomUUID(),
    ...metadata,
    addedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
}

// Uso
const metadata = await BookMetadataService.searchByISBN('9780134685991');
if (metadata) {
  const book = metadataToBook(metadata);
  // Guardar en base de datos, etc.
}
```

## 🧪 Testing

### Mock de Servicios

```typescript
import { vi } from 'vitest';
import { BookMetadataService } from '@/services/bookMetadataService';

// Mock del servicio
vi.mock('@/services/bookMetadataService');

// En tu test
it('should handle search', async () => {
  const mockBook = {
    isbn: '9780134685991',
    title: 'Test Book',
    authors: ['Test Author']
  };

  vi.mocked(BookMetadataService.searchByISBN)
    .mockResolvedValue(mockBook);

  const result = await BookMetadataService.searchByISBN('9780134685991');
  expect(result).toEqual(mockBook);
});
```

## 🔗 Referencias

- [Google Books API Docs](https://developers.google.com/books/docs/v1/using)
- [Open Library API Docs](https://openlibrary.org/developers/api)
- [React Hooks Docs](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
