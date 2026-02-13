import { SpinnerIcon, UploadIcon } from '@/components/icons';
import { ScanResultsModal } from '@/components/modals/ScanResultsModal';
import { ScanLibraryResult } from '@/api/books.api';
import { cn } from '@/helpers/cn';

type Props = {
  isScanning: boolean;
  onScan: () => void;
  showResults: boolean;
  onCloseResults: () => void;
  scanResults: ScanLibraryResult | null;
};

export function EmptyLibraryState({
  isScanning,
  onScan,
  showResults,
  onCloseResults,
  scanResults,
}: Props) {
  return (
    <>
      <section className="animate-fadeIn p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg">Mi biblioteca (0)</h2>

          <button
            onClick={onScan}
            disabled={isScanning}
            className={cn(
              'flex items-center gap-2 rounded-lg',
              'bg-blue-600 px-4 py-2 font-semibold text-white transition-colors',
              'hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
            )}
          >
            {isScanning ? (
              <>
                <SpinnerIcon className="h-5 w-5 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <UploadIcon className="h-5 w-5" />
                Escanear Biblioteca
              </>
            )}
          </button>
        </div>

        <p className="text-center text-gray-500 italic">
          Aún no has añadido ningún libro. Busca por ISBN o texto para empezar,
          o escanea tu biblioteca.
        </p>
      </section>

      <ScanResultsModal
        isOpen={showResults}
        onClose={onCloseResults}
        results={scanResults}
      />
    </>
  );
}
