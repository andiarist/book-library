import { useState, FormEvent, useEffect } from 'react';
import { Button } from './Button';
import { SearchMode } from '@/types/book';

interface SearchFormProps {
  onSearch: (query: string) => void;
  mode: SearchMode;
  loading?: boolean;
}

export function SearchForm({ onSearch, mode, loading }: SearchFormProps) {
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
        <label htmlFor="isbn-input" className="mb-2 block font-medium">
          {mode === 'isbn' ? 'ISBN' : 'Búsqueda por texto'}
        </label>
        <input
          id={`${mode}-input`}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'isbn'
              ? '978-0-123456-78-9'
              : 'Buscar por título, autor...'
          }
          disabled={loading}
          className="w-full rounded-sm border border-gray-400 p-3 text-base focus:border-sky-400 focus:outline-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  );
}
