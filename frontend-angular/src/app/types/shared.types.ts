export type BookFormat = 'EPUB' | 'PDF' | 'PHYSICAL' | 'MOBI' | 'AZW3';

export interface BaseEntity {
  id: number;
  name: string;
}

export interface Author extends BaseEntity {}
export interface Category extends BaseEntity {}
export interface Series extends BaseEntity {}

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type APISource = 'google-books' | 'open-library' | 'local';

export interface APIError {
  message: string;
  source: APISource;
  statusCode?: number;
}
