import {
  BookMetadata,
  Book,
  CreateBookDTO,
  PaginatedBooks,
} from '@/types/books.types';
import { http } from './http';

export interface BookQueryParams {
  search?: string;
  format?: string;
  seriesId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getBooks = (
  page: number = 1,
  limit: number = 20,
  filters?: BookQueryParams
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.search) params.append('search', filters.search);
  if (filters?.format) params.append('format', filters.format);
  if (filters?.seriesId) params.append('seriesId', filters.seriesId);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  return http
    .get<PaginatedBooks>(`/api/books?${params.toString()}`)
    .then((r) => r.data);
};

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
  deleted: number;
  deletionErrors: number;
  details: Array<{
    file: string;
    status: 'added' | 'skipped' | 'error';
    reason?: string;
    bookId?: number;
  }>;
  orphanedBooks: Array<{
    bookId: number;
    title: string;
    filePath: string;
    status: 'deleted' | 'error';
    reason?: string;
  }>;
}

export const scanLibrary = () =>
  http.post<ScanLibraryResult>('/api/books/scan').then((r) => r.data);

export const getSeries = () =>
  http
    .get<Array<{ id: number; name: string }>>('/api/books/series-list')
    .then((r) => r.data);

export const getCategories = () =>
  http
    .get<Array<{ id: number; name: string }>>('/api/books/categories-list')
    .then((r) => r.data);
