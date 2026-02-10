import {
  getBooks,
  getBookById,
  createBook,
  searchExternalByText,
  searchBookCovers,
  searchBookCoversByQuery,
  updateBook,
  deleteBook,
} from '@/api/books.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBooks = () =>
  useQuery({ queryKey: ['books'], queryFn: getBooks });

export const useBook = (id: number) =>
  useQuery({
    queryKey: ['book', id],
    queryFn: () => getBookById(id),
  });

export const useCreateBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBook,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  });
};

export const useUpdateBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateBook(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
      qc.invalidateQueries({ queryKey: ['book'] });
    },
  });
};

export const useDeleteBook = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useSearchBooksByText = (query: string) =>
  useQuery({
    queryKey: ['searchBooksByText', query],
    queryFn: () => searchExternalByText(query),
    enabled: false,
  });

export const useSearchBookCovers = (bookId: number) =>
  useQuery({
    queryKey: ['searchBookCovers', bookId],
    queryFn: () => searchBookCovers(bookId),
    enabled: false,
  });

export const useSearchBookCoversByQuery = (query: string) =>
  useQuery({
    queryKey: ['searchBookCoversByQuery', query],
    queryFn: () => searchBookCoversByQuery(query),
    enabled: false,
  });
