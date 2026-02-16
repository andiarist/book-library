import { BookMetadata, APIError } from '@/types/books.types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// You'll need to add your API key in .env
// VITE_GOOGLE_BOOKS_API_KEY=your_key_here
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

interface GoogleBooksVolume {
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
  totalItems: number;
}

export class GoogleBooksService {
  /**
   * Search book by ISBN
   */
  static async searchByISBN(isbn: string): Promise<BookMetadata | null> {
    try {
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      const url = new URL(GOOGLE_BOOKS_API);
      url.searchParams.append('q', `isbn:${cleanISBN}`);
      if (API_KEY) {
        url.searchParams.append('key', API_KEY);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      return this.parseVolumeInfo(data.items[0], cleanISBN);
    } catch (error) {
      const apiError: APIError = {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'google-books',
      };
      throw apiError;
    }
  }

  /**
   * Search books by title and/or author
   */
  static async search(
    query: string,
    maxResults: number = 10
  ): Promise<BookMetadata[]> {
    try {
      const url = new URL(GOOGLE_BOOKS_API);
      url.searchParams.append('q', query);
      url.searchParams.append('maxResults', maxResults.toString());
      if (API_KEY) {
        url.searchParams.append('key', API_KEY);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();

      if (!data.items) {
        return [];
      }

      return data.items
        .map((item) => this.parseVolumeInfo(item))
        .filter((book): book is BookMetadata => book !== null);
    } catch (error) {
      const apiError: APIError = {
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        source: 'google-books',
      };
      throw apiError;
    }
  }

  /**
   * Parse Google Books API response to our BookMetadata format
   */
  private static parseVolumeInfo(
    volume: GoogleBooksVolume,
    isbn?: string
  ): BookMetadata | null {
    const { volumeInfo } = volume;

    if (!volumeInfo.title) {
      return null;
    }

    // Extract ISBN if not provided
    const extractedISBN =
      isbn ||
      volumeInfo.industryIdentifiers?.find((id) =>
        ['ISBN_13', 'ISBN_10'].includes(id.type)
      )?.identifier;

    return {
      isbn: extractedISBN,
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories || [],
      imageUrl:
        volumeInfo.imageLinks?.thumbnail ||
        volumeInfo.imageLinks?.smallThumbnail,
      //language: volumeInfo.language,
    };
  }
}
