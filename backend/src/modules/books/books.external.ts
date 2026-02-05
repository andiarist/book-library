import { http } from "../../lib/httpClient";

export type ExternalBook = {
  title: string;
  authors: string[];
  categories: string[];
  publisher: string | null;
  publishYear: number | null;
  imageUrl: string | null;
};

const parsePublishYear = (raw?: string | null): number | null => {
  if (!raw) return null;
  // soporta "YYYY", "YYYY-MM-DD", "June 1999", etc.
  const m = raw.match(/\d{4}/);
  if (!m) return null;
  const year = Number(m[0]);
  return Number.isFinite(year) ? year : null;
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

  return {
    title: info.title,
    authors: info.authors || [],
    categories: info.categories || [],
    publisher: info.publisher ?? null,
    publishYear: parsePublishYear(info.publishedDate),
    imageUrl: info.imageLinks?.thumbnail ?? null,
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

  return {
    title: book.title,
    authors: book.authors?.map((a: { name: string }) => a.name) || [],
    categories:
      book.subjects?.slice(0, 5).map((s: { name: string }) => s.name) || [],
    publisher: book.publishers?.[0]?.name ?? null,
    publishYear: parsePublishYear(book.publish_date),
    imageUrl: book.cover?.large || book.cover?.medium || null,
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

  return res.data.items.map((item: any) => {
    const info = item.volumeInfo;
    return {
      title: info.title,
      authors: info.authors || [],
      categories: info.categories || [],
      publisher: info.publisher ?? null,
      publishYear: parsePublishYear(info.publishedDate),
      imageUrl: info.imageLinks?.thumbnail ?? null,
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

  return res.data.docs.slice(0, 10).map((doc: any) => ({
    title: doc.title,
    authors: doc.author_name || [],
    categories: doc.subject?.slice(0, 5) || [],
    publisher: doc.publisher?.[0] ?? null,
    publishYear: doc.first_publish_year || null,
    imageUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
  }));
};
