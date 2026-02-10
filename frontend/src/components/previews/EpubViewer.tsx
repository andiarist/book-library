import { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface EpubViewerProps {
  bookId: number;
  apiUrl: string; // URL base de tu API, ej: "http://localhost:3001"
}

export const EpubViewer = ({ bookId, apiUrl }: EpubViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const loadBook = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cargar el EPUB desde tu API
        const bookUrl = `${apiUrl}/api/books/${bookId}/file`;
        const epubBook = ePub(bookUrl);

        // Renderizar en el contenedor
        const epubRendition = epubBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: 600,
          spread: 'none', // No mostrar dos páginas a la vez
        });

        // Mostrar la primera página
        await epubRendition.display();

        // Calcular número aproximado de páginas
        const locations = await epubBook.locations.generate(1024);
        setTotalPages(locations.length);

        setBook(epubBook);
        setRendition(epubRendition);
        setIsLoading(false);

        // Listener para actualizar página actual
        epubRendition.on('relocated', () => {
          // Solo actualizar cuando el usuario navega, sin número de página exacto
          setCurrentPage((prev) => prev + 1);
        });
      } catch (err) {
        console.error('Error loading EPUB:', err);
        setError('No se pudo cargar el libro. Verifica que el archivo existe.');
        setIsLoading(false);
      }
    };

    loadBook();

    // Cleanup
    return () => {
      if (rendition) {
        rendition.destroy();
      }
    };
  }, [bookId, apiUrl]);

  const nextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const prevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Cargando libro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Visor */}
      <div
        ref={viewerRef}
        className="overflow-hidden rounded-lg border border-gray-300"
        style={{ minHeight: '600px' }}
      />

      {/* Controles */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          ← Anterior
        </button>

        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};
