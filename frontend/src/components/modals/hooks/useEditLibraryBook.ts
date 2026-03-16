import { Book } from '@/types/books.types';
import { useState, useRef } from 'react';
import {
  useUpdateBook,
  useDeleteBook,
  useSearchBookCovers,
  useSearchBookCoversByQuery,
} from '@/hooks/useBooks';
import { BookFormData } from '@/components/forms/BookForm';

export const useEditLibraryBook = (book: Book, onClose: () => void) => {
  const { mutateAsync: updateBook, isPending } = useUpdateBook();
  const { mutateAsync: deleteBook, isPending: isDeleting } = useDeleteBook();
  const {
    data: coverOptions,
    refetch: searchCovers,
    isFetching: isSearchingCovers,
  } = useSearchBookCovers(book.id);
  const {
    mutateAsync: searchCustomCovers,
    isPending: isSearchingCustomCovers,
  } = useSearchBookCoversByQuery();

  const modalContentRef = useRef<HTMLDivElement>(null);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookFormData>({
    title: book.title,
    authors: book.authors.map((a) => a.name),
    isbn: book.isbn || undefined,
    publisher: book.publisher || undefined,
    publishYear: book.publishYear || undefined,
    pageCount: book.pageCount || undefined,
    description: book.description || undefined,
    categories: book.categories.map((c) => c.name),
    seriesName: book.series?.name || undefined,
    seriesOrder: book.seriesOrder || undefined,
    format: book.format,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateBook({
        id: book.id,
        data: {
          title: formData.title,
          authors: formData.authors,
          isbn: formData.isbn,
          publisher: formData.publisher,
          publishYear: formData.publishYear,
          pageCount: formData.pageCount,
          description: formData.description,
          categories: formData.categories,
          seriesName: formData.seriesName,
          seriesOrder: formData.seriesOrder,
          format: formData.format!,
          imageUrl: selectedCoverUrl || undefined,
        },
      });

      onClose();
    } catch (err) {
      console.error('Error al actualizar el libro:', err);
    }
  };

  const handleSearchCovers = async () => {
    await searchCovers();
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchCustomCovers = async (query: string) => {
    const result = await searchCustomCovers(query);
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    return result;
  };

  const handleSelectCover = (coverUrl: string) => {
    setSelectedCoverUrl(coverUrl);
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar "${book.title}" de la biblioteca? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await deleteBook(book.id);
        onClose();
      } catch (err) {
        console.error('Error al eliminar el libro:', err);
        alert('Error al eliminar el libro. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return {
    // Refs
    modalContentRef,

    // Form state
    formData,
    setFormData,

    // Cover state
    selectedCoverUrl,
    coverOptions,

    // Loading states
    isPending,
    isDeleting,
    isSearchingCovers,
    isSearchingCustomCovers,

    // Handlers
    handleSubmit,
    handleSearchCovers,
    handleSearchCustomCovers,
    handleSelectCover,
    handleDelete,
  };
};
