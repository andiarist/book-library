import { EditBookModal } from '@/components/modals/EditBookModal';
import { NoResultsState } from '@/components/NoResultsState';
import {
  SearchForm,
  SearchResults,
  SearchEmptyState,
  SearchLoadingState,
  SearchErrorState,
} from './components';
import { useSearchPage } from './useSearchPage';

export const SearchPage = () => {
  const {
    query,
    executedQuery,
    books,
    isFetching,
    isError,
    error,
    hasSearched,
    editingBook,
    handleSubmit,
    handleQueryChange,
    handleReset,
    handleAddBook,
    handleCloseModal,
  } = useSearchPage();

  return (
    <section className="animate-fadeIn rounded-lg p-8">
      <SearchForm
        query={query}
        isFetching={isFetching}
        hasSearched={hasSearched}
        onQueryChange={handleQueryChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0">Resultado:</h3>
        </div>

        {/* Estado de carga */}
        {isFetching && <SearchLoadingState />}

        {/* Estado de error */}
        {!isFetching && isError && <SearchErrorState error={error} />}

        {/* Estado inicial - sin búsqueda realizada */}
        {!isFetching && !isError && !hasSearched && <SearchEmptyState />}

        {/* Estado sin resultados */}
        {!isFetching &&
          !isError &&
          hasSearched &&
          (!books || books.length === 0) && (
            <NoResultsState
              message={
                <>
                  No se encontraron libros para{' '}
                  <strong>&ldquo;{executedQuery}&rdquo;</strong>
                </>
              }
              suggestion="Intenta con otra búsqueda o utiliza términos más generales"
              variant="bordered"
            />
          )}

        {/* Resultados de búsqueda */}
        {!isFetching && !isError && books && books.length > 0 && (
          <SearchResults books={books} onAddBook={handleAddBook} />
        )}
      </div>

      {/* Modal de edición antes de añadir a biblioteca */}
      {editingBook && (
        <EditBookModal bookMetadata={editingBook} onClose={handleCloseModal} />
      )}
    </section>
  );
};
