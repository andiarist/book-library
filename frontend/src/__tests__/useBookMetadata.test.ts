import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookMetadata } from '@/hooks/useBookMetadata';
import { BookMetadataService } from '@/services/bookMetadataService';

// Mock the service
vi.mock('@/services/bookMetadataService');

describe('useBookMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBookMetadata());

    expect(result.current.metadata).toBeNull();
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should search by ISBN successfully', async () => {
    const mockMetadata = {
      isbn: '9780123456789',
      title: 'Test Book',
      authors: ['Test Author'],
    };

    vi.mocked(BookMetadataService.searchByISBN).mockResolvedValue(
      mockMetadata
    );

    const { result } = renderHook(() => useBookMetadata());

    result.current.searchByISBN('9780123456789');

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toEqual(mockMetadata);
    expect(result.current.error).toBeNull();
  });

  it('should handle search errors', async () => {
    const mockError = {
      message: 'API Error',
      source: 'google-books' as const,
    };

    vi.mocked(BookMetadataService.searchByISBN).mockRejectedValue(mockError);

    const { result } = renderHook(() => useBookMetadata());

    result.current.searchByISBN('9780123456789');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should reset state', async () => {
    const mockMetadata = {
      isbn: '9780123456789',
      title: 'Test Book',
      authors: ['Test Author'],
    };

    vi.mocked(BookMetadataService.searchByISBN).mockResolvedValue(
      mockMetadata
    );

    const { result } = renderHook(() => useBookMetadata());

    result.current.searchByISBN('9780123456789');

    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockMetadata);
    });

    result.current.reset();

    expect(result.current.metadata).toBeNull();
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
