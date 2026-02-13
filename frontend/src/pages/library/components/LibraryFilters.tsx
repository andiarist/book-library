import { cn } from '@/helpers/cn';

type Series = {
  id: number;
  name: string;
};

type Props = {
  searchInput: string;
  onChangeSearchInput: (v: string) => void;
  onSearch: () => void;

  searchTerm: string; // para saber si mostrar "Limpiar"
  formatFilter: string;
  onChangeFormat: (v: string) => void;

  seriesFilter: string;
  onChangeSeriesFilter: (v: string) => void;
  seriesList: Series[];

  sortBy: string;
  onChangeSortBy: (v: string) => void;

  sortOrder: 'asc' | 'desc';
  onChangeSortOrder: (v: 'asc' | 'desc') => void;

  onClear: () => void;
};

export function LibraryFilters({
  searchInput,
  onChangeSearchInput,
  onSearch,
  searchTerm,
  formatFilter,
  onChangeFormat,
  seriesFilter,
  onChangeSeriesFilter,
  seriesList,
  sortBy,
  onChangeSortBy,
  sortOrder,
  onChangeSortOrder,
  onClear,
}: Props) {
  const hasFilters = Boolean(searchTerm || formatFilter || seriesFilter);

  return (
    <div className="mb-6 flex flex-wrap gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {/* Búsqueda */}
      <div className="min-w-50 flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Buscar
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onChangeSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
            placeholder="Título o autor..."
            className={cn(
              'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm',
              'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            )}
          />
          <button
            onClick={onSearch}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Filtro por formato */}
      <div className="w-40">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Formato
        </label>
        <select
          value={formatFilter}
          onChange={(e) => onChangeFormat(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          )}
        >
          <option value="">Todos</option>
          <option value="EPUB">EPUB</option>
          <option value="PDF">PDF</option>
          <option value="MOBI">MOBI</option>
          <option value="AZW3">AZW3</option>
          <option value="PHYSICAL">Físico</option>
        </select>
      </div>

      {/* Filtro por serie */}
      <div className="w-48">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Serie
        </label>
        <select
          value={seriesFilter}
          onChange={(e) => onChangeSeriesFilter(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          )}
        >
          <option value="">Todas</option>
          {seriesList.map((series) => (
            <option key={series.id} value={series.id.toString()}>
              {series.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ordenar por */}
      <div className="w-48">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Ordenar por
        </label>
        <select
          value={sortBy}
          onChange={(e) => onChangeSortBy(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          )}
        >
          <option value="createdAt">Fecha de creación</option>
          <option value="title">Título</option>
          <option value="author">Autor</option>
          <option value="series">Serie</option>
          <option value="publishYear">Año publicación</option>
        </select>
      </div>

      {/* Orden */}
      <div className="w-32">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Orden
        </label>
        <select
          value={sortOrder}
          onChange={(e) => onChangeSortOrder(e.target.value as 'asc' | 'desc')}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
            'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
          )}
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>

      {/* Botón para limpiar filtros */}
      {hasFilters && (
        <div className="flex items-end">
          <button
            onClick={onClear}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
