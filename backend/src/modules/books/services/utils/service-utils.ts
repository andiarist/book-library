import { BookFormat } from '../../../../generated/prisma/enums';
import { normalizeString } from '../../../../utils/formatters';

/**
 * Error HTTP personalizado con código de estado y payload opcional
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * Convierte cualquier error a HttpError
 */
export const toHttpError = (e: any): HttpError => {
  if (e instanceof HttpError) return e;
  const status = e?.status ?? 500;
  const message = e?.message ?? 'Unexpected error';
  return new HttpError(status, message, e?.payload ?? e?.book);
};

/**
 * Detecta el formato de libro según la extensión del archivo
 */
export const detectFormat = (ext: string): BookFormat => {
  switch (ext.toLowerCase()) {
    case '.epub':
      return BookFormat.EPUB;
    case '.pdf':
      return BookFormat.PDF;
    case '.mobi':
      return BookFormat.MOBI;
    case '.azw3':
      return BookFormat.AZW3;
    default:
      return BookFormat.EPUB;
  }
};

/**
 * Normaliza un array de autores
 */
export const normalizeAuthors = (authors: string[] | undefined): string[] => {
  return (authors ?? []).map(normalizeString);
};

/**
 * Normaliza un array de categorías
 */
export const normalizeCategories = (
  categories: string[] | undefined,
): string[] => {
  return (categories ?? []).map(normalizeString);
};

/**
 * Delay helper para rate limiting de APIs externas
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
