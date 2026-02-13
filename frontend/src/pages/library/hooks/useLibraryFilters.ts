import { useMemo, useState } from 'react';

export interface FilterParams {
  search?: string;
  format?: string;
  seriesId?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function useLibraryFilters() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFormatFilter('');
    setSeriesFilter('');
    setCurrentPage(1);
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  return {
    // Pagination
    currentPage,
    setCurrentPage,

    // Search
    searchInput,
    setSearchInput,
    searchTerm,
    handleSearch,

    // Filters
    formatFilter,
    setFormatFilter,
    seriesFilter,
    setSeriesFilter,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Computed
    queryParams,

    // Actions
    clearFilters,
    resetToFirstPage,
  };
}
