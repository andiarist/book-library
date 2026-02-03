import { normalizeString } from './formatters';

export interface BookSearchResult {
  title: string;
  authors: string[];
  categories: string[];
  publisher?: string;
  publishYear?: number | null;
  imageUrl?: string | null;
}

/**
 * Calcula la similitud entre dos strings usando Levenshtein distance normalizada
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1;

  const editDistance = levenshteinDistance(s1, s2);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calcula la distancia de Levenshtein entre dos strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Verifica si dos libros son probablemente el mismo libro
 */
function areSimilarBooks(
  book1: BookSearchResult,
  book2: BookSearchResult,
): boolean {
  // Similitud de título debe ser alta (>85%)
  const titleSimilarity = calculateSimilarity(book1.title, book2.title);
  if (titleSimilarity < 0.85) return false;

  // Si tienen autores, verificar que al menos uno coincida
  if (book1.authors.length > 0 && book2.authors.length > 0) {
    const hasCommonAuthor = book1.authors.some(author1 =>
      book2.authors.some(
        author2 => calculateSimilarity(author1, author2) > 0.8,
      ),
    );

    if (!hasCommonAuthor) return false;
  }

  // Si tienen año de publicación, verificar que sean iguales o cercanos
  if (book1.publishYear && book2.publishYear) {
    const yearDiff = Math.abs(book1.publishYear - book2.publishYear);
    if (yearDiff > 1) return false; // Permito 1 año de diferencia (ediciones)
  }

  return true;
}

/**
 * Merge dos libros similares, priorizando la información más completa
 */
function mergeBooks(
  book1: BookSearchResult,
  book2: BookSearchResult,
): BookSearchResult {
  return {
    title: book1.title.length > book2.title.length ? book1.title : book2.title,
    authors: [...new Set([...book1.authors, ...book2.authors])], // Combinar autores únicos
    categories: [...new Set([...book1.categories, ...book2.categories])], // Combinar categorías únicas
    publisher: book1.publisher || book2.publisher,
    publishYear: book1.publishYear || book2.publishYear,
    // Priorizar imágenes de Google Books (suelen ser de mejor calidad)
    imageUrl: book1.imageUrl || book2.imageUrl,
  };
}

/**
 * Deduplica y merge resultados de búsqueda de libros
 */
export function deduplicateBooks(
  googleBooks: BookSearchResult[],
  openLibraryBooks: BookSearchResult[],
): BookSearchResult[] {
  const results: BookSearchResult[] = [];
  const processed = new Set<number>();

  // Primero, añadir todos los libros de Google Books (prioridad)
  googleBooks.forEach((googleBook, idx) => {
    results.push(googleBook);
    processed.add(idx);
  });

  // Luego, procesar libros de Open Library
  openLibraryBooks.forEach(olBook => {
    // Buscar si ya existe un libro similar en los resultados
    const similarIndex = results.findIndex(existingBook =>
      areSimilarBooks(existingBook, olBook),
    );

    if (similarIndex !== -1) {
      // Si encontramos un libro similar, hacer merge
      results[similarIndex] = mergeBooks(results[similarIndex], olBook);
    } else {
      // Si no existe, añadirlo
      results.push(olBook);
    }
  });

  return results;
}

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
      (a.categories.length > 0 ? 1 : 0);

    const scoreB =
      (b.authors.length > 0 ? 2 : 0) +
      (b.imageUrl ? 1 : 0) +
      (b.publishYear ? 1 : 0) +
      (b.publisher ? 1 : 0) +
      (b.categories.length > 0 ? 1 : 0);

    return scoreB - scoreA; // Ordenar descendente
  });
}
