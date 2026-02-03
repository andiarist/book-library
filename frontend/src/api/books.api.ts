import { BookMetadata, Book, CreateBookDTO } from '@/types/books.types';
import { http } from './http';

export const getBooks = () => http.get<Book[]>('/books').then((r) => r.data);

export const getBookById = (id: number) =>
  http.get<Book>(`/books/${id}`).then((r) => r.data);

export const createBook = (payload: CreateBookDTO) =>
  http.post<Book>('/books', payload).then((r) => r.data);

export const updateBook = (id: number, payload: Partial<CreateBookDTO>) =>
  http.patch<Book>(`/books/${id}`, payload).then((r) => r.data);

export const searchExternalByText = (q: string) =>
  http.get<BookMetadata[]>(`/books/search?q=${q}`).then((r) => r.data);
