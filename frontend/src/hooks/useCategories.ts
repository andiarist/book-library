import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/books.api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}
