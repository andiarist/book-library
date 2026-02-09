import { useState } from 'react';
import { BookCardMini } from '@/components/cards/BookCardMini';
import { useBooks } from '@/hooks/useBooks';
import { scanLibrary, ScanLibraryResult } from '@/api/books.api';
import { ScanResultsModal } from '@/components/modals/ScanResultsModal';
import { Book } from '@/types/books.types';
import { BookDetail } from '@/components/modals/DetailBookModal';

const LibraryPage = () => {
  const { data: books, isLoading, isError, refetch } = useBooks();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanLibraryResult | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleScanLibrary = async () => {
    try {
      setIsScanning(true);
      const results = await scanLibrary();
      setScanResults(results);
      setShowResults(true);
      // Recargar la lista de libros después del escaneo
      refetch();
    } catch (error) {
      console.error('Error al escanear biblioteca:', error);
      alert(
        'Error al escanear la biblioteca. Revisa la consola para más detalles.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // const handleEditExistingBook = (book: Book) => {
  //   setEditingExistingBook(book);
  //   setSelectedBook(null);
  // };

  if (isLoading) {
    return <div>Cargando libros...</div>;
  }

  if (isError) {
    return <div>Error al cargar los libros</div>;
  }
  if (books === undefined || books.length === 0) {
    return (
      <>
        <section className="animate-fadeIn p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg">Mi biblioteca (0)</h2>
            <button
              onClick={handleScanLibrary}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isScanning ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Escaneando...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Escanear Biblioteca
                </>
              )}
            </button>
          </div>
          <p className="text-center text-gray-500 italic">
            Aún no has añadido ningún libro. Busca por ISBN o texto para
            empezar, o escanea tu biblioteca.
          </p>
        </section>

        <ScanResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          results={scanResults}
        />
      </>
    );
  }

  return (
    <>
      <section className="animate-fadeIn p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg">Mi biblioteca ({books.length})</h2>
          <button
            onClick={handleScanLibrary}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isScanning ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Escaneando...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Escanear Biblioteca
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {books.map((book) => (
            <div key={book.id} className="h-full">
              <BookCardMini book={book} onClick={() => setSelectedBook(book)} />
            </div>
          ))}
        </div>
      </section>

      <ScanResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={scanResults}
      />
      {/* Modal de detalle del libro */}
      {selectedBook && (
        <BookDetail
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          //onDelete={() => handleDeleteFromLibrary(selectedBook.id)}
          //onEdit={() => handleEditExistingBook(selectedBook)}
        />
      )}
    </>
  );
};

export default LibraryPage;
