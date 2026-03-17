import type { BookFormat, Author, Category, Series, PaginationInfo } from './shared.types';

export interface Book {
  id: number;
  title: string;
  isbn: string | null;
  format: BookFormat;
  publisher: string | null;
  publishYear: number | null;
  pageCount: number | null;
  description: string | null;
  coverPath: string | null;
  seriesOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
  authors: Author[];
  categories: Category[];
  series: Series | null;
  filePath: string | null;
}

export type PaginatedBookResponse<T> = {
  data: T[];
  pagination: PaginationInfo;
};

export const PAGINATED_BOOK_INIT: PaginatedBookResponse<Book> = {
  data: [],
  pagination: {
    page: 0,
    limit: 0,
    total: 0,
    totalPages: 0,
  },
};

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
