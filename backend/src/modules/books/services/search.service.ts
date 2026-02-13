import {
  deduplicateBooks,
  sortByRelevance,
} from '../../../utils/bookSearchUtils';
import * as external from '../external/books.external';
import { HttpError, toHttpError } from './utils/service-utils';

/**
 * Busca un libro por ISBN en fuentes externas (Google Books + Open Library)
 */
export const searchBookByIsbn = async (isbn: string) => {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    const book =
      (await external.searchGoogleBooks(cleanISBN)) ||
      (await external.searchOpenLibrary(cleanISBN));

    if (!book) {
      throw new HttpError(404, 'Libro no encontrado');
    }

    return book;
  } catch (e) {
    throw toHttpError(e);
  }
};

/**
 * Busca libros por texto en fuentes externas con deduplicación
 */
export const searchBookByText = async (query: string) => {
  try {
    if (!query || query.trim().length < 3) {
      throw new HttpError(
        400,
        'Debes introducir por lo menos 3 letras para realizar la búsqueda',
      );
    }

    // Buscar en ambas fuentes en paralelo
    const [googleBooks, openLibraryBooks] = await Promise.all([
      external.searchGoogleBooksByText(query),
      external.searchOpenLibraryByText(query),
    ]);

    // Combinar y deduplicar resultados
    const allBooks = [...googleBooks, ...openLibraryBooks];
    const deduplicated = deduplicateBooks(allBooks);
    const sorted = sortByRelevance(deduplicated);

    // Limitar a 15 resultados
    return sorted.slice(0, 15);
  } catch (e) {
    throw toHttpError(e);
  }
};
