import { EmptyLibraryState } from './components/EmptyLibraryState';
import { LibraryContent } from './components/LibraryContent';
import { LibraryFilters } from './components/LibraryFilters';
import { LibraryHeader } from './components/LibraryHeader';
import { LibraryModalHost } from './components/LibraryModalHost';
import { LibraryPagination } from './components/LibraryPagination';
import { useLibraryPage } from './useLibraryPage';

const LibraryPage = () => {
  const vm = useLibraryPage();

  if (vm.isLoading) return <div>Cargando libros...</div>;
  if (vm.isError) return <div>Error al cargar los libros</div>;

  const total = vm.pagination?.total || 0;

  if (!vm.data || vm.books.length === 0) {
    return (
      <EmptyLibraryState
        isScanning={vm.isScanning}
        onScan={vm.handleScanLibrary}
        showResults={vm.showResults}
        onCloseResults={() => vm.setShowResults(false)}
        scanResults={vm.scanResults}
      />
    );
  }

  return (
    <>
      <section className="animate-fadeIn p-6">
        <LibraryHeader
          total={total}
          viewMode={vm.viewMode}
          onChangeViewMode={vm.setViewMode}
          isScanning={vm.isScanning}
          onScan={vm.handleScanLibrary}
        />

        <LibraryFilters
          searchInput={vm.searchInput}
          onChangeSearchInput={vm.setSearchInput}
          onSearch={vm.handleSearch}
          searchTerm={vm.searchTerm}
          formatFilter={vm.formatFilter}
          onChangeFormat={(v) => {
            vm.setFormatFilter(v);
            vm.setCurrentPage(1);
          }}
          sortBy={vm.sortBy}
          onChangeSortBy={vm.setSortBy}
          sortOrder={vm.sortOrder}
          onChangeSortOrder={vm.setSortOrder}
          onClear={vm.clearFilters}
        />

        <LibraryContent
          viewMode={vm.viewMode}
          books={vm.books}
          currentPage={vm.currentPage}
          itemsPerPage={vm.itemsPerPage}
          onViewDetail={(b) => vm.setSelectedBook(b)}
          onEdit={(b) => vm.setEditingBook(b)}
          onPreview={(b) => vm.setPreviewBook(b)}
          onDelete={vm.handleDeleteBook}
        />

        {vm.pagination && (
          <LibraryPagination
            currentPage={vm.currentPage}
            itemsPerPage={vm.itemsPerPage}
            total={vm.pagination.total}
            totalPages={vm.pagination.totalPages}
            onPrev={() => vm.setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              vm.setCurrentPage((p) =>
                Math.min(vm.pagination!.totalPages, p + 1)
              )
            }
          />
        )}
      </section>

      <LibraryModalHost
        books={vm.books}
        showResults={vm.showResults}
        onCloseResults={() => vm.setShowResults(false)}
        scanResults={vm.scanResults}
        selectedBook={vm.selectedBook}
        onCloseSelected={() => vm.setSelectedBook(null)}
        onEditFromDetail={(book) => {
          vm.setEditingBook(book);
          vm.setSelectedBook(null);
        }}
        editingBook={vm.editingBook}
        onCloseEditing={() => {
          vm.setEditingBook(null);
          vm.refetch(); // mantiene tu comportamiento actual
        }}
        previewBook={vm.previewBook}
        onClosePreview={() => vm.setPreviewBook(null)}
      />
    </>
  );
};

export default LibraryPage;
