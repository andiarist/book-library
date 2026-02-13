import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { FormEvent } from 'react';

interface SearchFormProps {
  query: string;
  isFetching: boolean;
  hasSearched: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onReset: () => void;
}

export const SearchForm = ({
  query,
  isFetching,
  hasSearched,
  onQueryChange,
  onSubmit,
  onReset,
}: SearchFormProps) => {
  return (
    <form onSubmit={onSubmit} className="mb-4 flex gap-4">
      <div className="flex-1">
        <Input
          id="search-text-input"
          type="text"
          label="Búsqueda por texto"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar por título, autor..."
          disabled={isFetching}
        />
      </div>
      <Button type="submit" disabled={isFetching || !query.trim()}>
        {isFetching ? 'Buscando...' : 'Buscar'}
      </Button>
      {hasSearched && (
        <Button
          type="button"
          onClick={onReset}
          disabled={isFetching}
          className="bg-gray-500 hover:bg-gray-600"
        >
          Resetear
        </Button>
      )}
    </form>
  );
};
