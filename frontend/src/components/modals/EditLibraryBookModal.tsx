import { Book, BookMetadata } from '@/types/books.types';
import { useState, useRef } from 'react';
import { Button } from '../Button';
import { cn } from '@/helpers/cn';
import { Input } from '../Input';
import {
  useUpdateBook,
  useDeleteBook,
  useSearchBookCovers,
  useSearchBookCoversByQuery,
} from '@/hooks/useBooks';
import { SeriesSearchInput } from '../SeriesSearchInput';

interface EditLibraryBookModalProps {
  book: Book;
  onClose: () => void;
}

export const EditLibraryBookModal = ({
  book,
  onClose,
}: EditLibraryBookModalProps) => {
  const { mutateAsync: updateBook, isPending } = useUpdateBook();
  const { mutateAsync: deleteBook, isPending: isDeleting } = useDeleteBook();
  const {
    data: coverOptions,
    refetch: searchCovers,
    isFetching: isSearchingCovers,
  } = useSearchBookCovers(book.id);

  const modalContentRef = useRef<HTMLDivElement>(null);
  const [showCoverSearch, setShowCoverSearch] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customCoverResults, setCustomCoverResults] = useState<
    BookMetadata[] | null
  >(null);

  const { refetch: searchCustomCovers, isFetching: isSearchingCustomCovers } =
    useSearchBookCoversByQuery(customSearchQuery);

  const [formData, setFormData] = useState({
    title: book.title,
    authors: book.authors.map((a) => a.name),
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    publishYear: book.publishYear || undefined,
    pageCount: book.pageCount || undefined,
    description: book.description || '',
    categories: book.categories.map((c) => c.name),
    seriesName: book.series?.name || '',
    seriesOrder: book.seriesOrder || undefined,
    format: book.format,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateBook({
        id: book.id,
        data: {
          title: formData.title,
          authors: formData.authors,
          isbn: formData.isbn || undefined,
          publisher: formData.publisher || undefined,
          publishYear: formData.publishYear,
          pageCount: formData.pageCount,
          description: formData.description || undefined,
          categories: formData.categories,
          seriesName: formData.seriesName || undefined,
          seriesOrder: formData.seriesOrder,
          format: formData.format,
          imageUrl: selectedCoverUrl || undefined,
        },
      });

      onClose();
    } catch (err) {
      console.error('Error al actualizar el libro:', err);
    }
  };

  const handleSearchCovers = async () => {
    setShowCoverSearch(true);
    setCustomCoverResults(null);
    await searchCovers();
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomSearch = async () => {
    if (customSearchQuery.trim().length < 3) return;

    setShowCoverSearch(true);
    const result = await searchCustomCovers();
    if (result.data) {
      setCustomCoverResults(result.data);
    }
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCover = (coverUrl: string) => {
    setSelectedCoverUrl(coverUrl);
    setShowCoverSearch(false);
    setCustomCoverResults(null);
    setCustomSearchQuery('');
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar "${book.title}" de la biblioteca? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await deleteBook(book.id);
        onClose();
      } catch (err) {
        console.error('Error al eliminar el libro:', err);
        alert('Error al eliminar el libro. Por favor, inténtalo de nuevo.');
      }
    }
  };

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
          className={cn(
            'absolute top-4 right-4 z-1 h-8 w-8',
            'flex items-center justify-center',
            'rounded-full border-0 text-lg text-white transition-colors duration-200',
            'cursor-pointer bg-gray-700 hover:bg-gray-900'
          )}
          onClick={onClose}
        >
          ✕
        </Button>

        <div className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Editar Libro
          </h2>

          {/* Búsqueda de portadas - Resultados de búsqueda personalizada */}
          {showCoverSearch &&
            customCoverResults &&
            customCoverResults.length > 0 && (
              <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-purple-900">
                  🔍 Resultados de búsqueda personalizada
                </h3>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {customCoverResults.map((option, idx) => (
                    <div
                      key={idx}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleSelectCover(option.imageUrl!)}
                    >
                      <img
                        src={option.imageUrl!}
                        alt={option.title}
                        className="h-40 w-full rounded-lg object-cover shadow-md"
                        title={`${option.title} - ${option.authors.join(', ')}`}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCoverSearch(false);
                    setCustomCoverResults(null);
                  }}
                  className="mt-4"
                >
                  Cancelar búsqueda
                </Button>
              </div>
            )}

          {/* Búsqueda de portadas - Resultados automáticos */}
          {showCoverSearch &&
            !customCoverResults &&
            coverOptions &&
            coverOptions.length > 0 && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-blue-900">
                  📚 Selecciona una portada
                </h3>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {coverOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleSelectCover(option.imageUrl!)}
                    >
                      <img
                        src={option.imageUrl!}
                        alt={option.title}
                        className="h-40 w-full rounded-lg object-cover shadow-md"
                        title={`${option.title} - ${option.authors.join(', ')}`}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCoverSearch(false)}
                  className="mt-4"
                >
                  Cancelar búsqueda
                </Button>
              </div>
            )}

          {showCoverSearch && coverOptions && coverOptions.length === 0 && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-amber-800">
                ⚠️ No se encontraron portadas para este libro.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCoverSearch(false)}
                className="mt-3"
              >
                Cerrar
              </Button>
            </div>
          )}

          {/* Búsqueda personalizada de portada */}
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              🔍 Búsqueda personalizada de portada
            </label>
            <p className="mb-3 text-xs text-gray-600">
              Busca portadas con una consulta personalizada (título, autor,
              etc.)
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomSearch();
                  }
                }}
                placeholder="Ej: Harry Potter, Tolkien, etc."
                className="flex-1"
              />
              <Button
                type="button"
                variant="primary"
                onClick={handleCustomSearch}
                disabled={
                  isSearchingCustomCovers || customSearchQuery.trim().length < 3
                }
              >
                {isSearchingCustomCovers ? '🔍...' : 'Buscar'}
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Imagen de portada actual o seleccionada */}
            <div className="mb-4 flex items-center gap-4">
              {(selectedCoverUrl || book.coverPath) && (
                <img
                  src={
                    selectedCoverUrl ||
                    `${import.meta.env.VITE_API_BASE_URL}${book.coverPath}`
                  }
                  alt={`Portada de ${formData.title}`}
                  className="h-auto w-32 rounded-lg object-cover shadow-md"
                />
              )}
              <div className="flex flex-col gap-2">
                {selectedCoverUrl && (
                  <p className="text-sm text-green-600">
                    ✓ Nueva portada seleccionada
                  </p>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSearchCovers}
                  disabled={isSearchingCovers}
                >
                  {isSearchingCovers
                    ? '🔍 Buscando...'
                    : book.coverPath
                      ? '🔄 Cambiar portada'
                      : '🔍 Buscar portada'}
                </Button>
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Título *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Autores */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Autor(es) * (separados por coma)
              </label>
              <Input
                type="text"
                value={formData.authors.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authors: e.target.value.split(',').map((a) => a.trim()),
                  })
                }
                required
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                ISBN
              </label>
              <Input
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
              />
            </div>

            {/* Editorial */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Editorial
              </label>
              <Input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
              />
            </div>

            {/* Año de publicación */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Año de publicación
              </label>
              <Input
                type="number"
                value={formData.publishYear || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishYear: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            {/* Número de páginas */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Número de páginas
              </label>
              <Input
                type="number"
                value={formData.pageCount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pageCount: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            {/* Categorías */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Categorías (separadas por coma)
              </label>
              <Input
                type="text"
                value={formData.categories.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categories: e.target.value
                      ? e.target.value.split(',').map((c) => c.trim())
                      : [],
                  })
                }
                placeholder="Ej: Ficción, Aventura, Fantasía"
              />
            </div>

            {/* Saga */}
            <SeriesSearchInput
              value={formData.seriesName}
              onChange={(value) =>
                setFormData({ ...formData, seriesName: value })
              }
              placeholder="Nombre de la saga"
            />

            {/* Número de saga */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Número en la saga
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.seriesOrder || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seriesOrder: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Ej: 1, 1.5, 2, 2.1..."
              />
            </div>

            {/* Formato */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Formato
              </label>
              <select
                value={formData.format}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    format: e.target.value as any,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="EPUB">EPUB</option>
                <option value="PDF">PDF</option>
                <option value="MOBI">MOBI</option>
                <option value="AZW3">AZW3</option>
                <option value="PHYSICAL">Físico</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 focus:border-blue-500 focus:outline-none"
                placeholder="Descripción del libro"
              />
            </div>

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
