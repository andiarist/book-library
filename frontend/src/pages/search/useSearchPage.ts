import { useSearchBooksByText } from '@/hooks/useBooks';
import { BookMetadata } from '@/types/books.types';
import { FormEvent, useState, useEffect } from 'react';

export const useSearchPage = () => {
  const [query, setQuery] = useState('');
  const [executedQuery, setExecutedQuery] = useState('');
  const [editingBook, setEditingBook] = useState<BookMetadata | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    data: books,
    isFetching,
    isError,
    error,
    refetch,
  } = useSearchBooksByText(executedQuery.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setExecutedQuery(query);
      setHasSearched(true);
    }
  };

  // Ejecutar refetch cuando executedQuery cambie y tenga valor
  useEffect(() => {
    if (executedQuery.trim()) {
      refetch();
    }
  }, [executedQuery, refetch]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleReset = () => {
    setQuery('');
    setExecutedQuery('');
    setHasSearched(false);
  };

  const handleAddBook = (book: BookMetadata) => {
    setEditingBook(book);
  };

  const handleCloseModal = () => {
    setEditingBook(null);
  };

  return {
    // Estado
    query,
    executedQuery,
    books,
    isFetching,
    isError,
    error,
    hasSearched,
    editingBook,
    // Acciones
    handleSubmit,
    handleQueryChange,
    handleReset,
    handleAddBook,
    handleCloseModal,
  };
};
