export interface Book {
  id: string;
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageUrl?: string;
  language?: string;
  // Metadata for local files
  filePath?: string;
  fileFormat?: 'epub' | 'pdf';
  addedAt: string;
  lastModified: string;
}

export interface BookMetadata {
  isbn?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageUrl?: string;
  language?: string;
}

export interface APIError {
  message: string;
  source: 'google-books' | 'open-library' | 'local';
  statusCode?: number;
}

export type SearchMode = 'isbn' | 'text';
