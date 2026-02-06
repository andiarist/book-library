import { http } from "../../lib/httpClient";

export type ExternalBook = {
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
};

const parsePublishYear = (raw?: string | null): number | null => {
  if (!raw) return null;
  // soporta "YYYY", "YYYY-MM-DD", "June 1999", etc.
  const m = raw.match(/\d{4}/);
  if (!m) return null;
  const year = Number(m[0]);
  return Number.isFinite(year) ? year : null;
};

/**
 * Extrae información de series del título si tiene formato común:
 * - "Título (Serie #1)" o "Título (Serie, #1)"
 * - "Título: Serie, Book 1"
 * - "Serie: Título"
 */
const extractSeriesFromTitle = (
  title: string,
): { seriesName: string | null; seriesOrder: number | null } => {
  // Patrón: "Título (Serie #1)" o "Título (Serie, #1)"
  const pattern1 = /\(([^)]+?)\s*[,#]\s*(\d+(?:\.\d+)?)\)/i;
  const match1 = title.match(pattern1);
  if (match1) {
    return {
      seriesName: match1[1].trim(),
      seriesOrder: parseFloat(match1[2]),
    };
  }

  // Patrón: "Título: Serie, Book 1"
  const pattern2 = /:\s*([^,]+),\s*(?:Book|Vol|Volume)\s*(\d+(?:\.\d+)?)/i;
  const match2 = title.match(pattern2);
  if (match2) {
    return {
      seriesName: match2[1].trim(),
      seriesOrder: parseFloat(match2[2]),
    };
  }

  return { seriesName: null, seriesOrder: null };
};

/**
 * Parsea información de series de Google Books
 */
const parseGoogleBooksSeriesInfo = (
  volumeInfo: any,
): { seriesName: string | null; seriesOrder: number | null } => {
  // Google Books puede tener seriesInfo
  if (volumeInfo.seriesInfo?.volumeSeries?.[0]) {
    const series = volumeInfo.seriesInfo.volumeSeries[0];
    return {
      seriesName: series.seriesId || series.series || null,
      seriesOrder:
        series.orderNumber != null ? Number(series.orderNumber) : null,
    };
  }

  // Si no hay seriesInfo, intentar extraer del título
  return extractSeriesFromTitle(volumeInfo.title);
};

/**
 * Parsea información de series de Open Library
 */
const parseOpenLibrarySeriesInfo = (
  data: any,
): { seriesName: string | null; seriesOrder: number | null } => {
  // Open Library puede tener un array de series
  if (data.series && Array.isArray(data.series) && data.series.length > 0) {
    const seriesStr = data.series[0];
    // A veces viene con el número: "Serie Name #1"
    const match = seriesStr.match(/^(.+?)\s*#\s*(\d+(?:\.\d+)?)$/);
    if (match) {
      return {
        seriesName: match[1].trim(),
        seriesOrder: parseFloat(match[2]),
      };
    }
    return { seriesName: seriesStr, seriesOrder: null };
  }

  // Si no hay campo series, intentar extraer del título
  return extractSeriesFromTitle(data.title);
};

/* =========================
   Google Books (por ISBN)
   ========================= */
export const searchGoogleBooks = async (
  isbn: string,
): Promise<ExternalBook | null> => {
  const res = await http.get(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
  );

  if (!res.data.items?.length) return null;

  const info = res.data.items[0].volumeInfo;
  const seriesInfo = parseGoogleBooksSeriesInfo(info);

  return {
    title: info.title,
    authors: info.authors || [],
    categories: info.categories || [],
    publisher: info.publisher ?? null,
    publishYear: parsePublishYear(info.publishedDate),
    pageCount: info.pageCount ?? null,
    description: info.description ?? null,
    imageUrl: info.imageLinks?.thumbnail ?? null,
    seriesName: seriesInfo.seriesName,
    seriesOrder: seriesInfo.seriesOrder,
  };
};

/* =========================
   Open Library (por ISBN)
   ========================= */
export const searchOpenLibrary = async (
  isbn: string,
): Promise<ExternalBook | null> => {
  const res = await http.get(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );

  const book = res.data[`ISBN:${isbn}`];
  if (!book) return null;

  const seriesInfo = parseOpenLibrarySeriesInfo(book);

  return {
    title: book.title,
    authors: book.authors?.map((a: { name: string }) => a.name) || [],
    categories:
      book.subjects?.slice(0, 5).map((s: { name: string }) => s.name) || [],
    publisher: book.publishers?.[0]?.name ?? null,
    publishYear: parsePublishYear(book.publish_date),
    pageCount: book.number_of_pages ?? null,
    description: book.notes ?? null,
    imageUrl: book.cover?.large || book.cover?.medium || null,
    seriesName: seriesInfo.seriesName,
    seriesOrder: seriesInfo.seriesOrder,
  };
};

/* =========================
   Google Books (por Texto)
   ========================= */
export const searchGoogleBooksByText = async (
  query: string,
): Promise<ExternalBook[]> => {
  const res = await http.get(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=10`,
  );

  if (!res.data.items?.length) return [];
  console.log("res.data: ", res.data);

  return res.data.items.map((item: any) => {
    const info = item.volumeInfo;
    const seriesInfo = parseGoogleBooksSeriesInfo(info);

    return {
      title: info.title,
      authors: info.authors || [],
      categories: info.categories || [],
      publisher: info.publisher ?? null,
      publishYear: parsePublishYear(info.publishedDate),
      pageCount: info.pageCount ?? null,
      description: info.description ?? null,
      imageUrl: info.imageLinks?.thumbnail ?? null,
      seriesName: seriesInfo.seriesName,
      seriesOrder: seriesInfo.seriesOrder,
    } satisfies ExternalBook;
  });
};

/* =========================
   Open Library (por Texto)
   ========================= */
export const searchOpenLibraryByText = async (
  query: string,
): Promise<ExternalBook[]> => {
  const res = await http.get(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
  );

  if (!res.data.docs?.length) return [];

  console.log("res.data: ", res.data);
  return res.data.docs.slice(0, 10).map((doc: any) => {
    const seriesInfo = parseOpenLibrarySeriesInfo(doc);

    return {
      title: doc.title,
      authors: doc.author_name || [],
      categories: doc.subject?.slice(0, 5) || [],
      publisher: doc.publisher?.[0] ?? null,
      publishYear: doc.first_publish_year || null,
      pageCount: doc.number_of_pages_median ?? null,
      description: null, // Open Library search API no proporciona descripción
      imageUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      seriesName: seriesInfo.seriesName,
      seriesOrder: seriesInfo.seriesOrder,
    };
  });
};
