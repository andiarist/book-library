import { Book, BookMetadata } from '@/types/books.types';
import { Button } from '../Button';
import { BookForm } from '../forms/BookForm';
import { useEditNewBook } from './hooks';

interface EditBookModalProps {
  bookMetadata?: BookMetadata;
  existingBook?: Book;
  onClose: () => void;
}

export const EditBookModal = ({
  bookMetadata,
  existingBook,
  onClose,
}: EditBookModalProps) => {
  const {
    modalContentRef,
    formData,
    setFormData,
    duplicateError,
    isPending,
    handleSubmit,
  } = useEditNewBook(bookMetadata, onClose);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      data-testid="edit-book-modal"
    >
      <div
        ref={modalContentRef}
        className="relative max-h-[90vh] w-full max-w-200 overflow-y-auto rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className="absolute top-4 right-4 z-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-gray-700 text-lg text-white transition-colors duration-200 hover:bg-gray-900"
          onClick={onClose}
        >
          ✕
        </Button>

        <div className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Editar Metadata del Libro
          </h2>

          {/* Mensaje de error de duplicado */}
          {duplicateError && (
            <div className="mb-4 rounded-lg border border-amber-400 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-amber-800">
                    {duplicateError.message}
                  </h3>
                  {duplicateError.book && (
                    <div className="text-sm text-amber-700">
                      <p className="mb-1">
                        <strong>Título:</strong> {duplicateError.book.title}
                      </p>
                      {duplicateError.book.authors &&
                        duplicateError.book.authors.length > 0 && (
                          <p className="mb-1">
                            <strong>Autor(es):</strong>{' '}
                            {duplicateError.book.authors
                              .map((a) => a.name)
                              .join(', ')}
                          </p>
                        )}
                      {duplicateError.book.isbn && (
                        <p className="mb-1">
                          <strong>ISBN:</strong> {duplicateError.book.isbn}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="mt-3 text-sm text-amber-600">
                    Este libro ya está en tu biblioteca. Puedes cerrar este
                    modal y buscarlo en la página de biblioteca.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Imagen de portada */}
            {bookMetadata?.imageUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={bookMetadata.imageUrl}
                  alt={`Portada de ${formData.title}`}
                  className="h-auto w-40 rounded-lg object-cover shadow-md"
                />
              </div>
            )}

            {/* Formulario compartido */}
            <BookForm
              formData={formData}
              onChange={setFormData}
              formatOptions={['EPUB', 'PHYSICAL']}
            />

            {/* Botones */}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {existingBook
                  ? 'Guardar cambios'
                  : 'Guardar y añadir a biblioteca'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
