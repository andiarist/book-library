import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  bookId: number;
  apiUrl: string;
  maxPreviewPages?: number; // Limitar vista previa
}

export const PdfViewer = ({
  bookId,
  apiUrl,
  maxPreviewPages = 20, // Por defecto, máximo 20 páginas de vista previa
}: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pdfUrl = `${apiUrl}/api/books/${bookId}/file`;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    // Limitar a las primeras N páginas para vista previa
    const allowedPages = Math.min(numPages, maxPreviewPages);
    setNumPages(allowedPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('No se pudo cargar el PDF. Verifica que el archivo existe.');
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Información de vista previa limitada */}
      {!isLoading && (
        <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
          ℹ️ Vista previa limitada a las primeras {maxPreviewPages} páginas
        </div>
      )}

      {/* Visor */}
      <div className="flex items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50">
        {isLoading && (
          <div className="py-20">
            <p className="text-gray-500">Cargando PDF...</p>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="py-20 text-gray-500">Cargando PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={800} // Ancho fijo para mejor visualización
          />
        </Document>
      </div>

      {/* Controles */}
      {!isLoading && numPages > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPageNumber(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            ← Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {pageNumber} de {numPages}
          </span>

          <button
            onClick={() => setPageNumber(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};
