import { normalizeString } from '../../utils/formatters';
import { deduplicateBooks, sortByRelevance } from '../../utils/bookSearchUtils';
import {
  downloadAndSaveCover,
  generateCoverFilename,
  deleteCover,
} from '../../utils/coverUtils';
import { scanLibraryDirectory, ScannedFile } from '../../utils/fileScanner';
import { extractMetadata } from '../../utils/metadataExtractor';
import { calculateFileHash } from '../../utils/fileHash';
import { BookFormat } from '../../generated/prisma/enums';
import * as repo from './books.repository';
import * as external from './books.external';
import { CreateBookDTO, UpdateBookDTO } from './books.types';
import pLimit from 'p-limit';

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
  // Normalizar datos para la comparación
  const normalizedTitle = normalizeString(input.title);
  const normalizedAuthors = input.authors.map(normalizeString);
  const normalizedIsbn = input.isbn ?? null;

  // ✅ Verificar si el libro ya existe
  const existingBook = await repo.checkBookExists(
    normalizedIsbn,
    normalizedTitle,
    normalizedAuthors,
  );

  if (existingBook) {
    throw {
      status: 409,
      message: 'Este libro ya existe en tu biblioteca',
      book: existingBook,
    };
  }

  // Descargar portada si viene imageUrl (desde búsqueda externa)
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

  // Si viene una nueva imageUrl, descargar la nueva portada
  let newCoverPath: string | null | undefined = undefined;

  if (input.imageUrl) {
    const filename = generateCoverFilename();
    newCoverPath = await downloadAndSaveCover(input.imageUrl, filename);

    // Si se descargó exitosamente y había una portada anterior, eliminarla
    if (newCoverPath && existing.coverPath) {
      deleteCover(existing.coverPath);
    }
  } else if (input.coverPath !== undefined) {
    // Si se está actualizando coverPath manualmente
    newCoverPath = input.coverPath;

    // Si se está eliminando la portada (coverPath = null), borrar archivo anterior
    if (input.coverPath === null && existing.coverPath) {
      deleteCover(existing.coverPath);
    }
  }

  const data = {
    ...(input.title && { title: normalizeString(input.title) }),
    ...(input.isbn !== undefined && { isbn: input.isbn }),
    ...(input.format && { format: input.format }),
    ...(input.publisher !== undefined && { publisher: input.publisher }),
    ...(input.publishYear !== undefined && { publishYear: input.publishYear }),
    ...(newCoverPath !== undefined && { coverPath: newCoverPath }),
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

  // Eliminar portada si existe
  if (existing.coverPath) {
    deleteCover(existing.coverPath);
  }

  await repo.remove(bookId);
};

// ========================================
// FUNCIÓN AUXILIAR: Procesar un archivo
// ========================================

type ScanResult = {
  file: string;
  status: 'added' | 'skipped' | 'error';
  reason?: string;
  bookId?: number;
};

/**
 * Procesa un archivo individual y retorna el resultado
 */
