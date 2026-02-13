type Props = {
  currentPage: number;
  itemsPerPage: number;
  total: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function LibraryPagination({
  currentPage,
  itemsPerPage,
  total,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Mostrando {from} - {to} de {total} libros
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
