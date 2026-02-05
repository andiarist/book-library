import pLimit from "p-limit";
import { BookFormat } from "../../generated/prisma/enums";
import { normalizeString } from "../../utils/formatters";
import { deduplicateBooks, sortByRelevance } from "../../utils/bookSearchUtils";
import {
  downloadAndSaveCover,
  generateCoverFilename,
  deleteCover,
} from "../../utils/coverUtils";
import { scanLibraryDirectory, ScannedFile } from "../../utils/fileScanner";
import { extractMetadata } from "../../utils/metadataExtractor";
import { calculateFileHash } from "../../utils/fileHash";
import { extractAndSaveEpubCover } from "../../utils/epubCoverExtractor";
import * as repo from "./books.repository";
import * as external from "./books.external";
import { CreateBookDTO, UpdateBookDTO } from "./books.types";

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
  }
}

const toHttpError = (e: any): HttpError => {
  if (e instanceof HttpError) return e;
  const status = e?.status ?? 500;
  const message = e?.message ?? "Unexpected error";
  return new HttpError(status, message, e?.payload ?? e?.book);
};

const detectFormat = (ext: string): BookFormat => {
  switch (ext.toLowerCase()) {
    case ".epub":
      return BookFormat.EPUB;
    case ".pdf":
      return BookFormat.PDF;
    case ".mobi":
      return BookFormat.MOBI;
    case ".azw3":
      return BookFormat.AZW3;
    default:
      return BookFormat.EPUB;
  }
};

const normalizeAuthors = (authors: string[] | undefined) =>
  (authors ?? []).map(normalizeString);

const normalizeCategories = (categories: string[] | undefined) =>
  (categories ?? []).map(normalizeString);

export const searchBookByIsbn = async (isbn: string) => {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, "");

    const book =
      (await external.searchGoogleBooks(cleanISBN)) ||
      (await external.searchOpenLibrary(cleanISBN));

    if (!book) throw new HttpError(404, "Libro no encontrado");

    return book;
  } catch (e) {
    throw toHttpError(e);
  }
};

export const searchBookByText = async (query: string) => {
  try {
    if (!query || query.trim().length < 3) {
      throw new HttpError(
        400,
        "Debes introducir por lo menos 3 letras para realizar la búsqueda",
      );
    }

    const [googleBooks, openLibraryBooks] = await Promise.all([
      external.searchGoogleBooksByText(query),
      external.searchOpenLibraryByText(query),
    ]);

    // Convertir ExternalBook[] a BookSearchResult[] (null -> undefined)
    const normalizedGoogleBooks = googleBooks.map((book) => ({
      ...book,
      publisher: book.publisher ?? undefined,
    }));

    const normalizedOpenLibraryBooks = openLibraryBooks.map((book) => ({
      ...book,
      publisher: book.publisher ?? undefined,
    }));

    const deduplicated = deduplicateBooks(
      normalizedGoogleBooks,
      normalizedOpenLibraryBooks,
    );
    const sorted = sortByRelevance(deduplicated);

    return sorted.slice(0, 15);
  } catch (e) {
    throw toHttpError(e);
  }
};

export const getAllBooks = () => repo.findAll();

export const getBookById = async (id: number) => {
  const book = await repo.findById(id);
  if (!book) throw new HttpError(404, "Libro no encontrado");
  return book;
};

export const getBooksByCategory = (name: string) =>
  repo.findByCategory(normalizeString(name));

export const getBooksByAuthor = (name: string) =>
  repo.findByAuthor(normalizeString(name));

export const getBooksBySeries = (name: string) =>
  repo.findBySeries(normalizeString(name));

