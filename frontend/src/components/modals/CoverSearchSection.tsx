import { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { BookMetadata } from '@/types/books.types';

interface CoverSearchSectionProps {
  onSelectCover: (coverUrl: string) => void;
  onSearchCovers: () => Promise<void>;
  onSearchCustomCovers: (query: string) => Promise<BookMetadata[] | undefined>;
  isSearchingCovers: boolean;
  isSearchingCustomCovers: boolean;
  coverOptions?: BookMetadata[];
}

export const CoverSearchSection = ({
  onSelectCover,
  onSearchCovers,
  onSearchCustomCovers,
  isSearchingCovers,
  isSearchingCustomCovers,
  coverOptions,
}: CoverSearchSectionProps) => {
  const [showCoverSearch, setShowCoverSearch] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customCoverResults, setCustomCoverResults] = useState<
    BookMetadata[] | null
  >(null);

  const handleSearchCovers = async () => {
    setShowCoverSearch(true);
    setCustomCoverResults(null);
    await onSearchCovers();
  };

  const handleCustomSearch = async () => {
    if (customSearchQuery.trim().length < 3) return;

    setShowCoverSearch(true);
    const results = await onSearchCustomCovers(customSearchQuery);
    if (results) {
      setCustomCoverResults(results);
    }
  };

  const handleSelectCover = (coverUrl: string) => {
    onSelectCover(coverUrl);
    setShowCoverSearch(false);
    setCustomCoverResults(null);
    setCustomSearchQuery('');
  };

  const handleCancelSearch = () => {
    setShowCoverSearch(false);
    setCustomCoverResults(null);
  };

  return (
    <>
      {/* Búsqueda de portadas - Resultados de búsqueda personalizada */}
      {showCoverSearch &&
        customCoverResults &&
        customCoverResults.length > 0 && (
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-purple-900">
              🔍 Resultados de búsqueda personalizada
            </h3>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {customCoverResults.map((option, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleSelectCover(option.imageUrl!)}
                >
                  <img
                    src={option.imageUrl!}
                    alt={option.title}
                    className="h-40 w-full rounded-lg object-cover shadow-md"
                    title={`${option.title} - ${option.authors.join(', ')}`}
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelSearch}
              className="mt-4"
            >
              Cancelar búsqueda
            </Button>
          </div>
        )}

      {/* Búsqueda de portadas - Resultados automáticos */}
      {showCoverSearch &&
        !customCoverResults &&
        coverOptions &&
        coverOptions.length > 0 && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">
              📚 Selecciona una portada
            </h3>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {coverOptions.map((option, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleSelectCover(option.imageUrl!)}
                >
                  <img
                    src={option.imageUrl!}
                    alt={option.title}
                    className="h-40 w-full rounded-lg object-cover shadow-md"
                    title={`${option.title} - ${option.authors.join(', ')}`}
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCoverSearch(false)}
              className="mt-4"
            >
              Cancelar búsqueda
            </Button>
          </div>
        )}

      {showCoverSearch && coverOptions && coverOptions.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-800">
            ⚠️ No se encontraron portadas para este libro.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowCoverSearch(false)}
            className="mt-3"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Búsqueda personalizada de portada */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          🔍 Búsqueda personalizada de portada
        </label>
        <p className="mb-3 text-xs text-gray-600">
          Busca portadas con una consulta personalizada (título, autor, etc.)
        </p>
        <div className="flex gap-2">
          <Input
            type="text"
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomSearch();
              }
            }}
            placeholder="Ej: Harry Potter, Tolkien, etc."
            className="flex-1"
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleCustomSearch}
            disabled={
              isSearchingCustomCovers || customSearchQuery.trim().length < 3
            }
          >
            {isSearchingCustomCovers ? '🔍...' : 'Buscar'}
          </Button>
        </div>
      </div>

      {/* Botón de búsqueda de portadas */}
      <Button
        type="button"
        variant="primary"
        onClick={handleSearchCovers}
        disabled={isSearchingCovers}
        className="mb-4"
      >
        {isSearchingCovers ? '🔍 Buscando...' : '🔍 Buscar portadas'}
      </Button>
    </>
  );
};
