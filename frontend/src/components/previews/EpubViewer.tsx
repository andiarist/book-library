import { useEffect, useRef, useState } from 'react';
import ePub, { Rendition } from 'epubjs';

interface EpubViewerProps {
  bookId: number;
  apiUrl: string; // URL base de tu API, ej: "http://localhost:3001"
  maxPages?: number; // Número máximo de páginas para navegar (por defecto 10)
}

export const EpubViewer = ({
  bookId,
  apiUrl,
  maxPages = 10,
}: EpubViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false); // Flag para evitar cargas duplicadas
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationsReady, setLocationsReady] = useState(false);

  useEffect(() => {
    // Evitar cargas duplicadas (React 18 Strict Mode ejecuta efectos 2 veces en dev)
    if (isLoadingRef.current) {
      console.log('⚠️ Ya hay una carga en progreso, ignorando...');
      return;
    }

    const loadBook = async () => {
      isLoadingRef.current = true;
      console.log('🚀 Iniciando carga del libro...');

      // Pequeña espera para asegurar que el DOM está listo
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!viewerRef.current) {
        console.error('❌ El ref nunca se inicializó');
        setError('Error al inicializar el visor');
        setIsLoading(false);
        isLoadingRef.current = false;
        return;
      }

      console.log('✅ Ref disponible, continuando con la carga...');

      try {
        setIsLoading(true);
        setError(null);

        // Cargar el EPUB desde tu API
        const bookUrl = `${apiUrl}/api/books/${bookId}/file`;
        console.log('📚 Descargando EPUB desde:', bookUrl);

        const response = await fetch(bookUrl);
        if (!response.ok) {
          throw new Error(`Error al descargar el archivo: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        console.log(
          '✅ Archivo descargado:',
          (arrayBuffer.byteLength / 1024 / 1024).toFixed(2),
          'MB'
        );

        const epubBook = ePub(arrayBuffer);

        // Escuchar errores del libro
        epubBook.ready.catch((err: Error) => {
          console.error('❌ Error en book.ready:', err);
          throw new Error(`Error al preparar el libro: ${err.message}`);
        });

        await epubBook.ready;
        console.log('✅ Libro listo');

        // Renderizar en el contenedor con allowScriptedContent
        const epubRendition = epubBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: 600,
          spread: 'none',
          allowScriptedContent: true, // Permitir scripts en el iframe
        });

        // Calcular número aproximado de páginas ANTES de display
        let actualTotalPages = maxPages;
        try {
          console.log('📊 Generando índice de páginas...');
          const locations = await epubBook.locations.generate(1024);
          actualTotalPages = Math.min(locations.length, maxPages);
          setTotalPages(actualTotalPages);
          console.log(
            `✅ Vista previa: ${maxPages} de ${locations.length} páginas totales`
          );

          // Listener para actualizar página actual (después de generar locations)
          epubRendition.on('relocated', (location: any) => {
            try {
              const loc = epubBook.locations.locationFromCfi(
                location.start.cfi
              );
              // locationFromCfi puede devolver 0, -1 o el número de página
              if (typeof loc === 'number') {
                // Asegurar que la página es al menos 1 y máximo actualTotalPages
                const limitedPage = Math.max(
                  1,
                  Math.min(loc || 1, actualTotalPages)
                );
                console.log(`📄 Navegando a página: ${limitedPage}`);
                setCurrentPage(limitedPage);
              }
            } catch (e) {
              console.warn('No se pudo obtener la ubicación exacta', e);
            }
          });
        } catch (locError) {
          console.warn('⚠️ No se pudo generar el índice de páginas');
          setTotalPages(maxPages);
        }

        // Mostrar primera página y luego navegar a la segunda
        await epubRendition.display();
        console.log('✅ Primera página cargada, navegando a página 2...');

        // Navegar a la segunda página para saltarse la portada
        await epubRendition.next();
        console.log('✅ Mostrando página 2');

        setRendition(epubRendition);
        setIsLoading(false);

        // Forzar actualización de la página actual y marcar locations como listo
        setTimeout(() => {
          const currentLocation = epubRendition.currentLocation();
          if (currentLocation && (currentLocation as any).start) {
            try {
              const loc = epubBook.locations.locationFromCfi(
                (currentLocation as any).start.cfi
              );
              if (typeof loc === 'number') {
                const page = Math.max(1, Math.min(loc || 1, actualTotalPages));
                console.log(`📍 Página inicial establecida: ${page}`);
                setCurrentPage(page);
              } else {
                console.log('📍 Estableciendo página por defecto: 2');
                setCurrentPage(2);
              }
            } catch (e) {
              console.log('📍 Estableciendo página por defecto: 2');
              setCurrentPage(2);
            }
          } else {
            console.log('📍 Estableciendo página por defecto: 2');
            setCurrentPage(2);
          }

          // Marcar que el sistema de locations está listo
          setLocationsReady(true);
          console.log('✅ Sistema de navegación listo');
        }, 500);
      } catch (err) {
        console.error('❌ Error loading EPUB:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Error desconocido';
        setError(`No se pudo cargar el libro: ${errorMessage}`);
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadBook();

    // Cleanup
    return () => {
      if (rendition) {
        console.log('🧹 Limpiando rendition');
        rendition.destroy();
      }
      isLoadingRef.current = false;
    };
  }, [bookId, apiUrl, maxPages]);

  const nextPage = () => {
    if (rendition && locationsReady && currentPage < totalPages) {
      console.log(`➡️ Siguiente página (actual: ${currentPage})`);
      rendition.next();
    }
  };

  const prevPage = () => {
    if (rendition && locationsReady && currentPage > 1) {
      console.log(`⬅️ Página anterior (actual: ${currentPage})`);
      rendition.prev();
    }
  };

  // Verificar si estamos en la última página permitida
  const isLastPage = currentPage >= totalPages;
  const isFirstPage = currentPage <= 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Mensaje de carga */}
      {isLoading && (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <p className="text-gray-500">Cargando vista previa...</p>
          <p className="text-xs text-gray-400">
            Solo se mostrarán las primeras {maxPages} páginas
          </p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="flex h-96 flex-col items-center justify-center gap-2">
          <p className="text-red-500">{error}</p>
          <p className="text-xs text-gray-500">
            Verifica que el archivo existe y la API está funcionando
          </p>
        </div>
      )}

      {/* Aviso de vista previa limitada */}
      {!isLoading && !error && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          📖 Vista previa limitada: Solo puedes navegar las primeras {maxPages}{' '}
          páginas del libro
        </div>
      )}

      {/* Controles - solo visibles cuando no hay error ni carga */}
      {!isLoading && !error && (
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
                Página {currentPage} de {totalPages}
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
      )}

      {/* Mensaje cuando se alcanza el límite */}
      {!isLoading && !error && isLastPage && currentPage > 1 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center text-sm text-gray-600">
          Has alcanzado el límite de la vista previa. Para ver el libro
          completo, ábrelo con tu lector EPUB favorito.
        </div>
      )}

      {/* Visor - siempre renderizado para que el ref esté disponible */}
      <div
        ref={viewerRef}
        className={`overflow-hidden rounded-lg border border-gray-300 ${isLoading || error ? 'hidden' : ''}`}
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};
