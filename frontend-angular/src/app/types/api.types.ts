import type { BookFormat, Author, Category, Series, PaginationInfo } from './shared.types';

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

interface BookBaseInput {
  title: string;
  authors: string[];
  categories: string[];
  publisher?: string;
  publishYear?: number;
  pageCount?: number;
  description?: string;
  isbn?: string;
}

export interface CreateBookDTO extends BookBaseInput {
  format: BookFormat;
  coverPath?: string | null;
  imageUrl?: string;
  seriesName?: string;
  seriesOrder?: number;
}

export interface BookMetadata extends BookBaseInput {
  imageUrl?: string | null;
  publishedDate?: string;
}

export type PaginatedBookResponseDTO<T> = {
  books: T[];
  pagination: PaginationInfo;
};
