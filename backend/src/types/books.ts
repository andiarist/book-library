export interface BookInput {
  title: string;
  isbn?: string;
  authors: string[];
  categories?: string[];
  publisher?: string;
  publishYear?: number;
  seriesName?: string;
  seriesOrder?: number;
  format?: 'EPUB' | 'PDF' | 'PHYSICAL' | 'MOBI' | 'AZW3';
}
