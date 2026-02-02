import { BookMetadata, APIError } from '@/types/book';

const OPEN_LIBRARY_API = 'https://openlibrary.org';

interface OpenLibraryBook {
  title?: string;
  authors?: Array<{ name?: string }>;
  publishers?: string[];
  publish_date?: string;
  number_of_pages?: number;
  subjects?: string[];
  isbn_13?: string[];
  isbn_10?: string[];
  cover?: {
    large?: string;
    medium?: string;
    small?: string;
  };
}

interface OpenLibraryISBNResponse {
  [key: string]: OpenLibraryBook;
}

export class OpenLibraryService {
  /**
   * Search book by ISBN
   */
  static async searchByISBN(isbn: string): Promise<BookMetadata | null> {
    try {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      const url = `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OpenLibraryISBNResponse = await response.json();
      const bookKey = `ISBN:${cleanISBN}`;

      if (!data[bookKey]) {
        return null;
      }

      return this.parseBookData(data[bookKey], cleanISBN);
    } catch (error) {
      const apiError: APIError = {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'open-library',
      };
      throw apiError;
    }
  }

  /**
   * Get cover image URL by ISBN
   */
  static getCoverUrl(
    isbn: string,
    size: 'S' | 'M' | 'L' = 'M'
  ): string | undefined {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    return `${OPEN_LIBRARY_API}/covers/isbn/${cleanISBN}-${size}.jpg`;
  }

  /**
   * Parse Open Library API response to our BookMetadata format
   */
  private static parseBookData(
    book: OpenLibraryBook,
    isbn: string
  ): BookMetadata | null {
    if (!book.title) {
      return null;
    }

    return {
      isbn,
      title: book.title,
      authors:
        book.authors?.map((author) => author.name || '').filter(Boolean) || [],
      publisher: book.publishers?.[0],
      publishedDate: book.publish_date,
      pageCount: book.number_of_pages,
      categories: book.subjects?.slice(0, 5), // Limit to first 5 subjects
      imageUrl:
        book.cover?.large || book.cover?.medium || this.getCoverUrl(isbn, 'L'),
    };
  }
}
