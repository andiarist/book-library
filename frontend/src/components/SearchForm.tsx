import { useState, FormEvent, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { SearchMode } from '@/types/book';

interface SearchFormProps {
  onSearch: (query: string) => void;
  mode?: SearchMode;
  loading?: boolean;
}

export function SearchForm({
  onSearch,
  mode = 'text',
  loading,
}: SearchFormProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery('');
  }, [mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-4">
      <div className="flex-1">
        <Input
          id={`${mode}-input`}
          type="text"
          label={mode === 'isbn' ? 'ISBN' : 'Búsqueda por texto'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'isbn'
              ? '978-0-123456-78-9'
              : 'Buscar por título, autor...'
          }
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  );
}
