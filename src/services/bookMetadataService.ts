import { BookMetadata, APIError } from '@/types/book';
import { GoogleBooksService } from './googleBooksService';
import { OpenLibraryService } from './openLibraryService';

export class BookMetadataService {
  /**
   * Search book by ISBN using Google Books first, then Open Library as fallback
   */
  static async searchByISBN(isbn: string): Promise<BookMetadata | null> {
    const errors: APIError[] = [];

    // Try Google Books first
    try {
      const result = await GoogleBooksService.searchByISBN(isbn);
      if (result) {
        return result;
      }
    } catch (error) {
      if (this.isAPIError(error)) {
        errors.push(error);
      }
      console.warn('Google Books failed, trying Open Library...', error);
    }

    // Fallback to Open Library
    try {
      const result = await OpenLibraryService.searchByISBN(isbn);
      if (result) {
        return result;
      }
    } catch (error) {
      if (this.isAPIError(error)) {
        errors.push(error);
      }
      console.warn('Open Library also failed', error);
    }

    // If both failed, throw combined error
    if (errors.length > 0) {
      const combinedError: APIError = {
        message: `Failed to fetch metadata from all sources: ${errors.map((e) => e.message).join(', ')}`,
        source: 'google-books', // Primary source
      };
      throw combinedError;
    }

    return null;
  }

  /**
   * Search books by query (only Google Books supports this)
   */
  static async search(
    query: string,
    maxResults: number = 10
  ): Promise<BookMetadata[]> {
    try {
      return await GoogleBooksService.search(query, maxResults);
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Type guard for APIError
   */
  private static isAPIError(error: unknown): error is APIError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'source' in error
    );
  }
}
