import { normalizeString } from "../../../utils/formatters";
import {
  downloadAndSaveCover,
  generateCoverFilename,
  deleteCover,
} from "../../../utils/coverUtils";
import * as repo from "../repositories/books.repository";
import { CreateBookDTO, UpdateBookDTO } from "../books.types";
import {
  HttpError,
  normalizeAuthors,
  normalizeCategories,
  toHttpError,
} from "./utils/service-utils";

export interface BookFilters {
  search?: string;
  format?: string;
  seriesId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Obtiene todos los libros con paginación y filtros
 */
export const getAllBooks = (
  page: number = 1,
  limit: number = 20,
  filters?: BookFilters,
) => {
  return repo.findAll(page, limit, filters);
};

/**
 * Obtiene un libro por ID
 */
export const getBookById = async (id: number) => {
  const book = await repo.findById(id);

  if (!book) {
    throw new HttpError(404, "Libro no encontrado");
  }

  return book;
};

/**
 * Obtiene libros por categoría
 */
export const getBooksByCategory = (name: string) => {
  return repo.findByCategory(normalizeString(name));
};

/**
 * Obtiene libros por autor
 */
export const getBooksByAuthor = (name: string) => {
  return repo.findByAuthor(normalizeString(name));
};

/**
 * Obtiene libros por serie
 */
export const getBooksBySeries = (name: string) => {
  return repo.findBySeries(normalizeString(name));
};

/**
 * Crea un nuevo libro
 */
export const createBook = async (input: CreateBookDTO) => {
  try {
    // Normalizar datos
    const normalizedTitle = normalizeString(input.title);
    const normalizedAuthors = normalizeAuthors(input.authors);
    const normalizedIsbn = input.isbn ?? null;

    // Verificar si ya existe
    const existingBook = await repo.checkBookExists(
      normalizedIsbn,
      normalizedTitle,
      normalizedAuthors,
    );

    if (existingBook) {
      throw new HttpError(409, "Este libro ya existe en tu biblioteca", {
        book: existingBook,
      });
    }

    // Descargar portada si viene imageUrl
    let coverPath: string | null = null;
    if (input.imageUrl) {
      const filename = generateCoverFilename();
      coverPath = await downloadAndSaveCover(input.imageUrl, filename);
    }

    // Preparar datos normalizados
    const normalized = {
      title: normalizedTitle,
      isbn: normalizedIsbn,
      format: input.format,
      publisher: input.publisher ?? null,
      publishYear: input.publishYear ?? null,
      pageCount: input.pageCount ?? null,
      description: input.description ?? null,
      coverPath: coverPath ?? input.coverPath ?? null,
      filePath: null,
      fileHash: null,
      seriesOrder: input.seriesOrder ?? null,
      authors: normalizedAuthors,
      categories: normalizeCategories(input.categories),
      seriesName: input.seriesName ? normalizeString(input.seriesName) : null,
    };

    return await repo.create(normalized);
  } catch (e: any) {
    const err = toHttpError(e);

    // Mantener el shape original para errores 409 con book
    if (err.status === 409 && (err.payload as any)?.book) {
      throw {
        status: 409,
        message: err.message,
        book: (err.payload as any).book,
      };
    }

    throw err;
  }
};

/**
 * Actualiza un libro existente
 */
export const updateBook = async (bookId: number, input: UpdateBookDTO) => {
  try {
    const existing = await repo.findById(bookId);

    if (!existing) {
      throw new HttpError(404, "Book not found");
    }

    let newCoverPath: string | null | undefined = undefined;

    // Gestión de portada
    if (input.imageUrl) {
      // Descargar nueva portada desde URL
      const filename = generateCoverFilename();
      newCoverPath = await downloadAndSaveCover(input.imageUrl, filename);

      // Eliminar portada anterior si existe
      if (newCoverPath && existing.coverPath) {
        deleteCover(existing.coverPath);
      }
    } else if (input.coverPath !== undefined) {
      // Actualización manual de coverPath
      newCoverPath = input.coverPath;

      // Si se está eliminando la portada, borrar archivo anterior
      if (input.coverPath === null && existing.coverPath) {
        deleteCover(existing.coverPath);
      }
    }

    // Preparar datos para actualización
    const data = {
      ...(input.title && { title: normalizeString(input.title) }),
      ...(input.isbn !== undefined && { isbn: input.isbn }),
      ...(input.format && { format: input.format }),
      ...(input.publisher !== undefined && { publisher: input.publisher }),
      ...(input.publishYear !== undefined && {
        publishYear: input.publishYear,
      }),
      ...(input.pageCount !== undefined && { pageCount: input.pageCount }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(newCoverPath !== undefined && { coverPath: newCoverPath }),
      ...(input.seriesOrder !== undefined && {
        seriesOrder: input.seriesOrder,
      }),
      ...(input.authors && { authors: normalizeAuthors(input.authors) }),
      ...(input.categories && {
        categories: normalizeCategories(input.categories),
      }),
      seriesName:
        input.seriesName !== undefined
          ? input.seriesName
            ? normalizeString(input.seriesName)
            : null
          : undefined,
    };

    return await repo.update(bookId, data);
  } catch (e) {
    throw toHttpError(e);
  }
};

/**
 * Elimina un libro
 */
export const deleteBook = async (bookId: number) => {
  try {
    const existing = await repo.findById(bookId);

    if (!existing) {
      throw new HttpError(404, "Book not found");
    }

    // Eliminar portada si existe
    if (existing.coverPath) {
      deleteCover(existing.coverPath);
    }

    await repo.remove(bookId);
  } catch (e) {
    throw toHttpError(e);
  }
};

/**
 * Obtiene todas las series disponibles
 */
export const getAllSeries = async () => {
  return repo.findAllSeries();
};
