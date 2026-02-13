type Props = {
  onRetry: () => void;
  onClearFilters: () => void;
};

export function ErrorState({ onRetry, onClearFilters }: Props) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="mb-4 text-5xl">⚠️</div>
        <h2 className="mb-2 text-xl font-semibold text-red-900">
          Error al cargar los libros
        </h2>
        <p className="mb-6 text-sm text-red-700">
          No se pudieron cargar los libros. Esto puede deberse a un problema de
          conexión o a filtros incompatibles.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
          <button
            onClick={onClearFilters}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Limpiar filtros e intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
