import { useState, FormEvent } from 'react';

interface TitleSearchFormProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function TitleSearchForm({
  onSearch,
  loading,
  placeholder = 'Buscar por título, autor...',
}: TitleSearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-search-form">
      <div className="form-group">
        <label htmlFor="text-search-input">Búsqueda por texto</label>
        <input
          id="text-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="text-search-input"
        />
      </div>
      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
}
