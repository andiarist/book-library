import { Book, BookMetadata, CreateBookDTO } from '@/types/books.types';
import { useState, useRef } from 'react';
import { useCreateBook } from '@/hooks/useBooks';
import { BookFormData } from '@/components/forms/BookForm';

export const useEditNewBook = (
  bookMetadata: BookMetadata | undefined,
  onClose: () => void
) => {
  const { mutateAsync, isPending } = useCreateBook();
  const modalContentRef = useRef<HTMLDivElement>(null);

  const [duplicateError, setDuplicateError] = useState<{
    message: string;
    book?: Book;
  } | null>(null);

  const [formData, setFormData] = useState<BookFormData>(() => {
    if (bookMetadata) {
      return {
        title: bookMetadata.title,
        authors: bookMetadata.authors,
        isbn: bookMetadata.isbn,
        publisher: bookMetadata.publisher,
        publishedDate: bookMetadata.publishedDate,
        pageCount: bookMetadata.pageCount,
        description: bookMetadata.description,
        categories: bookMetadata.categories || [],
        seriesName: undefined,
        seriesOrder: undefined,
        format: undefined,
      };
    }
    // Fallback (no debería ocurrir)
    return {
      title: '',
      authors: [],
      categories: [],
      seriesName: undefined,
      seriesOrder: undefined,
      format: undefined,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveBook();
  };

  const handleSaveBook = async () => {
    // Limpiar error previo
    setDuplicateError(null);

    // Pasamos formData a CreateBookDTO
    const newBook: CreateBookDTO = {
      title: formData.title,
      authors: formData.authors,
      isbn: formData.isbn,
      publisher: formData.publisher,
      pageCount: formData.pageCount,
      format: formData.format || 'PHYSICAL',
      categories: formData.categories || [],
      imageUrl: bookMetadata?.imageUrl || undefined,
      description: formData.description,
      seriesName: formData.seriesName,
      seriesOrder: formData.seriesOrder,
    };

    try {
      const book = await mutateAsync(newBook);
      console.log('Libro creado', book);
      // Cerrar modal después de crear exitosamente
      onClose();
    } catch (err: any) {
      console.error(err);

      // Detectar error de duplicado (HTTP 409)
      if (err?.response?.status === 409) {
        setDuplicateError({
          message:
            err.response.data.message ||
            'Este libro ya existe en tu biblioteca',
          book: err.response.data.book,
        });

        // Hacer scroll al inicio del modal para mostrar el error
        modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return {
    // Refs
    modalContentRef,

    // Form state
    formData,
    setFormData,

    // Error state
    duplicateError,

    // Loading state
    isPending,

    // Handlers
    handleSubmit,
  };
};
