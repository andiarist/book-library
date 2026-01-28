import { useState, FormEvent } from 'react';

interface ISBNSearchFormProps {
  onSearch: (isbn: string) => void;
  loading?: boolean;
}

export function ISBNSearchForm({ onSearch, loading }: ISBNSearchFormProps) {
  const [isbn, setIsbn] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isbn.trim()) {
      onSearch(isbn.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="isbn-search-form">
      <div className="form-group">
        <label htmlFor="isbn-input">ISBN</label>
        <input
          id="isbn-input"
          type="text"
          value={isbn}
          onChange={(e) => setIsbn(e.target.value)}
          placeholder="978-0-123456-78-9"
          disabled={loading}
          className="isbn-input"
        />
      </div>
      <button type="submit" disabled={loading || !isbn.trim()}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
    </form>
  );
}
