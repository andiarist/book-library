import { Book } from '@/types/books.types';
import { Button } from '../Button';
import { BookForm } from '../forms/BookForm';
import { CoverSearchSection } from './CoverSearchSection';
import { CoverPreview } from './CoverPreview';
import { useEditLibraryBook } from './hooks/useEditLibraryBook';

interface EditLibraryBookModalProps {
  book: Book;
  onClose: () => void;
}

export const EditLibraryBookModal = ({
  book,
  onClose,
}: EditLibraryBookModalProps) => {
  const {
    modalContentRef,
    formData,
    setFormData,
    selectedCoverUrl,
    coverOptions,
    isPending,
    isDeleting,
    isSearchingCovers,
    isSearchingCustomCovers,
    handleSubmit,
    handleSearchCovers,
    handleSearchCustomCovers,
    handleSelectCover,
    handleDelete,
  } = useEditLibraryBook(book, onClose);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      data-testid="edit-library-book-modal"
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
            Editar Libro
          </h2>

          {/* Sección de búsqueda de portadas */}
          <CoverSearchSection
            onSelectCover={handleSelectCover}
            onSearchCovers={handleSearchCovers}
            onSearchCustomCovers={handleSearchCustomCovers}
            isSearchingCovers={isSearchingCovers}
            isSearchingCustomCovers={isSearchingCustomCovers}
            coverOptions={coverOptions}
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Vista previa de portada */}
            <CoverPreview
              currentCoverPath={book.coverPath}
              selectedCoverUrl={selectedCoverUrl}
              bookTitle={formData.title}
              apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
              onSearchClick={handleSearchCovers}
              isSearching={isSearchingCovers}
            />

            {/* Formulario compartido */}
            <BookForm formData={formData} onChange={setFormData} />

            {/* Botones */}
            <div className="mt-6 flex justify-between gap-3">
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? '🗑️ Eliminando...' : '🗑️ Eliminar libro'}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
