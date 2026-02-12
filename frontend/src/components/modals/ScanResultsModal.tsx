import { ScanLibraryResult } from '@/api/books.api';

interface ScanResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ScanLibraryResult | null;
}

export const ScanResultsModal = ({
  isOpen,
  onClose,
  results,
}: ScanResultsModalProps) => {
  if (!isOpen || !results) return null;

  const getStatusIcon = (status: 'added' | 'skipped' | 'error') => {
    switch (status) {
      case 'added':
        return '✅';
      case 'skipped':
        return '⏭️';
      case 'error':
        return '❌';
    }
  };

  const getStatusColor = (status: 'added' | 'skipped' | 'error') => {
    switch (status) {
      case 'added':
        return 'text-green-600';
      case 'skipped':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
      data-testid="scan-results-modal"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              📚 Resultados del Escaneo
            </h2>
            <button
              onClick={onClose}
              className="text-2xl leading-none text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">{results.libraryPath}</p>
        </div>

        {/* Summary */}
        <div className="border-b bg-gray-50 p-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {results.total}
              </div>
              <div className="text-sm text-gray-600">Total archivos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {results.added}
              </div>
              <div className="text-sm text-gray-600">Añadidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {results.skipped}
              </div>
              <div className="text-sm text-gray-600">Omitidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {results.deleted}
              </div>
              <div className="text-sm text-gray-600">Eliminados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {results.errors + results.deletionErrors}
              </div>
              <div className="text-sm text-gray-600">Errores</div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Archivos escaneados */}
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Archivos escaneados
          </h3>
          <div className="mb-6 space-y-2">
            {results.details.map((detail, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getStatusIcon(detail.status)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-gray-800">
                      {detail.file}
                    </div>
                    {detail.reason && (
                      <div
                        className={`mt-1 text-sm ${getStatusColor(detail.status)}`}
                      >
                        {detail.reason}
                      </div>
                    )}
                    {detail.bookId && (
                      <div className="mt-1 text-xs text-gray-500">
                        ID: {detail.bookId}
                      </div>
                    )}
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      detail.status === 'added'
                        ? 'bg-green-100 text-green-700'
                        : detail.status === 'skipped'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {detail.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Libros huérfanos eliminados */}
          {results.orphanedBooks && results.orphanedBooks.length > 0 && (
            <>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                🗑️ Libros huérfanos eliminados
              </h3>
              <div className="space-y-2">
                {results.orphanedBooks.map((orphan, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-purple-200 bg-purple-50 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {orphan.status === 'deleted' ? '🗑️' : '❌'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-800">
                          {orphan.title}
                        </div>
                        <div className="mt-1 truncate text-sm text-gray-600">
                          📁 {orphan.filePath}
                        </div>
                        {orphan.reason && (
                          <div className="mt-1 text-sm text-red-600">
                            {orphan.reason}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                          ID: {orphan.bookId}
                        </div>
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          orphan.status === 'deleted'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {orphan.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
