import { useQuery } from '@tanstack/react-query';
import { getSeries } from '@/api/books.api';

export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn: getSeries,
  });
}
