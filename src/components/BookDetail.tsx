import { Book } from '@/types/book';
import { Button } from './Button';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onDelete?: () => void;
}

export function BookDetail({ book, onClose, onDelete }: BookDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-200 overflow-y-auto rounded-xl bg-amber-200 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className="absolute top-4 right-4 z-1 flex h-32 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-gray-700 text-lg text-white transition-colors duration-200 hover:bg-gray-900"
          onClick={onClose}
        >
          ✕
        </Button>

        <div className="p-8">
          <div className="mb-8 flex gap-8 border-b-gray-400 pb-8">
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={`Portada de ${book.title}`}
                className="h-auto w-52 shrink-0 rounded-lg object-cover shadow-lg shadow-black/30"
              />
            )}
            <div className="flex-1">
              <h2 className="leading-1.2 m-0 mb-4 text-3xl">{book.title}</h2>
              {book.authors.length > 0 && (
                <p className="m-0 mb-2 text-lg text-gray-300">
                  {book.authors.join(', ')}
                </p>
              )}
              {book.isbn && (
                <p className="mx-0 my-2 text-base text-gray-500">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {book.description && (
              <div className="">
                <h3 className="m-0 mb-4 text-xl text-blue-300">Descripción</h3>
                <p className="m-0 leading-7 text-gray-300">
                  {book.description}
                </p>
              </div>
            )}

            <div className="">
              <h3 className="m-0 mb-4 text-xl text-blue-300">Información</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                {book.publisher && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Editorial:
                    </span>
                    <span className="text-sm text-white">{book.publisher}</span>
                  </div>
                )}
                {book.publishedDate && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Fecha de publicación:
                    </span>
                    <span className="text-sm text-white">
                      {book.publishedDate}
                    </span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Páginas:
                    </span>
                    <span className="text-sm text-white">{book.pageCount}</span>
                  </div>
                )}
                {book.language && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Idioma:
                    </span>
                    <span className="text-sm text-white">{book.language}</span>
                  </div>
                )}
                {book.fileFormat && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Formato:
                    </span>
                    <span className="text-sm text-white">
                      {book.fileFormat.toUpperCase()}
                    </span>
                  </div>
                )}
                {book.filePath && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">
                      Ruta del archivo:
                    </span>
                    <span className="file-path text-sm text-white">
                      {book.filePath}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="">
                <h3 className="m-0 mb-4 text-xl text-blue-300">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {book.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-gra border border-gray-400 px-4 py-2 text-sm text-gray-200"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="">
              <h3 className="m-0 mb-4 text-xl text-blue-300">Metadata</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-400">
                    Añadido:
                  </span>
                  <span className="text-sm text-white">
                    {formatDate(book.addedAt)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-400">
                    Última modificación:
                  </span>
                  <span className="text-sm text-white">
                    {formatDate(book.lastModified)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {onDelete && (
            <div className="mt-8 flex justify-end border-t border-t-gray-500 pt-8">
              <button
                className="bg-red-400 px-6 py-3 hover:bg-red-500"
                onClick={onDelete}
              >
                🗑️ Eliminar de la biblioteca
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
