import { BookFormat } from '../../generated/prisma/enums';

export type CreateBookDTO = {
  title: string;
  isbn?: string;
  format: BookFormat;
  publisher?: string;
  publishYear?: number;
  coverPath?: string | null;
  imageUrl?: string; // URL externa de la portada (se descargará automáticamente)
  seriesName?: string;
  seriesOrder?: number;
  authors: string[];
  categories: string[];
};

export type UpdateBookDTO = {
  title?: string;
  isbn?: string | null;
  format?: BookFormat;
  publisher?: string | null;
  publishYear?: number | null;
  coverPath?: string | null;
  imageUrl?: string; // URL externa de la portada (se descargará automáticamente)
  seriesName?: string | null;
  seriesOrder?: number | null;
  authors?: string[];
  categories?: string[];
};
