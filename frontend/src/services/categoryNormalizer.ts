/**
 * Normaliza categorías que pueden venir concatenadas o en diferentes formatos
 * de APIs externas.
 *
 * Ejemplos:
 * - "Fiction, Adventure, Fantasy" -> ["Fiction", "Adventure", "Fantasy"]
 * - ["Fiction / Adventure", "Fantasy"] -> ["Fiction", "Adventure", "Fantasy"]
 * - ["Fiction, Adventure", "Fantasy"] -> ["Fiction", "Adventure", "Fantasy"]
 */
export function normalizeCategories(categories: string[]): string[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  const normalized = new Set<string>();

  categories.forEach((category) => {
    // Dividir por comas y por barras (algunos APIs usan "/" como separador)
    const parts = category
      .split(/[,/]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    parts.forEach((part) => {
      // Capitalizar primera letra y limpiar espacios extra
      const cleaned = part.replace(/\s+/g, ' ').trim();
      if (cleaned) {
        normalized.add(cleaned);
      }
    });
  });

  return Array.from(normalized);
}
