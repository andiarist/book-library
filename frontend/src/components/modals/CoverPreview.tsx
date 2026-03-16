import { Button } from '../Button';

interface CoverPreviewProps {
  currentCoverPath?: string | null;
  selectedCoverUrl?: string | null;
  bookTitle: string;
  apiBaseUrl: string;
  onSearchClick: () => void;
  isSearching: boolean;
}

export const CoverPreview = ({
  currentCoverPath,
  selectedCoverUrl,
  bookTitle,
  apiBaseUrl,
  onSearchClick,
  isSearching,
}: CoverPreviewProps) => {
  const displayCover = selectedCoverUrl || currentCoverPath;

  if (!displayCover && !selectedCoverUrl) {
    return (
      <div className="mb-4">
        <Button
          type="button"
          variant="primary"
          onClick={onSearchClick}
          disabled={isSearching}
        >
          {isSearching ? '🔍 Buscando...' : '🔍 Buscar portada'}
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-4">
      {displayCover && (
        <img
          src={selectedCoverUrl || `${apiBaseUrl}${currentCoverPath}`}
          alt={`Portada de ${bookTitle}`}
          className="h-auto w-32 rounded-lg object-cover shadow-md"
        />
      )}
      <div className="flex flex-col gap-2">
        {selectedCoverUrl && (
          <p className="text-sm text-green-600">✓ Nueva portada seleccionada</p>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={onSearchClick}
          disabled={isSearching}
        >
          {isSearching
            ? '🔍 Buscando...'
            : currentCoverPath
              ? '🔄 Cambiar portada'
              : '🔍 Buscar portada'}
        </Button>
      </div>
    </div>
  );
};
