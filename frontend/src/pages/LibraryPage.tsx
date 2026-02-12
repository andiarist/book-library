import { useState } from 'react';
import { BookCardMini } from '@/components/cards/BookCardMini';
import { useBooks } from '@/hooks/useBooks';
import { scanLibrary, ScanLibraryResult, deleteBook } from '@/api/books.api';
import { ScanResultsModal } from '@/components/modals/ScanResultsModal';
import { Book } from '@/types/books.types';
import { BookDetail } from '@/components/modals/DetailBookModal';
import { EditLibraryBookModal } from '@/components/modals/EditLibraryBookModal';
import { BookPreview } from '@/components/previews/BookPreview';
import {
  SpinnerIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
  EyeIcon,
  EditIcon,
  DocumentIcon,
  TrashIcon,
} from '@/components/icons';

type ViewMode = 'grid' | 'table';

const LibraryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { data, isLoading, isError, refetch } = useBooks(
    currentPage,
    itemsPerPage
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanLibraryResult | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

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

  const handleDeleteBook = async (book: Book) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar "${book.title}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteBook(book.id);
      refetch();
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      alert('Error al eliminar el libro. Revisa la consola para más detalles.');
    }
  };

  if (isLoading) {
    return <div>Cargando libros...</div>;
  }

  if (isError) {
    return <div>Error al cargar los libros</div>;
  }

  const books = data?.books || [];
  const pagination = data?.pagination;

  if (!data || books.length === 0) {
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
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5" />
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
          <h2 className="text-lg">Mi biblioteca ({pagination?.total || 0})</h2>
          <div className="flex items-center gap-3">
            {/* Selector de vista */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista en cuadrícula"
              >
                <GridIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded p-2 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista en tabla"
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleScanLibrary}
              disabled={isScanning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isScanning ? (
                <>
                  <SpinnerIcon className="h-5 w-5 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5" />
                  Escanear Biblioteca
                </>
              )}
            </button>
          </div>
        </div>

        {/* Vista en cuadrícula */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {books.map((book) => (
              <div key={book.id} className="h-full">
                <BookCardMini
                  book={book}
                  onClick={() => setSelectedBook(book)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Vista en tabla */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    #
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    Nombre del libro
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    Autor
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    Serie
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    Índice serie
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900">
                    Formato
                  </th>
                  <th className="border-b border-gray-200 px-4 py-3 text-center font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {books.map((book, index) => (
                  <tr
                    key={book.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {book.authors.map((a) => a.name).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {book.series?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {book.seriesOrder ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          book.format === 'EPUB'
                            ? 'bg-blue-100 text-blue-800'
                            : book.format === 'PDF'
                              ? 'bg-red-100 text-red-800'
                              : book.format === 'PHYSICAL'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {book.format}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* Ver detalle */}
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                          title="Ver detalle"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => setEditingBook(book)}
                          className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50"
                          title="Editar"
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>

                        {/* Vista previa (solo si tiene archivo) */}
                        {book.filePath && (
                          <button
                            onClick={() => setPreviewBook(book)}
                            className="rounded p-1.5 text-purple-600 transition-colors hover:bg-purple-50"
                            title="Vista previa"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </button>
                        )}

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Controles de paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, pagination.total)} de{' '}
              {pagination.total} libros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>

      <ScanResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={scanResults}
      />

      {/* Modal de detalle del libro */}
      {selectedBook && (
        <BookDetail
          book={books?.find((b) => b.id === selectedBook.id) || selectedBook}
          onClose={() => setSelectedBook(null)}
          onEdit={() => {
            // Buscar el libro actualizado antes de editar
            const updatedBook =
              books?.find((b) => b.id === selectedBook.id) || selectedBook;
            setEditingBook(updatedBook);
            setSelectedBook(null);
          }}
        />
      )}

      {/* Modal de edición del libro */}
      {editingBook && (
        <EditLibraryBookModal
          book={editingBook}
          onClose={() => {
            setEditingBook(null);
            // Recargar la lista de libros después de editar
            refetch();
          }}
        />
      )}

      {/* Modal de vista previa del libro */}
      {previewBook && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vista previa: {previewBook.title}
                </h2>
                <button
                  onClick={() => setPreviewBook(null)}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                <BookPreview book={previewBook} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibraryPage;
