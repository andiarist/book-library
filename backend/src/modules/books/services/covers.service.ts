import {
  deduplicateBooks,
  sortByRelevance,
} from '../../../utils/bookSearchUtils';
import * as repo from '../repositories/books.repository';
import * as external from '../external/books.external';
import { HttpError, delay, toHttpError } from './utils/service-utils';

/**
 * Busca portadas para un libro basándose en sus metadatos
 */
export const searchBookCoversByMetadata = async (bookId: number) => {
  try {
    const book = await repo.findById(bookId);
    if (!book) {
      throw new HttpError(404, 'Libro no encontrado');
    }

    const results: any[] = [];

    // Construir consulta de búsqueda por texto
    const textQuery = `${book.title} ${book.authors.map(a => a.name).join(' ')}`;

    // Buscar por texto en ambas fuentes
    try {
      const gbResults = await external.searchGoogleBooksByText(textQuery);
      results.push(...gbResults);
    } catch (e: any) {
      console.warn('Google Books text error:', e.message);
    }

    await delay(800);

    try {
      const olResults = await external.searchOpenLibraryByText(textQuery);
      results.push(...olResults);
    } catch (e: any) {
      console.warn('Open Library text error:', e.message);
    }

    // Si hay ISBN, buscar también por ISBN para resultados más precisos
    if (book.isbn) {
      await delay(800);

      try {
        const gb = await external.searchGoogleBooks(book.isbn);
        if (gb) results.push(gb);
      } catch (e: any) {
        console.warn('Google Books ISBN error:', e.message);
      }

      await delay(800);

      try {
        const ol = await external.searchOpenLibrary(book.isbn);
        if (ol) results.push(ol);
      } catch (e: any) {
        console.warn('Open Library ISBN error:', e.message);
      }
    }

    // Filtrar solo resultados con imagen
    const withImages = results.filter(b => b?.imageUrl);

    // Deduplica y ordena
    const deduplicated = deduplicateBooks(withImages);
    const sorted = sortByRelevance(deduplicated);

    return sorted.slice(0, 10);
  } catch (e) {
    throw toHttpError(e);
  }
};

/**
 * Busca portadas usando una query personalizada
 */
export const searchBookCoversByCustomQuery = async (query: string) => {
  try {
    if (!query || query.trim().length < 3) {
      throw new HttpError(
        400,
        'Debes introducir por lo menos 3 letras para realizar la búsqueda',
      );
    }

    const results: any[] = [];

    // Buscar por texto personalizado
    try {
      const gbResults = await external.searchGoogleBooksByText(query);
      results.push(...gbResults);
    } catch (e: any) {
      console.warn('Google Books custom query error:', e.message);
    }

    await delay(800);

    try {
      const olResults = await external.searchOpenLibraryByText(query);
      results.push(...olResults);
    } catch (e: any) {
      console.warn('Open Library custom query error:', e.message);
    }

    // Filtrar solo resultados con imagen
    const withImages = results.filter(b => b?.imageUrl);

    // Deduplica y ordena
    const deduplicated = deduplicateBooks(withImages);
    const sorted = sortByRelevance(deduplicated);

    return sorted.slice(0, 15);
  } catch (e) {
    throw toHttpError(e);
  }
};
