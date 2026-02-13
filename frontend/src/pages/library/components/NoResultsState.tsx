import { cn } from '@/helpers/cn';

type Props = {
  onClearFilters: () => void;
};

export function NoResultsState({ onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No se han encontrado resultados
        </h3>
        <p className="mb-6 text-gray-500">
          No hay libros que coincidan con los filtros aplicados.
        </p>
        <button
          onClick={onClearFilters}
          className={cn(
            'rounded-lg bg-blue-600 px-6 py-2.5',
            'font-semibold text-white transition-colors',
            'hover:bg-blue-700 focus:ring-2 focus:outline-none',
            'focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
