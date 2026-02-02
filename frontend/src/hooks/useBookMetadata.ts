import { useState } from 'react';
import { BookMetadata, APIError } from '@/types/book';
import { BookMetadataService } from '@/services/bookMetadataService';

interface UseBookMetadataReturn {
  metadata: BookMetadata | null;
  loading: boolean;
  error: APIError | null;
  searchByISBN: (isbn: string) => Promise<void>;
  search: (query: string, maxResults?: number) => Promise<void>;
  searchResults: BookMetadata[];
  reset: () => void;
}

export function useBookMetadata(): UseBookMetadataReturn {
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [searchResults, setSearchResults] = useState<BookMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const searchByISBN = async (isbn: string) => {
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await BookMetadataService.searchByISBN(isbn);
      setMetadata(result);
    } catch (err) {
      if (isAPIError(err)) {
        setError(err);
      } else {
        setError({
          message: 'An unexpected error occurred',
          source: 'google-books',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string, maxResults: number = 10) => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const results = await BookMetadataService.search(query, maxResults);
      setSearchResults(results);
    } catch (err) {
      if (isAPIError(err)) {
        setError(err);
      } else {
        setError({
          message: 'An unexpected error occurred',
          source: 'google-books',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMetadata(null);
    setSearchResults([]);
    setError(null);
    setLoading(false);
  };

  return {
    metadata,
    loading,
    error,
    searchByISBN,
    search,
    searchResults,
    reset,
  };
}

function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'source' in error
  );
}
