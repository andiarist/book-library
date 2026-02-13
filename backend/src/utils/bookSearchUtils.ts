

/**
 * Tipo para resultados de búsqueda de libros externos
 */
export interface BookSearchResult {
  title: string;
  authors: string[];
  categories: string[];
  publisher: string | null;
  publishYear: number | null;
  pageCount: number | null;
  description: string | null;
  imageUrl: string | null;
  seriesName: string | null;
  seriesOrder: number | null;
  isbn: string | null;
}

// ========================================
// DEDUPLICACIÓN Y MERGE
// ========================================

/**
 * Normaliza un título para comparación (elimina espacios, puntuación, lowercase)
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina marcas diacríticas
    .replace(/[^\w\s]/g, '') // Elimina puntuación
    .replace(/\s+/g, ' ') // Normaliza espacios
    .trim();
}

/**
 * Compara dos listas de autores para ver si tienen al menos uno en común
 */
function hasCommonAuthor(authors1: string[], authors2: string[]): boolean {
  if (authors1.length === 0 || authors2.length === 0) return false;

  const normalized1 = authors1.map(normalizeTitle);
  const normalized2 = authors2.map(normalizeTitle);

  return normalized1.some(a1 =>
    normalized2.some(a2 => {
      // Coincidencia exacta
      if (a1 === a2) return true;

      // Coincidencia parcial (para casos como "J.K. Rowling" vs "Rowling, J.K.")
      const parts1 = a1.split(' ');
      const parts2 = a2.split(' ');
      return parts1.some(
        p1 => p1.length > 2 && parts2.some(p2 => p2.length > 2 && p1 === p2),
      );
    }),
  );
}

/**
 * Verifica si dos libros son probablemente el mismo
 */
function areSameBook(
  book1: BookSearchResult,
  book2: BookSearchResult,
): boolean {
  // 1. Si tienen el mismo ISBN, son el mismo libro
  if (book1.isbn && book2.isbn && book1.isbn === book2.isbn) {
    return true;
  }

  // 2. Comparar títulos normalizados
  const title1 = normalizeTitle(book1.title);
  const title2 = normalizeTitle(book2.title);

  // Similitud exacta o muy alta
  if (title1 === title2) {
    // Si los títulos son iguales, verificar que tengan al menos un autor en común
    return hasCommonAuthor(book1.authors, book2.authors);
  }

  // Similitud parcial (uno contiene al otro)
  const longerTitle = title1.length > title2.length ? title1 : title2;
  const shorterTitle = title1.length > title2.length ? title2 : title1;

  if (longerTitle.includes(shorterTitle) && shorterTitle.length > 10) {
    return hasCommonAuthor(book1.authors, book2.authors);
  }

  return false;
}

/**
 * Combina información de dos versiones del mismo libro
 * Prioriza la información más completa de cada campo
 */
function mergeBooks(
  book1: BookSearchResult,
  book2: BookSearchResult,
): BookSearchResult {
  return {
    // Título: el más largo (suele ser más completo)
    title: book1.title.length > book2.title.length ? book1.title : book2.title,

    // Autores: combinar y eliminar duplicados
    authors: Array.from(new Set([...book1.authors, ...book2.authors])),

    // Categorías: combinar y eliminar duplicados
    categories: Array.from(new Set([...book1.categories, ...book2.categories])),

    // Para campos simples: el que no sea null
    publisher: book1.publisher || book2.publisher,
    publishYear: book1.publishYear || book2.publishYear,
    pageCount: book1.pageCount || book2.pageCount,

    // Descripción: la más larga (más completa)
    description: !book1.description
      ? book2.description
      : !book2.description
        ? book1.description
        : book1.description.length > book2.description.length
          ? book1.description
          : book2.description,

    // Imagen: priorizar la primera que exista (generalmente Google Books tiene mejor calidad)
    imageUrl: book1.imageUrl || book2.imageUrl,

    // Series: priorizar el que tenga información completa
    seriesName: book1.seriesName || book2.seriesName,
    seriesOrder: book1.seriesOrder ?? book2.seriesOrder,

    // ISBN: cualquiera que exista
    isbn: book1.isbn || book2.isbn,
  };
}

/**
 * Deduplica una lista de libros, combinando la información de duplicados
 */
export function deduplicateBooks(
  books: BookSearchResult[],
): BookSearchResult[] {
  const result: BookSearchResult[] = [];

  for (const book of books) {
    // Buscar si ya existe un libro similar en los resultados
    const existingIndex = result.findIndex(existing =>
      areSameBook(existing, book),
    );

    if (existingIndex !== -1) {
      // Si existe, hacer merge de la información
      result[existingIndex] = mergeBooks(result[existingIndex], book);
    } else {
      // Si no existe, añadirlo
      result.push(book);
    }
  }

  return result;
}

// ========================================
// ORDENAMIENTO
// ========================================

/**
 * Ordena los resultados por relevancia (prioriza libros con más metadatos completos)
 */
export function sortByRelevance(books: BookSearchResult[]): BookSearchResult[] {
  return books.sort((a, b) => {
    // Calcular "score" de completitud
    const scoreA =
      (a.authors.length > 0 ? 2 : 0) +
      (a.imageUrl ? 1 : 0) +
      (a.publishYear ? 1 : 0) +
      (a.publisher ? 1 : 0) +
      (a.categories.length > 0 ? 1 : 0) +
      (a.description ? 1 : 0) +
      (a.pageCount ? 1 : 0) +
      (a.isbn ? 1 : 0);

    const scoreB =
      (b.authors.length > 0 ? 2 : 0) +
      (b.imageUrl ? 1 : 0) +
      (b.publishYear ? 1 : 0) +
      (b.publisher ? 1 : 0) +
      (b.categories.length > 0 ? 1 : 0) +
      (b.description ? 1 : 0) +
      (b.pageCount ? 1 : 0) +
      (b.isbn ? 1 : 0);

    return scoreB - scoreA; // Ordenar descendente
  });
}