async function processFile(file: ScannedFile): Promise<ScanResult> {
  try {
    console.log(`\n📖 Procesando: ${file.filename}`);

    // 1. Calcular hash del archivo
    const fileHash = await calculateFileHash(file.absolutePath);
    console.log(`  ✅ Hash calculado: ${fileHash.substring(0, 16)}...`);

    // 2. Verificar si ya existe por hash
    const existingByHash = await repo.findByFileHash(fileHash);
    if (existingByHash) {
      console.log(`  ⏭️  Ya existe (hash): ${existingByHash.title}`);
      return {
        file: file.filename,
        status: 'skipped',
        reason: 'Ya existe en la base de datos (mismo hash)',
      };
    }

    // 3. Verificar si ya existe por ruta
    const existingByPath = await repo.findByFilePath(file.absolutePath);
    if (existingByPath) {
      console.log(`  ⏭️  Ya existe (path): ${existingByPath.title}`);
      return {
        file: file.filename,
        status: 'skipped',
        reason: 'Ya existe en la base de datos (misma ruta)',
      };
    }

    // 4. Extraer metadata
    const metadata = await extractMetadata(file.absolutePath);
    if (!metadata) {
      console.log(`  ❌ No se pudo extraer metadata`);
      return {
        file: file.filename,
        status: 'error',
        reason: 'No se pudo extraer metadata del archivo',
      };
    }

    console.log(`  📋 Metadata extraída: ${metadata.title}`);

    // 5. Determinar formato según extensión
    let format: BookFormat;
    switch (file.extension.toLowerCase()) {
      case '.epub':
        format = BookFormat.EPUB;
        break;
      case '.pdf':
        format = BookFormat.PDF;
        break;
      case '.mobi':
        format = BookFormat.MOBI;
        break;
      case '.azw3':
        format = BookFormat.AZW3;
        break;
      default:
        format = BookFormat.EPUB;
    }

    // 6. Normalizar datos
    const normalizedTitle = normalizeString(metadata.title);
    const normalizedAuthors = metadata.authors.map(normalizeString);
    const normalizedIsbn = metadata.isbn || null;

    // 7. Crear el libro en la base de datos
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
      categories: metadata.categories
        ? metadata.categories.map(normalizeString)
        : [],
      seriesName: null,
    });

    console.log(`  ✅ Añadido: ${book.title} (ID: ${book.id})`);
    return {
      file: file.filename,
      status: 'added',
      bookId: book.id,
    };
  } catch (error) {
    console.error(`  ❌ Error procesando ${file.filename}:`, error);
    return {
      file: file.filename,
      status: 'error',
      reason: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

// ========================================
// FUNCIÓN PRINCIPAL: Escaneo con paralelismo
// ========================================

/**
 * Escanea el directorio de biblioteca configurado y añade los libros encontrados
 * Procesa archivos en paralelo (5 a la vez) para mayor velocidad
 */
export const scanLibraryFolder = async () => {
  const startTime = Date.now();
  console.log('🔍 Iniciando escaneo de biblioteca...');

  // 1. Escanear directorio
  const files = scanLibraryDirectory();
  console.log(`📚 Encontrados ${files.length} archivos`);

  if (files.length === 0) {
    return {
      total: 0,
      added: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };
  }

  // 2. Configurar límite de concurrencia
  // Procesar máximo 5 archivos en paralelo
  const limit = pLimit(5);

  // 3. Crear promesas para procesar todos los archivos
  const promises = files.map(file => limit(() => processFile(file)));

  // 4. Ejecutar todas las promesas en paralelo (respetando el límite)
  console.log('⚡ Procesando archivos (máximo 5 en paralelo)...\n');
  const details = await Promise.all(promises);

  // 5. Contar resultados
  const results = {
    total: files.length,
    added: details.filter(d => d.status === 'added').length,
    skipped: details.filter(d => d.status === 'skipped').length,
    errors: details.filter(d => d.status === 'error').length,
    details,
  };

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✨ Escaneo completado en ${duration}s`);
  console.log(`   📊 Añadidos: ${results.added}`);
  console.log(`   ⏭️  Omitidos: ${results.skipped}`);
  console.log(`   ❌ Errores: ${results.errors}`);

  return results;
};

/**
 * Escanea el directorio de biblioteca configurado y añade los libros encontrados
 */
// export const scanLibraryFolder = async () => {
//   const startTime = Date.now();
//   console.log("🔍 Iniciando escaneo de biblioteca...");

//   // 1. Escanear directorio
//   const files = scanLibraryDirectory();
//   console.log(`📁 Encontrados ${files.length} archivos`);

//   const results = {
//     total: files.length,
//     added: 0,
//     skipped: 0,
//     errors: 0,
//     details: [] as Array<{
//       file: string;
//       status: "added" | "skipped" | "error";
//       reason?: string;
//       bookId?: number;
//     }>,
//   };

//   // 2. Procesar cada archivo
//   for (const file of files) {
//     try {
//       console.log(`\n📖 Procesando: ${file.filename}`);

//       // 2.1 Calcular hash del archivo
//       const fileHash = await calculateFileHash(file.absolutePath);
//       console.log(`  ✅ Hash calculado: ${fileHash.substring(0, 16)}...`);

//       // 2.2 Verificar si ya existe por hash
//       const existingByHash = await repo.findByFileHash(fileHash);
//       if (existingByHash) {
//         console.log(`  ⏭️  Ya existe (hash): ${existingByHash.title}`);
//         results.skipped++;
//         results.details.push({
//           file: file.filename,
//           status: "skipped",
//           reason: "Ya existe en la base de datos (mismo hash)",
//         });
//         continue;
//       }

//       // 2.3 Verificar si ya existe por ruta
//       const existingByPath = await repo.findByFilePath(file.absolutePath);
//       if (existingByPath) {
//         console.log(`  ⏭️  Ya existe (path): ${existingByPath.title}`);
//         results.skipped++;
//         results.details.push({
//           file: file.filename,
//           status: "skipped",
//           reason: "Ya existe en la base de datos (misma ruta)",
//         });
//         continue;
//       }

//       // 2.4 Extraer metadata
//       const metadata = await extractMetadata(file.absolutePath);
//       if (!metadata) {
//         console.log(`  ❌ No se pudo extraer metadata`);
//         results.errors++;
//         results.details.push({
//           file: file.filename,
//           status: "error",
//           reason: "No se pudo extraer metadata del archivo",
//         });
//         continue;
//       }

//       console.log(`  📋 Metadata extraída: ${metadata.title}`);

//       // 2.5 Determinar formato según extensión
//       let format: BookFormat;
//       switch (file.extension.toLowerCase()) {
//         case ".epub":
//           format = BookFormat.EPUB;
//           break;
//         case ".pdf":
//           format = BookFormat.PDF;
//           break;
//         case ".mobi":
//           format = BookFormat.MOBI;
//           break;
//         case ".azw3":
//           format = BookFormat.AZW3;
//           break;
//         default:
//           format = BookFormat.EPUB;
//       }

//       // 2.6 Normalizar datos
//       const normalizedTitle = normalizeString(metadata.title);
//       const normalizedAuthors = metadata.authors.map(normalizeString);
//       const normalizedIsbn = metadata.isbn || null;

//       // 2.7 Crear el libro en la base de datos
//       const book = await repo.create({
//         title: normalizedTitle,
//         isbn: normalizedIsbn,
//         format,
//         publisher: metadata.publisher || null,
//         publishYear: metadata.publishYear || null,
//         coverPath: null, // Por ahora no extraemos portadas de archivos
//         filePath: file.absolutePath,
//         fileHash,
//         seriesOrder: null,
//         authors: normalizedAuthors,
//         categories: metadata.categories
//           ? metadata.categories.map(normalizeString)
//           : [],
//         seriesName: null,
//       });

//       console.log(`  ✅ Añadido: ${book.title} (ID: ${book.id})`);
//       results.added++;
//       results.details.push({
//         file: file.filename,
//         status: "added",
//         bookId: book.id,
//       });
//     } catch (error) {
//       console.error(`  ❌ Error procesando ${file.filename}:`, error);
//       results.errors++;
//       results.details.push({
//         file: file.filename,
//         status: "error",
//         reason: error instanceof Error ? error.message : "Error desconocido",
//       });
//     }
//   }

//   const duration = ((Date.now() - startTime) / 1000).toFixed(2);
//   console.log(`\n✨ Escaneo completado en ${duration}s`);
//   console.log(`   📊 Añadidos: ${results.added}`);
//   console.log(`   ⏭️  Omitidos: ${results.skipped}`);
//   console.log(`   ❌ Errores: ${results.errors}`);

//   return results;
// };
