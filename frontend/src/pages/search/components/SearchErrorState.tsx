interface SearchErrorStateProps {
  error: Error | null;
}

export const SearchErrorState = ({ error }: SearchErrorStateProps) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <div className="mx-auto max-w-md">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-red-900">
          Error en la búsqueda
        </h3>
        <p className="text-red-700">
          {error?.message ||
            'No se pudo completar la búsqueda. Por favor, inténtalo de nuevo.'}
        </p>
      </div>
    </div>
  );
};
