import {
  Book,
  BookFormat,
  BookMetadata,
  CreateBookDTO,
} from '@/types/books.types';
import { useState, useRef } from 'react';
import { Button } from '../Button';
import { cn } from '@/helpers/cn';
import { Input } from '../Input';
import { useCreateBook } from '@/hooks/useBooks';

interface EditBookModalProps {
  bookMetadata?: BookMetadata;
  existingBook?: Book;
  onClose: () => void;
  //onSave: (data: BookEditData) => void;
}
export interface BookEditData extends BookMetadata {
  saga?: string;
  sagaNumber?: number;
  format?: BookFormat;
}

export const EditBookModal = ({
  bookMetadata,
  existingBook,
  onClose,
  //onSave,
}: EditBookModalProps) => {
  const { mutateAsync, isPending, error } = useCreateBook();
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [duplicateError, setDuplicateError] = useState<{
    message: string;
    book?: Book;
  } | null>(null);
  const [formData, setFormData] = useState<BookEditData>(() => {
    if (bookMetadata) {
      return {
        ...bookMetadata,
        saga: '',
        sagaNumber: undefined,
        format: undefined,
      };
    } else {
      // Fallback (no debería ocurrir)
      return {
        title: '',
        authors: [],
        categories: [],
        saga: '',
        sagaNumber: undefined,
        format: undefined,
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveBook();
  };

  const handleSaveBook = async () => {
    // Limpiar error previo
    setDuplicateError(null);

    //Pasamos formData a CreateBookDTO
    const newBook: CreateBookDTO = {
      title: formData.title,
      authors: formData.authors,
      isbn: formData.isbn,
      publisher: formData.publisher,
      //publishYear: formData.publishedDate,
      pageCount: formData.pageCount,
      format: formData.format || 'PHYSICAL',
      categories: formData.categories || [],

      imageUrl: formData.imageUrl || undefined,
      description: formData.description,

      seriesName: formData.saga,
      seriesOrder: formData.sagaNumber,
    };
    try {
      const book = await mutateAsync(newBook);

      console.log('Libro creado', book);
      // Cerrar modal después de crear exitosamente
      onClose();
    } catch (err: any) {
      console.error(err);

      // ✅ Detectar error de duplicado (HTTP 409)
      if (err?.response?.status === 409) {
        setDuplicateError({
          message:
            err.response.data.message ||
            'Este libro ya existe en tu biblioteca',
          book: err.response.data.book,
        });

        // 📜 Hacer scroll al inicio del modal para mostrar el error
        modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      data-testid="edit-book-modal"
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
            Editar Metadata del Libro
          </h2>

          {/* ⚠️ Mensaje de error de duplicado */}
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
            {formData.imageUrl && (
              <div className="mb-4 flex justify-center">
                <img
                  src={formData.imageUrl}
                  alt={`Portada de ${formData.title}`}
                  className="h-auto w-40 rounded-lg object-cover shadow-md"
                />
              </div>
            )}

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
                value={formData.isbn || ''}
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
                value={formData.publisher || ''}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
              />
            </div>
            {/* Fecha de publicación */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de publicación
              </label>
              <Input
                type="text"
                value={formData.publishedDate || ''}
                onChange={(e) =>
                  setFormData({ ...formData, publishedDate: e.target.value })
                }
                placeholder="Ej: 2023-01-15"
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
                value={formData.categories?.join(', ') || ''}
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Saga
              </label>
              <Input
                type="text"
                value={formData.saga || ''}
                onChange={(e) =>
                  setFormData({ ...formData, saga: e.target.value })
                }
                placeholder="Nombre de la saga"
              />
            </div>

            {/* Número de saga */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Número en la saga
              </label>
              <Input
                type="number"
                value={formData.sagaNumber || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sagaNumber: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Ej: 1, 2, 3..."
              />
            </div>
            {/* Formato (digital/físico) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Formato
              </label>
              <select
                value={formData.format || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    format: e.target.value
                      ? (e.target.value as BookFormat)
                      : undefined,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Seleccionar formato</option>
                <option value="EPUB">Digital</option>
                <option value="PHYSICAL">Físico</option>
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
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
