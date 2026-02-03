import { normalizeString } from '../../utils/formatters';
import { deduplicateBooks, sortByRelevance } from '../../utils/bookSearchUtils';
import * as repo from './books.repository';
import * as external from './books.external';
import { CreateBookDTO, UpdateBookDTO } from './books.types';

export const searchBookByIsbn = async (isbn: string) => {
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  const book =
    (await external.searchGoogleBooks(cleanISBN)) ||
    (await external.searchOpenLibrary(cleanISBN));

  if (!book) {
    throw { status: 404, message: 'Libro no encontrado' };
  }

  return book;
};

export const searchBookByText = async (query: string) => {
  if (!query || query.trim().length < 3) {
    throw {
      status: 400,
      message:
        'Debes introducir por lo menos 3 letras para realizar la búsqueda',
    };
  }

  // Buscar en ambas fuentes en paralelo
  const [googleBooks, openLibraryBooks] = await Promise.all([
    external.searchGoogleBooksByText(query),
    external.searchOpenLibraryByText(query),
  ]);

  // Deduplica y combina resultados
  const deduplicated = deduplicateBooks(googleBooks, openLibraryBooks);

  // Ordena por relevancia (libros con más metadatos primero)
  const sorted = sortByRelevance(deduplicated);

  // Limitar a 15 resultados para no abrumar al usuario
  return sorted.slice(0, 15);
};

export const getAllBooks = () => repo.findAll();

export const getBookById = async (id: number) => {
  const book = await repo.findById(id);
  if (!book) throw { status: 404, message: 'Libro no encontrado' };
  return book;
};

export const getBooksByCategory = (name: string) =>
  repo.findByCategory(normalizeString(name));

export const getBooksByAuthor = (name: string) =>
  repo.findByAuthor(normalizeString(name));

export const getBooksBySeries = (name: string) =>
  repo.findBySeries(normalizeString(name));

export const createBook = async (input: CreateBookDTO) => {
  const normalized = {
    title: normalizeString(input.title),
    isbn: input.isbn ?? null,
    format: input.format,
    publisher: input.publisher ?? null,
    publishYear: input.publishYear ?? null,
    coverPath: input.coverPath ?? null,
    seriesOrder: input.seriesOrder ?? null,
    authors: input.authors.map(normalizeString),
    categories: input.categories.map(normalizeString),
    seriesName: input.seriesName ? normalizeString(input.seriesName) : null,
  };

  return repo.create(normalized);
};

export const updateBook = async (bookId: number, input: UpdateBookDTO) => {
  const existing = await repo.findById(bookId);
  if (!existing) {
    throw { status: 404, message: 'Book not found' };
  }

  const data = {
    ...(input.title && { title: normalizeString(input.title) }),
    ...(input.isbn !== undefined && { isbn: input.isbn }),
    ...(input.format && { format: input.format }),
    ...(input.publisher !== undefined && { publisher: input.publisher }),
    ...(input.publishYear !== undefined && { publishYear: input.publishYear }),
    ...(input.coverPath !== undefined && { coverPath: input.coverPath }),
    ...(input.seriesOrder !== undefined && { seriesOrder: input.seriesOrder }),
    ...(input.authors && {
      authors: input.authors.map(normalizeString),
    }),
    ...(input.categories && {
      categories: input.categories.map(normalizeString),
    }),
    seriesName:
      input.seriesName !== undefined
        ? input.seriesName
          ? normalizeString(input.seriesName)
          : null
        : undefined,
  };

  return repo.update(bookId, data);
};

export const deleteBook = async (bookId: number) => {
  const existing = await repo.findById(bookId);
  if (!existing) {
    throw { status: 404, message: 'Book not found' };
  }
  await repo.remove(bookId);
};