export const createBook = async (input: CreateBookDTO) => {
  try {
    const normalizedTitle = normalizeString(input.title);
    const normalizedAuthors = normalizeAuthors(input.authors);
    const normalizedIsbn = input.isbn ?? null;

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

    let coverPath: string | null = null;
    if (input.imageUrl) {
      const filename = generateCoverFilename();
      coverPath = await downloadAndSaveCover(input.imageUrl, filename);
    }

    const normalized = {
      title: normalizedTitle,
      isbn: normalizedIsbn,
      format: input.format,
      publisher: input.publisher ?? null,
      publishYear: input.publishYear ?? null,
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
    // Mantengo el shape anterior si venía book
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

export const updateBook = async (bookId: number, input: UpdateBookDTO) => {
  try {
    const existing = await repo.findById(bookId);
    if (!existing) throw new HttpError(404, "Book not found");

    let newCoverPath: string | null | undefined = undefined;

    if (input.imageUrl) {
      const filename = generateCoverFilename();
      newCoverPath = await downloadAndSaveCover(input.imageUrl, filename);

      if (newCoverPath && existing.coverPath) {
        deleteCover(existing.coverPath);
      }
    } else if (input.coverPath !== undefined) {
      newCoverPath = input.coverPath;

      if (input.coverPath === null && existing.coverPath) {
        deleteCover(existing.coverPath);
      }
    }

    const data = {
      ...(input.title && { title: normalizeString(input.title) }),
      ...(input.isbn !== undefined && { isbn: input.isbn }),
      ...(input.format && { format: input.format }),
      ...(input.publisher !== undefined && { publisher: input.publisher }),
      ...(input.publishYear !== undefined && {
        publishYear: input.publishYear,
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

export const deleteBook = async (bookId: number) => {
  try {
    const existing = await repo.findById(bookId);
    if (!existing) throw new HttpError(404, "Book not found");

    if (existing.coverPath) deleteCover(existing.coverPath);

    await repo.remove(bookId);
  } catch (e) {
    throw toHttpError(e);
  }
};

// ========================================
// Escaneo
// ========================================

type ScanResult = {
  file: string;
  status: "added" | "skipped" | "error";
  reason?: string;
  bookId?: number;
};

async function tryExtractEpubCover(file: ScannedFile, bookId: number) {
  try {
    const coverPath = await extractAndSaveEpubCover(
      file.absolutePath,
      `book-${bookId}`,
    );

    if (coverPath) {
      await repo.update(bookId, { coverPath });
      console.log(`  🖼️  Portada extraída: ${coverPath}`);
    } else {
      console.log(`  ℹ️  EPUB sin portada (o no detectable)`);
    }
  } catch {
    console.log(`  ⚠️  No se pudo extraer portada EPUB`);
  }
}

async function processFile(file: ScannedFile): Promise<ScanResult> {
  try {
    console.log(`\n📖 Procesando: ${file.filename}`);

    const fileHash = await calculateFileHash(file.absolutePath);
    console.log(`  ✅ Hash calculado: ${fileHash.substring(0, 16)}...`);

    const existingByHash = await repo.findByFileHash(fileHash);
    if (existingByHash) {
      console.log(`  ⏭️  Ya existe (hash): ${existingByHash.title}`);
      return {
        file: file.filename,
        status: "skipped",
        reason: "Ya existe en la base de datos (mismo hash)",
      };
    }

    const existingByPath = await repo.findByFilePath(file.absolutePath);
    if (existingByPath) {
      console.log(`  ⏭️  Ya existe (path): ${existingByPath.title}`);
      return {
        file: file.filename,
        status: "skipped",
        reason: "Ya existe en la base de datos (misma ruta)",
      };
    }

    const metadata = await extractMetadata(file.absolutePath);
    if (!metadata) {
      console.log(`  ❌ No se pudo extraer metadata`);
      return {
        file: file.filename,
        status: "error",
        reason: "No se pudo extraer metadata del archivo",
      };
    }

    console.log(`  📋 Metadata extraída: ${metadata.title}`);

    const format = detectFormat(file.extension);

    const normalizedTitle = normalizeString(metadata.title);
    const normalizedAuthors = normalizeAuthors(metadata.authors);
    const normalizedIsbn = metadata.isbn || null;

    const book = await repo.create({
      title: normalizedTitle,
      isbn: normalizedIsbn,
      format,
      publisher: metadata.publisher || null,
      publishYear: metadata.publishYear || null,
      coverPath: null,
      filePath: file.absolutePath,
      fileHash,
      seriesOrder: null,
      authors: normalizedAuthors,
      categories: normalizeCategories(metadata.categories ?? []),
      seriesName: null,
    });

    if (format === BookFormat.EPUB) {
      await tryExtractEpubCover(file, book.id);
    }

    console.log(`  ✅ Añadido: ${book.title} (ID: ${book.id})`);
    return { file: file.filename, status: "added", bookId: book.id };
  } catch (error) {
    console.error(`  ❌ Error procesando ${file.filename}:`, error);
    return {
      file: file.filename,
      status: "error",
      reason: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export const scanLibraryFolder = async () => {
  const startTime = Date.now();
  console.log("🔍 Iniciando escaneo de biblioteca...");

  const files = scanLibraryDirectory();
  console.log(`📚 Encontrados ${files.length} archivos`);

  if (files.length === 0) {
    return {
      total: 0,
      added: 0,
      skipped: 0,
      errors: 0,
      details: [] as ScanResult[],
    };
  }

  const limit = pLimit(5);
  const promises = files.map((file) => limit(() => processFile(file)));

  console.log("⚡ Procesando archivos (máximo 5 en paralelo)...\n");
  const details = await Promise.all(promises);

  const results = {
    total: files.length,
    added: details.filter((d) => d.status === "added").length,
    skipped: details.filter((d) => d.status === "skipped").length,
    errors: details.filter((d) => d.status === "error").length,
    details,
  };

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Escaneo completado en ${duration}s`);
  console.log(`   📊 Añadidos: ${results.added}`);
  console.log(`   ⏭️  Omitidos: ${results.skipped}`);
  console.log(`   ❌ Errores: ${results.errors}`);

  return results;
};
