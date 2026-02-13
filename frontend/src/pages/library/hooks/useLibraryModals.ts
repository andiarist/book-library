import { useState } from 'react';
import { Book } from '@/types/books.types';

export function useLibraryModals() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);

  const openDetail = (book: Book) => {
    setSelectedBook(book);
  };

  const closeDetail = () => {
    setSelectedBook(null);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
  };

  const closeEdit = () => {
    setEditingBook(null);
  };

  const openPreview = (book: Book) => {
    setPreviewBook(book);
  };

  const closePreview = () => {
    setPreviewBook(null);
  };

  const editFromDetail = (book: Book) => {
    setEditingBook(book);
    setSelectedBook(null);
  };

  return {
    // Detail Modal
    selectedBook,
    setSelectedBook,
    openDetail,
    closeDetail,

    // Edit Modal
    editingBook,
    setEditingBook,
    openEdit,
    closeEdit,

    // Preview Modal
    previewBook,
    setPreviewBook,
    openPreview,
    closePreview,

    // Combined actions
    editFromDetail,
  };
}
