export const SearchEmptyState = () => {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Busca libros externos
        </h3>
        <p className="text-gray-600">
          Utiliza el formulario de búsqueda para encontrar libros por título,
          autor o ISBN en fuentes externas como Google Books y Open Library.
        </p>
      </div>
    </div>
  );
};
