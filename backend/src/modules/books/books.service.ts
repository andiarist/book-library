import pLimit from "p-limit";
import * as fs from "fs";
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

    // Buscar en ambas fuentes en paralelo
    const [googleBooks, openLibraryBooks] = await Promise.all([
      external.searchGoogleBooksByText(query),
      external.searchOpenLibraryByText(query),
    ]);

    // Combinar resultados de ambas fuentes
    const allBooks = [...googleBooks, ...openLibraryBooks];

    // Deduplica libros usando la función de bookSearchUtils
    const deduplicated = deduplicateBooks(allBooks);

    // Ordena por relevancia (libros con más metadatos primero)
    const sorted = sortByRelevance(deduplicated);

    // Limitar a 15 resultados para no abrumar al usuario
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

export const searchBookCoversByMetadata = async (bookId: number) => {
  try {
    const book = await repo.findById(bookId);
    if (!book) throw new HttpError(404, "Libro no encontrado");

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const results: any[] = [];

    // Construir consulta de búsqueda por texto
    const textQuery = `${book.title} ${book.authors.map((a) => a.name).join(" ")}`;

    // Buscar siempre por texto (más variedad de portadas)
    try {
      const gbResults = await external.searchGoogleBooksByText(textQuery);
      results.push(...gbResults);
    } catch (e: any) {
      console.warn("Google Books text error:", e.message);
    }
    await delay(800);

    try {
      const olResults = await external.searchOpenLibraryByText(textQuery);
      results.push(...olResults);
    } catch (e: any) {
      console.warn("Open Library text error:", e.message);
    }

    // Si hay ISBN, también buscar por ISBN para resultados más precisos
    if (book.isbn) {
      await delay(800);
      try {
        const gb = await external.searchGoogleBooks(book.isbn);
        if (gb) results.push(gb);
      } catch (e: any) {
        console.warn("Google Books ISBN error:", e.message);
      }
      await delay(800);

      try {
        const ol = await external.searchOpenLibrary(book.isbn);
        if (ol) results.push(ol);
      } catch (e: any) {
        console.warn("Open Library ISBN error:", e.message);
      }
    }

    // Filtrar solo resultados con imagen
    const allBooks = results.filter((b) => b?.imageUrl);

    // Deduplica y ordena
    const deduplicated = deduplicateBooks(allBooks);
    const sorted = sortByRelevance(deduplicated);

    return sorted.slice(0, 10);
  } catch (e) {
    throw toHttpError(e);
  }
};

export const searchBookCoversByCustomQuery = async (query: string) => {
  try {
    if (!query || query.trim().length < 3) {
      throw new HttpError(
        400,
        "Debes introducir por lo menos 3 letras para realizar la búsqueda",
      );
    }

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const results: any[] = [];

    // Buscar por texto personalizado
    try {
      const gbResults = await external.searchGoogleBooksByText(query);
      results.push(...gbResults);
    } catch (e: any) {
      console.warn("Google Books custom query error:", e.message);
    }
    await delay(800);

    try {
      const olResults = await external.searchOpenLibraryByText(query);
      results.push(...olResults);
    } catch (e: any) {
      console.warn("Open Library custom query error:", e.message);
    }

    // Filtrar solo resultados con imagen
    const allBooks = results.filter((b) => b?.imageUrl);

    // Deduplica y ordena
    const deduplicated = deduplicateBooks(allBooks);
    const sorted = sortByRelevance(deduplicated);

    return sorted.slice(0, 15);
  } catch (e) {
    throw toHttpError(e);
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

type OrphanedBookResult = {
  bookId: number;
  title: string;
  filePath: string;
  status: "deleted" | "error";
  reason?: string;
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

async function checkOrphanedBooks(
  scannedFilePaths: Set<string>,
): Promise<OrphanedBookResult[]> {
  console.log("\n🔍 Verificando libros huérfanos...");

  const booksWithFiles = await repo.findAllWithFilePath();
  const orphanedResults: OrphanedBookResult[] = [];

  for (const book of booksWithFiles) {
    if (!book.filePath) continue;

    // Verificar si el archivo físico existe
    const fileExists = fs.existsSync(book.filePath);

    // Si el archivo no existe o no está en los archivos escaneados, es huérfano
    if (!fileExists || !scannedFilePaths.has(book.filePath)) {
      console.log(`\n🗑️  Libro huérfano detectado: ${book.title}`);
      console.log(`   📁 Ruta: ${book.filePath}`);

      try {
        // Eliminar portada si existe
        if (book.coverPath) {
          deleteCover(book.coverPath);
        }

        // Eliminar libro de la base de datos
        await repo.remove(book.id);

        console.log(`   ✅ Eliminado de la base de datos`);
        orphanedResults.push({
          bookId: book.id,
          title: book.title,
          filePath: book.filePath,
          status: "deleted",
        });
      } catch (error) {
        console.error(`   ❌ Error al eliminar: ${error}`);
        orphanedResults.push({
          bookId: book.id,
          title: book.title,
          filePath: book.filePath,
          status: "error",
          reason: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }
  }

  return orphanedResults;
}

export const scanLibraryFolder = async () => {
  const startTime = Date.now();
  console.log("🔍 Iniciando escaneo de biblioteca...");

  const files = scanLibraryDirectory();
  console.log(`📚 Encontrados ${files.length} archivos en el sistema`);

  // Crear un Set con las rutas absolutas de los archivos encontrados
  const scannedFilePaths = new Set(files.map((f) => f.absolutePath));

  // Procesar archivos nuevos/existentes
  const limit = pLimit(5);
  const promises = files.map((file) => limit(() => processFile(file)));

  console.log("⚡ Procesando archivos (máximo 5 en paralelo)...\n");
  const details = await Promise.all(promises);

  // Verificar y eliminar libros huérfanos
  const orphanedBooks = await checkOrphanedBooks(scannedFilePaths);

  const results = {
    total: files.length,
    added: details.filter((d) => d.status === "added").length,
    skipped: details.filter((d) => d.status === "skipped").length,
    errors: details.filter((d) => d.status === "error").length,
    deleted: orphanedBooks.filter((o) => o.status === "deleted").length,
    deletionErrors: orphanedBooks.filter((o) => o.status === "error").length,
    details,
    orphanedBooks,
  };

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Escaneo completado en ${duration}s`);
  console.log(`   📊 Añadidos: ${results.added}`);
  console.log(`   ⏭️  Omitidos: ${results.skipped}`);
  console.log(`   🗑️  Eliminados: ${results.deleted}`);
  console.log(`   ❌ Errores: ${results.errors + results.deletionErrors}`);

  return results;
};
