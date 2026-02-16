import { useState, useRef, useEffect } from 'react';
import { Input } from './Input';
import { useSeries } from '@/hooks/useSeries';

interface SeriesSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const SeriesSearchInput = ({
  value,
  onChange,
  placeholder = 'Nombre de la serie',
  label = 'Serie',
}: SeriesSearchInputProps) => {
  const { data: seriesList, isLoading } = useSeries();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSeries, setFilteredSeries] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar series según el texto introducido
  useEffect(() => {
    if (!seriesList || !value) {
      setFilteredSeries([]);
      return;
    }

    const searchText = value.toLowerCase().trim();
    const filtered = seriesList.filter((series) =>
      series.name.toLowerCase().includes(searchText)
    );

    setFilteredSeries(filtered);
  }, [value, seriesList]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleSelectSeries = (seriesName: string) => {
    onChange(seriesName);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (seriesList && seriesList.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && (
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && filteredSeries.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            {filteredSeries.map((series) => (
              <button
                key={series.id}
                type="button"
                onClick={() => handleSelectSeries(series.name)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                {series.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay coincidencias pero hay texto */}
      {showDropdown &&
        value.trim().length > 0 &&
        filteredSeries.length === 0 &&
        !isLoading &&
        seriesList &&
        seriesList.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
            No se encontró ninguna serie que coincida. Puedes crear una nueva
            escribiendo el nombre.
          </div>
        )}

      {/* Mensaje cuando se hace foco y hay series disponibles */}
      {showDropdown &&
        !value &&
        seriesList &&
        seriesList.length > 0 &&
        !isLoading && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
            <div className="px-4 py-2 text-xs font-medium text-gray-500">
              Series existentes ({seriesList.length})
            </div>
            <div className="py-1">
              {seriesList.map((series) => (
                <button
                  key={series.id}
                  type="button"
                  onClick={() => handleSelectSeries(series.name)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {series.name}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
