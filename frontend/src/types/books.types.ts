export type Book = {
  id: number;
  title: string;
  isbn?: string | null;
  format: 'EPUB' | 'PDF' | 'PHYSICAL' | 'MOBI' | 'AZW3';
  publisher?: string | null;
  publishYear?: number | null;
  coverPath?: string | null;
  seriesOrder?: number | null;
  createdAt: string;
  updatedAt: string;
  authors: Author[];
  categories: Category[];
  series?: Series | null;
};

export type CreateBookDTO = {
  title: string;
  format: Book['format'];
  authors: string[];
  categories: string[];
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  coverPath?: string | null;
  seriesName?: string;
  seriesOrder?: number;
};

export type BookMetadata = {
  title: string;
  authors: string[];
  categories: string[];
  publisher?: string;
  publishYear?: number;
  imageUrl?: string | null;
};

export type Author = {
  id: number;
  name: string;
};

export type Category = {
  id: number;
  name: string;
};
export type Series = {
  id: number;
  name: string;
};
