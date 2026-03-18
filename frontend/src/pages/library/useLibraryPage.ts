import { useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useSeries } from '@/hooks/useSeries';
import { deleteBook } from '@/api/books.api';
import { Book } from '@/types/books.types';
import { useLibraryFilters } from './hooks/useLibraryFilters';
import { useLibraryScanner } from './hooks/useLibraryScanner';
import { useLibraryModals } from './hooks/useLibraryModals';

export type ViewMode = 'grid' | 'table';

const ITEMS_PER_PAGE = 20;

export function useLibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Compose specialized hooks
  const filters = useLibraryFilters();
  const scanner = useLibraryScanner();
  const modals = useLibraryModals();

  // Data fetching
  const { data, isLoading, isError, refetch } = useBooks(
    filters.currentPage,
    ITEMS_PER_PAGE,
    filters.queryParams
  );

  const { data: seriesList = [] } = useSeries();

  const books = data?.data ?? [];
  const pagination = data?.pagination;

  // Actions
  const handleScanLibrary = async () => {
    await scanner.handleScanLibrary(refetch);
  };

  const handleDeleteBook = async (book: Book) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar "${book.title}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteBook(book.id);
      refetch();
    } catch (error) {
      console.error('Error al eliminar libro:', error);
      alert('Error al eliminar el libro. Revisa la consola para más detalles.');
    }
  };

  return {
    // Data
    data,
    books,
    pagination,
    seriesList,
    isLoading,
    isError,

    // View mode
    viewMode,
    setViewMode,

    // Pagination
    currentPage: filters.currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage: filters.setCurrentPage,

    // Search & Filters
    searchInput: filters.searchInput,
    setSearchInput: filters.setSearchInput,
    searchTerm: filters.searchTerm,
    formatFilter: filters.formatFilter,
    setFormatFilter: filters.setFormatFilter,
    seriesFilter: filters.seriesFilter,
    setSeriesFilter: filters.setSeriesFilter,
    handleSearch: filters.handleSearch,
    clearFilters: filters.clearFilters,

    // Sorting
    sortBy: filters.sortBy,
    setSortBy: filters.setSortBy,
    sortOrder: filters.sortOrder,
    setSortOrder: filters.setSortOrder,

    // Scanner
    isScanning: scanner.isScanning,
    scanResults: scanner.scanResults,
    showResults: scanner.showResults,
    setShowResults: scanner.setShowResults,
    handleScanLibrary,

    // Modals
    selectedBook: modals.selectedBook,
    setSelectedBook: modals.setSelectedBook,
    editingBook: modals.editingBook,
    setEditingBook: modals.setEditingBook,
    previewBook: modals.previewBook,
    setPreviewBook: modals.setPreviewBook,

    // Actions
    refetch,
    handleDeleteBook,
  };
}
