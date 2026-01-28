import { useState } from 'react';
import { ISBNSearchForm } from './components/ISBNSearchForm';
import { BookCard } from './components/BookCard';
import { useBookMetadata } from './hooks/useBookMetadata';
import './App.css';
import { TitleSearchForm } from './components/TitleSearchForm';
import { Book, BookMetadata } from './types/book';
import { BookList } from './components/BookList';
import { LibraryBookCard } from './components/LibraryBookCard';
import { BookDetail } from './components/BookDetail';

type SearchMode = 'isbn' | 'text';

function App() {
  const {
    metadata,
    searchResults,
    loading,
    error,
    searchByISBN,
    search,
    reset,
  } = useBookMetadata();
  const [library, setLibrary] = useState<Book[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>('isbn');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const metadataToBook = (metadata: BookMetadata): Book => {
    return {
      id: crypto.randomUUID(),
      ...metadata,
      addedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  };

  const handleAddToLibrary = (bookMetadata: BookMetadata) => {
    // Verificar si ya existe en la biblioteca
    const exists = library.some(
      (b) => b.isbn && bookMetadata.isbn && b.isbn === bookMetadata.isbn
    );

    if (!exists) {
      const book = metadataToBook(bookMetadata);
      setLibrary([...library, book]);
    }
  };

  const handleDeleteFromLibrary = (bookId: string) => {
    setLibrary(library.filter((book) => book.id !== bookId));
    setSelectedBook(null);
  };

  const handleISBNSearch = async (isbn: string) => {
    await searchByISBN(isbn);
  };

  const handleTextSearch = async (query: string) => {
    await search(query);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Biblioteca Personal</h1>
        <p>Gestiona tu colección de libros</p>
      </header>

      <main className="app-main">
        <section className="search-section">
          <div className="search-mode-selector">
            <button
              className={searchMode === 'isbn' ? 'active' : ''}
              onClick={() => {
                setSearchMode('isbn');
                handleReset();
              }}
            >
              Buscar por ISBN
            </button>
            <button
              className={searchMode === 'text' ? 'active' : ''}
              onClick={() => {
                setSearchMode('text');
                handleReset();
              }}
            >
              Buscar por texto
            </button>
          </div>

          {searchMode === 'isbn' ? (
            <>
              <h2>Buscar libro por ISBN</h2>
              <ISBNSearchForm onSearch={handleISBNSearch} loading={loading} />
            </>
          ) : (
            <>
              <h2>Buscar libros</h2>
              <TitleSearchForm onSearch={handleTextSearch} loading={loading} />
            </>
          )}

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {loading && <div className="loading">Buscando metadatos...</div>}

          {/* Resultados de búsqueda por ISBN (un solo libro) */}
          {!loading && metadata && searchMode === 'isbn' && (
            <div className="search-result">
              <div className="result-header">
                <h3>Resultado:</h3>
                <button onClick={handleReset} className="reset-button">
                  Nueva búsqueda
                </button>
              </div>
              <BookCard
                book={metadata}
                onAdd={() => {
                  handleAddToLibrary(metadata);
                  handleReset();
                }}
              />
            </div>
          )}

          {/* Resultados de búsqueda por texto (múltiples libros) */}
          {!loading && searchResults.length > 0 && searchMode === 'text' && (
            <div className="search-result">
              <div className="result-header">
                <h3>Resultados:</h3>
                <button onClick={handleReset} className="reset-button">
                  Nueva búsqueda
                </button>
              </div>
              <BookList
                books={searchResults}
                onAddBook={(book) => {
                  handleAddToLibrary(book);
                }}
              />
            </div>
          )}

          {!loading &&
            searchResults.length === 0 &&
            !metadata &&
            (searchMode === 'text' ? (
              <div className="empty-message">
                Usa el formulario para buscar libros por título o autor
              </div>
            ) : null)}
        </section>

        <section className="library-section">
          <h2>Mi Biblioteca ({library.length})</h2>
          {library.length === 0 ? (
            <p className="empty-message">
              Aún no has añadido ningún libro. Busca por ISBN o texto para
              empezar.
            </p>
          ) : (
            <div className="library-grid">
              {library.map((book) => (
                <div key={book.id} className="library-item">
                  <LibraryBookCard
                    book={book}
                    onClick={() => setSelectedBook(book)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      {/* Modal de detalle del libro */}
      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onDelete={() => handleDeleteFromLibrary(selectedBook.id)}
        />
      )}
    </div>
  );
}

export default App;

{
  /* <section className="search-section">
          <h2>Buscar libro por ISBN</h2>
          <ISBNSearchForm onSearch={searchByISBN} loading={loading} />

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {loading && <div className="loading">Buscando metadatos...</div>}

          {metadata && (
            <div className="search-result">
              <h3>Resultado:</h3>
              <BookCard book={metadata} onAdd={handleAddToLibrary} />
            </div>
          )}
        </section>
        <section className="search-section">
          <h2>Buscar libro por Título</h2>
          <TitleSearchForm onSearch={search} loading={loading} />

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {loading && <div className="loading">Buscando metadatos...</div>}

          {metadata && (
            <div className="search-result">
              <h3>Resultado:</h3>
              <BookCard book={metadata} onAdd={handleAddToLibrary} />
            </div>
          )}
        </section> */
}
