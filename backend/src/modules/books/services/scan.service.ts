import * as fs from 'fs';
import pLimit from 'p-limit';
import { BookFormat } from '../../../generated/prisma/enums';
import { scanLibraryDirectory, ScannedFile } from '../../../utils/fileScanner';
import { extractMetadata } from '../../../utils/metadataExtractor';
import { calculateFileHash } from '../../../utils/fileHash';
import { extractAndSaveEpubCover } from '../../../utils/epubCoverExtractor';
import { deleteCover } from '../../../utils/coverUtils';
import * as repo from '../repositories/books.repository';
import { normalizeString } from '../../../utils/formatters';
import {
  detectFormat,
  normalizeAuthors,
  normalizeCategories,
} from './utils/service-utils';

type ScanResult = {
  file: string;
  status: 'added' | 'skipped' | 'error';
  reason?: string;
  bookId?: number;
};

type OrphanedBookResult = {
  bookId: number;
  title: string;
  filePath: string;
  status: 'deleted' | 'error';
  reason?: string;
};

/**
 * Intenta extraer la portada de un archivo EPUB
 */
async function tryExtractEpubCover(
  file: ScannedFile,
  bookId: number,
): Promise<void> {
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

/**
 * Procesa un archivo individual del sistema de archivos
 */
async function processFile(file: ScannedFile): Promise<ScanResult> {
  try {
    console.log(`\n📖 Procesando: ${file.filename}`);

    // Calcular hash para detectar duplicados
    const fileHash = await calculateFileHash(file.absolutePath);
    console.log(`  ✅ Hash calculado: ${fileHash.substring(0, 16)}...`);

    // Verificar si ya existe por hash
    const existingByHash = await repo.findByFileHash(fileHash);
    if (existingByHash) {
      console.log(`  ⏭️  Ya existe (hash): ${existingByHash.title}`);
      return {
        file: file.filename,
        status: 'skipped',
        reason: 'Ya existe en la base de datos (mismo hash)',
      };
    }

    // Verificar si ya existe por ruta
    const existingByPath = await repo.findByFilePath(file.absolutePath);
    if (existingByPath) {
      console.log(`  ⏭️  Ya existe (path): ${existingByPath.title}`);
      return {
        file: file.filename,
        status: 'skipped',
        reason: 'Ya existe en la base de datos (misma ruta)',
      };
    }

    // Extraer metadata del archivo
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

    // Detectar formato según extensión
    const format = detectFormat(file.extension);

    // Crear el libro en la base de datos
    const book = await repo.create({
      title: normalizeString(metadata.title),
      isbn: metadata.isbn || null,
      format,
      publisher: metadata.publisher || null,
      publishYear: metadata.publishYear || null,
      coverPath: null,
      filePath: file.absolutePath,
      fileHash,
      seriesOrder: null,
      authors: normalizeAuthors(metadata.authors),
      categories: normalizeCategories(metadata.categories ?? []),
      seriesName: null,
    });

    // Si es EPUB, intentar extraer portada
    if (format === BookFormat.EPUB) {
      await tryExtractEpubCover(file, book.id);
    }

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

/**
 * Verifica y elimina libros huérfanos (sin archivo físico)
 */
async function checkOrphanedBooks(
  scannedFilePaths: Set<string>,
): Promise<OrphanedBookResult[]> {
  console.log('\n🔍 Verificando libros huérfanos...');

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
          status: 'deleted',
        });
      } catch (error) {
        console.error(`   ❌ Error al eliminar: ${error}`);
        orphanedResults.push({
          bookId: book.id,
          title: book.title,
          filePath: book.filePath,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }
  }

  return orphanedResults;
}

/**
 * Escanea el directorio de biblioteca y procesa archivos encontrados
 */
export const scanLibraryFolder = async () => {
  const startTime = Date.now();
  console.log('🔍 Iniciando escaneo de biblioteca...');

  // Escanear directorio
  const files = scanLibraryDirectory();
  console.log(`📚 Encontrados ${files.length} archivos en el sistema`);

  // Crear Set con las rutas absolutas de los archivos encontrados
  const scannedFilePaths = new Set(files.map(f => f.absolutePath));

  // Procesar archivos nuevos/existentes en paralelo (máximo 5 a la vez)
  const limit = pLimit(5);
  const promises = files.map(file => limit(() => processFile(file)));

  console.log('⚡ Procesando archivos (máximo 5 en paralelo)...\n');
  const details = await Promise.all(promises);

  // Verificar y eliminar libros huérfanos
  const orphanedBooks = await checkOrphanedBooks(scannedFilePaths);

  // Calcular estadísticas
  const results = {
    total: files.length,
    added: details.filter(d => d.status === 'added').length,
    skipped: details.filter(d => d.status === 'skipped').length,
    errors: details.filter(d => d.status === 'error').length,
    deleted: orphanedBooks.filter(o => o.status === 'deleted').length,
    deletionErrors: orphanedBooks.filter(o => o.status === 'error').length,
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
