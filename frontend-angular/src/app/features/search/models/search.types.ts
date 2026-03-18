import { BookFormat } from 'src/app/shared/models/shared.types';

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

export interface BookAddDTO extends BookBaseInput {
  format: BookFormat;
  coverPath?: string | null;
  imageUrl?: string;
  seriesName?: string;
  seriesOrder?: number;
}

export interface BookMetadataDTO extends BookBaseInput {
  imageUrl?: string | null;
  publishedDate?: string;
}
