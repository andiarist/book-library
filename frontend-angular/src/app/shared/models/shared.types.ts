export type BookFormat = 'EPUB' | 'PDF' | 'PHYSICAL' | 'MOBI' | 'AZW3';

export interface BaseEntity {
  id: number;
  name: string;
}

export interface Author extends BaseEntity {}
export interface Category extends BaseEntity {}
export interface Series extends BaseEntity {}
