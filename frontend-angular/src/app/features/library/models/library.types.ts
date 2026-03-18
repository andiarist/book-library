import type { BookFormat, Author, Category, Series } from 'src/app/shared/models/shared.types';

export interface BookDTO {
  id: number;
  title: string;
  isbn?: string | null;
  format: BookFormat;
  publisher?: string | null;
  publishYear?: number | null;
  pageCount?: number | null;
  description?: string | null;
  coverPath?: string | null;
  seriesOrder?: number | null;
  createdAt: string;
  updatedAt: string;
  authors: Author[];
  categories: Category[];
  series?: Series | null;
  filePath?: string | null;
}

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

export interface ScanLibraryResponse {
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
