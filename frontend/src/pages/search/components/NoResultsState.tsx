interface NoResultsStateProps {
  executedQuery: string;
}

export const NoResultsState = ({ executedQuery }: NoResultsStateProps) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mx-auto max-w-md">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No se encontraron resultados
        </h3>
        <p className="text-gray-600">
          No se encontraron libros para{' '}
          <strong>&ldquo;{executedQuery}&rdquo;</strong>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Intenta con otra búsqueda o utiliza términos más generales
        </p>
      </div>
    </div>
  );
};
