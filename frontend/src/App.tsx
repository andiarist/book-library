import { useState } from 'react';
import './App.css';
import { BookCard } from './components/BookCard';
import { BookDetail } from './components/BookDetail';
import { BookEditModal, BookEditData } from './components/BookEditModal';
import { BookList } from './components/BookList';
import { Button } from './components/Button';
import { LibraryBookCard } from './components/LibraryBookCard';
import { ModeSearchBtn } from './components/ModeSearchBtn';
import { SearchForm } from './components/SearchForm';
import { useBookMetadata } from './hooks/useBookMetadata';
import { Book, BookMetadata, SearchMode } from './types/book';
import LibraryPage from './pages/LibraryPage';
import { SearchPage } from './pages/SearchPage';

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
  const [editingBook, setEditingBook] = useState<BookMetadata | null>(null);
  const [editingExistingBook, setEditingExistingBook] = useState<Book | null>(
    null
  );

  const metadataToBook = (data: BookEditData): Book => {
    return {
      id: crypto.randomUUID(),
      ...data,
      addedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  };

  const handleAddToLibrary = (bookMetadata: BookMetadata) => {
    // Abrir modal para editar metadata antes de añadir
    setEditingBook(bookMetadata);
  };

  const handleSaveBook = (data: BookEditData) => {
    // Verificar si ya existe en la biblioteca
    const exists = library.some(
      (b) => b.isbn && data.isbn && b.isbn === data.isbn
    );

    if (!exists) {
      const book = metadataToBook(data);
      setLibrary([...library, book]);
      setEditingBook(null);
      handleReset();
    }
  };

  const handleEditExistingBook = (book: Book) => {
    setEditingExistingBook(book);
    setSelectedBook(null);
  };

  const handleUpdateBook = (data: BookEditData) => {
    if (editingExistingBook) {
      const updatedBook: Book = {
        ...editingExistingBook,
        ...data,
        lastModified: new Date().toISOString(),
      };
      setLibrary(
        library.map((book) =>
          book.id === editingExistingBook.id ? updatedBook : book
        )
      );
      setEditingExistingBook(null);
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

      <main>
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
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          {activeTab === 'tab1' && (
            <LibraryPage />
            // <section className="animate-fadeIn p-6">
            //   <h2 className="text-lg">Mi Biblioteca ({library.length})</h2>
            //   {library.length === 0 ? (
            //     <p className="p-8 text-center text-gray-500 italic">
            //       Aún no has añadido ningún libro. Busca por ISBN o texto para
            //       empezar.
            //     </p>
            //   ) : (
            //     <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            //       {library.map((book) => (
            //         <div key={book.id} className="h-full">
            //           <LibraryBookCard
            //             book={book}
            //             onClick={() => setSelectedBook(book)}
            //           />
            //         </div>
            //       ))}
            //     </div>
            //   )}
            // </section>
          )}
          {activeTab === 'tab2' && <SearchPage />}
        </div>
      </main>
      {/* Modal de detalle del libro */}
      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onDelete={() => handleDeleteFromLibrary(selectedBook.id)}
          onEdit={() => handleEditExistingBook(selectedBook)}
        />
      )}

      {/* Modal de edición antes de añadir a biblioteca */}
      {editingBook && (
        <BookEditModal
          bookMetadata={editingBook}
          onClose={() => setEditingBook(null)}
          onSave={handleSaveBook}
        />
      )}

      {/* Modal de edición de libro existente */}
      {editingExistingBook && (
        <BookEditModal
          existingBook={editingExistingBook}
          onClose={() => setEditingExistingBook(null)}
          onSave={handleUpdateBook}
        />
      )}
    </div>
  );
}

export default App;
