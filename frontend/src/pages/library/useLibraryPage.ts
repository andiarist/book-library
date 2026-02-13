import { useMemo, useState } from 'react';
import { useBooks } from '@/hooks/useBooks';
import { useSeries } from '@/hooks/useSeries';
import { scanLibrary, ScanLibraryResult, deleteBook } from '@/api/books.api';
import { Book } from '@/types/books.types';

export type ViewMode = 'grid' | 'table';

export function useLibraryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanLibraryResult | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const queryParams = useMemo(
    () => ({
      search: searchTerm || undefined,
      format: formatFilter || undefined,
      seriesId: seriesFilter || undefined,
      sortBy,
      sortOrder,
    }),
    [searchTerm, formatFilter, seriesFilter, sortBy, sortOrder]
  );

  const { data, isLoading, isError, refetch } = useBooks(
    currentPage,
    itemsPerPage,
    queryParams
  );

  const { data: seriesList = [] } = useSeries();

  const books = data?.books ?? [];
  const pagination = data?.pagination;

  const handleScanLibrary = async () => {
    try {
      setIsScanning(true);
      const results = await scanLibrary();
      setScanResults(results);
      setShowResults(true);
      refetch();
    } catch (error) {
      console.error('Error al escanear biblioteca:', error);
      alert(
        'Error al escanear la biblioteca. Revisa la consola para más detalles.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
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

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFormatFilter('');
    setSeriesFilter('');
    setCurrentPage(1);
  };

  return {
    // data
    data,
    books,
    pagination,
    seriesList,
    isLoading,
    isError,

    // state
    currentPage,
    itemsPerPage,
    searchInput,
    searchTerm,
    formatFilter,
    seriesFilter,
    sortBy,
    sortOrder,
    viewMode,
    isScanning,
    scanResults,
    showResults,
    selectedBook,
    editingBook,
    previewBook,

    // setters
    setCurrentPage,
    setSearchInput,
    setSearchTerm,
    setFormatFilter,
    setSeriesFilter,
    setSortBy,
    setSortOrder,
    setViewMode,
    setShowResults,
    setSelectedBook,
    setEditingBook,
    setPreviewBook,

    // actions
    refetch,
    handleScanLibrary,
    handleSearch,
    handleDeleteBook,
    clearFilters,
  };
}
