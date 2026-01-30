import { useState } from 'react';
import { ISBNSearchForm } from './components/ISBNSearchForm';
import { BookCard } from './components/BookCard';
import { useBookMetadata } from './hooks/useBookMetadata';
import './App.css';
import { TitleSearchForm } from './components/TitleSearchForm';
import { Book, BookMetadata, SearchMode } from './types/book';
import { BookList } from './components/BookList';
import { LibraryBookCard } from './components/LibraryBookCard';
import { BookDetail } from './components/BookDetail';
import { ModeSearchBtn } from './components/ModeSearchBtn';
import { Button } from './components/Button';
import { SearchForm } from './components/SearchForm';

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

  const searchModeOnClick = (mode: SearchMode) => {
    setSearchMode(mode);
    handleReset();
  };
  const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
  const tabs: { id: 'tab1' | 'tab2'; label: string }[] = [
    { id: 'tab1', label: 'Biblioteca' },
    { id: 'tab2', label: 'Búsqueda' },
  ];

  return (
    <div className="mx-auto my-0 w-full max-w-9/10 p-8">
      <header className="mb-12 text-center">
        <h1 className="my-2 text-5xl">📚 Biblioteca Personal</h1>
        <p className="text-xl text-gray-400">Gestiona tu colección de libros</p>
      </header>

      <main
      //className="mx-auto mt-10 w-full max-w-2xl p-4"
      //className="app-main"
      >
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer px-4 py-2 text-lg font-semibold transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {/* <button
            onClick={() => setActiveTab('tab1')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'tab1'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Biblioteca
          </button>
          <button
            onClick={() => setActiveTab('tab2')}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'tab2'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Búsqueda
          </button> */}
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          {activeTab === 'tab1' && (
            <section className="animate-fadeIn p-6">
              <h2 className="text-lg">Mi Biblioteca ({library.length})</h2>
              {library.length === 0 ? (
                <p className="p-8 text-center text-gray-500 italic">
                  Aún no has añadido ningún libro. Busca por ISBN o texto para
                  empezar.
                </p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                  {library.map((book) => (
                    <div key={book.id} className="h-full">
                      <LibraryBookCard
                        book={book}
                        onClick={() => setSelectedBook(book)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {activeTab === 'tab2' && (
            <section className="animate-fadeIn rounded-lg p-8">
              <div className="mb-8 flex gap-2 p-2">
                <ModeSearchBtn
                  searchModeOnClick={searchModeOnClick}
                  searchMode="isbn"
                  isActive={searchMode === 'isbn'}
                />
                <ModeSearchBtn
                  searchModeOnClick={searchModeOnClick}
                  searchMode="text"
                  isActive={searchMode === 'text'}
                />
              </div>
              <SearchForm
                loading={loading}
                mode={searchMode}
                onSearch={(query) =>
                  searchMode === 'isbn'
                    ? handleISBNSearch(query)
                    : handleTextSearch(query)
                }
              />
              {/* {searchMode === 'isbn' ? (
                <ISBNSearchForm onSearch={handleISBNSearch} loading={loading} />
              ) : (
                <TitleSearchForm
                  onSearch={handleTextSearch}
                  loading={loading}
                />
              )} */}

              {error && (
                <div className="mx-4 my-0 rounded-sm bg-red-500 p-4 text-white">
                  <strong>Error:</strong> {error.message}
                </div>
              )}

              {loading && (
                <div className="p-8 text-center text-gray-400 italic">
                  Buscando metadatos...
                </div>
              )}

              {/* Resultados de búsqueda por ISBN (un solo libro) */}
              {!loading && metadata && searchMode === 'isbn' && (
                <div className="mt-8">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="m-0">Resultado:</h3>
                    <Button
                      onClick={handleReset}
                      className="bg-gray-400 px-2 py-4 text-sm hover:bg-gray-600"
                    >
                      Nueva búsqueda
                    </Button>
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
              {!loading &&
                searchResults.length > 0 &&
                searchMode === 'text' && (
                  <div className="mt-8">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="m-0">Resultado:</h3>
                      <Button
                        onClick={handleReset}
                        className="bg-gray-400 px-2 py-4 text-sm hover:bg-gray-600"
                      >
                        Nueva búsqueda
                      </Button>
                    </div>
                    <BookList
                      books={searchResults}
                      onAddBook={(book) => {
                        handleAddToLibrary(book);
                      }}
                    />
                  </div>
                )}

              {/* {
            !loading && searchResults.length === 0 && !metadata && (
              // (searchMode === 'text' ? (
              <div className="empty-message">
                Usa el formulario para buscar libros por título o autor
              </div>
            )
            // ) : null)
          } */}
            </section>
          )}
        </div>

        {/* <section className="search-section">
          <div className="search-mode-selector">
            <ModeSearchBtn
              searchModeOnClick={searchModeOnClick}
              searchMode="isbn"
              isActive={searchMode === 'isbn'}
            />
            <ModeSearchBtn
              searchModeOnClick={searchModeOnClick}
              searchMode="text"
              isActive={searchMode === 'text'}
            />
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
        {/* {!loading && metadata && searchMode === 'isbn' && (
            <div className="search-result">
              <div className="result-header">
                <h3>Resultado:</h3>
                <Button onClick={handleReset} className="reset-button">
                  Nueva búsqueda
                </Button>
              </div>
              <BookCard
                book={metadata}
                onAdd={() => {
                  handleAddToLibrary(metadata);
                  handleReset();
                }}
              />
            </div>
          )} */}

        {/* Resultados de búsqueda por texto (múltiples libros) */}
        {/* {!loading && searchResults.length > 0 && searchMode === 'text' && (
            <div className="search-result">
              <div className="result-header">
                <h3>Resultados:</h3>
                <Button onClick={handleReset} className="reset-button">
                  Nueva búsqueda
                </Button>
              </div>
              <BookList
                books={searchResults}
                onAddBook={(book) => {
                  handleAddToLibrary(book);
                }}
              />
            </div>
          )} */}

        {/* {
            !loading && searchResults.length === 0 && !metadata && (
              // (searchMode === 'text' ? (
              <div className="empty-message">
                Usa el formulario para buscar libros por título o autor
              </div>
            )
            // ) : null)
          } */}
        {/* </section>  */}

        {/* <section className="library-section">
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
        </section> */}
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

// {/* <button
//           className={searchMode === 'isbn' ? 'active' : ''}
//           onClick={() => {
//             setSearchMode('isbn');
//             handleReset();
//           }}
//         >
//           Buscar por ISBN
//         </button>
//         <button
//           className={searchMode === 'text' ? 'active' : ''}
//           onClick={() => {
//             setSearchMode('text');
//             handleReset();
//           }}
//         >
//           Buscar por texto
//         </button> */}

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
