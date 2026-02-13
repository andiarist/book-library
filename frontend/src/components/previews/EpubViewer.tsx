import { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';

interface EpubViewerProps {
  bookId: number;
  apiUrl: string;
  maxPages?: number;
}

export const EpubViewer = ({
  bookId,
  apiUrl,
  maxPages = 10,
}: EpubViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  const loadingRef = useRef(false);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationsReady, setLocationsReady] = useState(false);

  const debug = (err: unknown) => {
    if (import.meta.env.DEV) console.debug('[EpubViewer]', err);
  };

  useEffect(() => {
    if (loadingRef.current) return;

    let cancelled = false;
    const controller = new AbortController();

    const destroy = () => {
      try {
        renditionRef.current?.destroy();
      } catch (err) {
        debug(err);
      }
      renditionRef.current = null;

      try {
        (bookRef.current as any)?.destroy?.();
      } catch (err) {
        debug(err);
      }
      bookRef.current = null;
    };

    const load = async () => {
      loadingRef.current = true;

      setIsLoading(true);
      setError(null);
      setLocationsReady(false);
      setCurrentPage(1);
      setTotalPages(0);

      if (!viewerRef.current) {
        setError('Error al inicializar el visor');
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      destroy();

      const bookUrl = `${apiUrl}/api/books/${bookId}/file.epub`;
      const epubBook = ePub(bookUrl, { openAs: 'epub' });
      await epubBook.ready;

      try {
        let epubBook: Book;

        // URL-first + fallback a ArrayBuffer
        try {
          epubBook = ePub(bookUrl);
          await epubBook.ready;
        } catch (err) {
          debug(err);
          const res = await fetch(bookUrl, { signal: controller.signal });
          if (!res.ok)
            throw new Error(`Error al descargar el archivo: ${res.status}`);
          const buf = await res.arrayBuffer();
          if (cancelled) return;
          epubBook = ePub(buf);
          await epubBook.ready;
        }

        if (cancelled) return;
        bookRef.current = epubBook;

        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: 600,
          spread: 'none',
          allowScriptedContent: false,
        });
        renditionRef.current = rendition;

        let limitedTotal = maxPages;

        try {
          const locations = await epubBook.locations.generate(1024);
          limitedTotal = Math.min(locations.length || maxPages, maxPages);
        } catch (err) {
          debug(err);
          limitedTotal = maxPages;
        }

        if (cancelled) return;
        setTotalPages(limitedTotal);

        const onRelocated = (location: any) => {
          try {
            const locNum = epubBook.locations.locationFromCfi(
              location?.start?.cfi
            );
            const page = typeof locNum === 'number' ? locNum : 1;
            const clamped = Math.max(1, Math.min(page || 1, limitedTotal));
            setCurrentPage(clamped);
          } catch (err) {
            debug(err);
          }
        };

        rendition.on('relocated', onRelocated);

        await rendition.display();
        if (cancelled) return;

        // salto suave de portada (si falla, no es crítico)
        try {
          await rendition.next();
        } catch (err) {
          debug(err);
        }

        if (cancelled) return;

        setLocationsReady(true);
        setIsLoading(false);

        return () => {
          try {
            rendition.off('relocated', onRelocated);
          } catch (err) {
            debug(err);
          }
        };
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        if (!cancelled) {
          setError(`No se pudo cargar el libro: ${msg}`);
          setIsLoading(false);
        }
      } finally {
        loadingRef.current = false;
      }
    };

    let off: void | (() => void);
    load().then((cleanup) => {
      off = cleanup;
    });

    return () => {
      cancelled = true;
      controller.abort();
      if (off) off();
      destroy();
      loadingRef.current = false;
    };
  }, [bookId, apiUrl, maxPages]);

  const nextPage = () => {
    const r = renditionRef.current;
    if (r && locationsReady && currentPage < totalPages) r.next();
  };

  const prevPage = () => {
    const r = renditionRef.current;
    if (r && locationsReady && currentPage > 1) r.prev();
  };

  const isLastPage = totalPages > 0 && currentPage >= totalPages;
  const isFirstPage = currentPage <= 1;

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Cargando vista previa...</p>
          <p className="text-xs text-gray-400">
            Solo se mostrarán las primeras {maxPages} páginas
          </p>
        </div>
      )}

      {error && (
        <div className="flex h-96 flex-col items-center justify-center gap-2">
          <p className="text-red-500">{error}</p>
          <p className="text-xs text-gray-500">
            Verifica que el archivo existe y la API está funcionando
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            📖 Vista previa limitada: Solo puedes navegar las primeras{' '}
            {maxPages} páginas del libro
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevPage}
              disabled={!locationsReady || isFirstPage}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              ← Anterior
            </button>

            <span className="text-sm text-gray-600">
              {locationsReady ? (
                <>
                  Página {currentPage} de {totalPages || maxPages}
                </>
              ) : (
                <>Preparando navegación...</>
              )}
            </span>

            <button
              onClick={nextPage}
              disabled={!locationsReady || isLastPage}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Siguiente →
            </button>
          </div>

          {isLastPage && currentPage > 1 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-600">
              Has alcanzado el límite de la vista previa. Para ver el libro
              completo, ábrelo con tu lector EPUB favorito.
            </div>
          )}
        </>
      )}

      <div
        ref={viewerRef}
        className={`overflow-hidden rounded-lg border border-gray-300 ${isLoading || error ? 'hidden' : ''}`}
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};
