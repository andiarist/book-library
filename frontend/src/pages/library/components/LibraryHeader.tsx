import {
  SpinnerIcon,
  UploadIcon,
  GridIcon,
  ListIcon,
} from '@/components/icons';
import { cn } from '@/helpers/cn';
import type { ViewMode } from '../useLibraryPage';

type Props = {
  total: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isScanning: boolean;
  onScan: () => void;
};

export function LibraryHeader({
  total,
  viewMode,
  onChangeViewMode,
  isScanning,
  onScan,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-lg">Mi biblioteca ({total})</h2>

      <div className="flex items-center gap-3">
        {/* Selector de vista */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => onChangeViewMode('grid')}
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Vista en cuadrícula"
          >
            <GridIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => onChangeViewMode('table')}
            className={cn(
              'rounded p-2 transition-colors',
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Vista en tabla"
          >
            <ListIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Botón scan */}
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
    </div>
  );
}
