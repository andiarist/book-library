import {
  getBooks,
  getBookById,
  createBook,
  searchExternalByText,
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

export const useSearchBooksByText = (query: string) =>
  useQuery({
    queryKey: ['searchBooksByText', query],
    queryFn: () => searchExternalByText(query),
    enabled: false,
  });
