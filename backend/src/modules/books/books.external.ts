import { http } from '../../lib/httpClient';
import { BookSearchResult } from '../../utils/bookSearchUtils';

const parsePublishYear = (raw?: string | null): number | null => {
  if (!raw) return null;
  const m = raw.match(/\d{4}/);
  if (!m) return null;
  const year = Number(m[0]);
  return Number.isFinite(year) ? year : null;
};

/**
 * Extrae información de series del título si tiene formato común
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
  // Intentar con seriesInfo (poco común en la API pública)
  if (volumeInfo.seriesInfo) {
    const series = volumeInfo.seriesInfo;

    if (series.volumeSeries?.[0]) {
      const vol = series.volumeSeries[0];
      return {
        seriesName: vol.series || vol.seriesId || null,
        seriesOrder: vol.orderNumber != null ? Number(vol.orderNumber) : null,
      };
    }

    if (series.series || series.orderNumber != null) {
      return {
        seriesName: series.series || null,
        seriesOrder:
          series.orderNumber != null ? Number(series.orderNumber) : null,
      };
    }
  }

  return extractSeriesFromTitle(volumeInfo.title);
};

/**
 * Parsea información de series de Open Library
 */
const parseOpenLibrarySeriesInfo = (
  data: any,
): { seriesName: string | null; seriesOrder: number | null } => {
  if (data.series && Array.isArray(data.series) && data.series.length > 0) {
    const seriesStr = data.series[0];
    const match = seriesStr.match(/^(.+?)\s*#\s*(\d+(?:\.\d+)?)$/);
    if (match) {
      return {
        seriesName: match[1].trim(),
        seriesOrder: parseFloat(match[2]),
      };
    }
    return { seriesName: seriesStr, seriesOrder: null };
  }

  if (typeof data.series === 'string') {
    return { seriesName: data.series, seriesOrder: null };
  }

  return extractSeriesFromTitle(data.title);
};

/* =========================
   Google Books (por ISBN)
   ========================= */
export const searchGoogleBooks = async (
  isbn: string,
): Promise<BookSearchResult | null> => {
  const res = await http.get(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
  );

  if (!res.data.items?.length) return null;

  const info = res.data.items[0].volumeInfo;
  const seriesInfo = parseGoogleBooksSeriesInfo(info);

  let extractedIsbn: string | null = null;
  if (info.industryIdentifiers) {
    const isbn13 = info.industryIdentifiers.find(
      (id: any) => id.type === 'ISBN_13',
    );
    const isbn10 = info.industryIdentifiers.find(
      (id: any) => id.type === 'ISBN_10',
    );
    extractedIsbn = isbn13?.identifier || isbn10?.identifier || null;
  }

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
    isbn: extractedIsbn,
  };
};

/* =========================
   Open Library (por ISBN)
   ========================= */
export const searchOpenLibrary = async (
  isbn: string,
): Promise<BookSearchResult | null> => {
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
    isbn: isbn,
  };
};

/* =========================
   Google Books (por Texto)
   ========================= */
export const searchGoogleBooksByText = async (
  query: string,
): Promise<BookSearchResult[]> => {
  const res = await http.get(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&maxResults=10`,
  );

  if (!res.data.items?.length) return [];

  return res.data.items.map((item: any) => {
    const info = item.volumeInfo;
    const seriesInfo = parseGoogleBooksSeriesInfo(info);

    let extractedIsbn: string | null = null;
    if (info.industryIdentifiers) {
      const isbn13 = info.industryIdentifiers.find(
        (id: any) => id.type === 'ISBN_13',
      );
      const isbn10 = info.industryIdentifiers.find(
        (id: any) => id.type === 'ISBN_10',
      );
      extractedIsbn = isbn13?.identifier || isbn10?.identifier || null;
    }

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
      isbn: extractedIsbn,
    };
  });
};

/* =========================
   Open Library (por Texto)
   ========================= */
export const searchOpenLibraryByText = async (
  query: string,
): Promise<BookSearchResult[]> => {
  const res = await http.get(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
  );

  if (!res.data.docs?.length) return [];

  return res.data.docs.slice(0, 10).map((doc: any) => {
    const seriesInfo = parseOpenLibrarySeriesInfo(doc);

    let extractedIsbn: string | null = null;
    if (doc.isbn && doc.isbn.length > 0) {
      const isbn13 = doc.isbn.find((i: string) => i.length === 13);
      const isbn10 = doc.isbn.find((i: string) => i.length === 10);
      extractedIsbn = isbn13 || isbn10 || doc.isbn[0];
    }

    return {
      title: doc.title,
      authors: doc.author_name || [],
      categories: doc.subject?.slice(0, 5) || [],
      publisher: doc.publisher?.[0] ?? null,
      publishYear: doc.first_publish_year || null,
      pageCount: doc.number_of_pages_median ?? null,
      description: null,
      imageUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      seriesName: seriesInfo.seriesName,
      seriesOrder: seriesInfo.seriesOrder,
      isbn: extractedIsbn,
    };
  });
};
