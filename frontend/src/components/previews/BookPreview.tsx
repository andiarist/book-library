import { Book } from '@/types/books.types';
import { EpubViewer } from './EpubViewer';
import { PdfViewer } from './PdfViewer';

interface BookPreviewProps {
  book: Book;
  apiUrl?: string; // URL base de tu API
}

export const BookPreview = ({ book }: BookPreviewProps) => {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
  // Solo mostrar vista previa si es un libro digital con archivo
  if (!book.filePath) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">
          📚 Este libro no tiene archivo digital asociado
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Los libros físicos o sin archivo no pueden mostrarse en vista previa
        </p>
      </div>
    );
  }

  // Renderizar según formato
  switch (book.format) {
    case 'EPUB':
      return (
        <div data-testid="book-preview-epub">
          <h3 className="mb-4 text-lg font-semibold">
            Vista previa: {book.title}
          </h3>
          <EpubViewer bookId={book.id} apiUrl={apiUrl} />
        </div>
      );

    case 'PDF':
      return (
        <div data-testid="book-preview-pdf">
          <h3 className="mb-4 text-lg font-semibold">
            Vista previa: {book.title}
          </h3>
          <PdfViewer
            bookId={book.id}
            apiUrl={apiUrl}
            maxPreviewPages={20} // Limitar a 20 páginas
          />
        </div>
      );

    case 'MOBI':
    case 'AZW3':
      return (
        <div
          className="rounded-lg border border-yellow-200 bg-yellow-50 p-8 text-center"
          data-testid="book-preview-otros"
        >
          <p className="font-medium text-yellow-800">
            ⚠️ Vista previa no disponible para archivos {book.format}
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            Los formatos MOBI y AZW3 requieren conversión a EPUB o PDF para
            visualización en navegador
          </p>
        </div>
      );

    case 'PHYSICAL':
      return (
        <div
          className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center"
          data-testid="book-preview-fisico"
        >
          <p className="text-gray-600">📖 Este es un libro físico</p>
          <p className="mt-2 text-sm text-gray-500">
            No hay archivo digital para mostrar
          </p>
        </div>
      );

    default:
      return (
        <div
          className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center"
          data-testid="book-preview-default"
        >
          <p className="text-gray-600">Vista previa no disponible</p>
        </div>
      );
  }
};
