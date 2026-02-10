import { BookMetadata, Book, CreateBookDTO } from '@/types/books.types';
import { http } from './http';

export const getBooks = () =>
  http.get<Book[]>('/api/books').then((r) => r.data);

export const getBookById = (id: number) =>
  http.get<Book>(`/api/books/${id}`).then((r) => r.data);

export const createBook = (payload: CreateBookDTO) =>
  http.post<Book>('/api/books', payload).then((r) => r.data);

export const updateBook = (id: number, payload: Partial<CreateBookDTO>) =>
  http.patch<Book>(`/api/books/${id}`, payload).then((r) => r.data);

export const searchExternalByText = (q: string) =>
  http.get<BookMetadata[]>(`/api/books/search/text?q=${q}`).then((r) => r.data);

export const searchBookCovers = (bookId: number) =>
  http.get<BookMetadata[]>(`/api/books/${bookId}/covers`).then((r) => r.data);

export const searchBookCoversByQuery = (query: string) =>
  http
    .get<
      BookMetadata[]
    >(`/api/books/search/covers?q=${encodeURIComponent(query)}`)
    .then((r) => r.data);

export const deleteBook = (id: number) =>
  http.delete(`/api/books/${id}`).then((r) => r.data);

export interface ScanLibraryResult {
  message: string;
  libraryPath: string;
  total: number;
  added: number;
  skipped: number;
  errors: number;
  details: Array<{
    file: string;
    status: 'added' | 'skipped' | 'error';
    reason?: string;
    bookId?: number;
  }>;
}

export const scanLibrary = () =>
  http.post<ScanLibraryResult>('/api/books/scan').then((r) => r.data);
