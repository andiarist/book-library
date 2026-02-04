import { Button } from '@/components/Button';
import { BookCardSearch } from '@/components/cards/BookCardSearch';
import { Input } from '@/components/Input';
import { useSearchBooksByText } from '@/hooks/useBooks';
import { BookMetadata } from '@/types/books.types';
import { FormEvent, useState } from 'react';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [editingBook, setEditingBook] = useState<BookMetadata | null>(null);

  const {
    data: books,
    isFetching,
    isError,
    refetch,
  } = useSearchBooksByText(query.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      refetch();
    }
  };

  const handleAddToLibrary = (bookMetadata: BookMetadata) => {
    // Abrir modal para editar metadata antes de añadir
    setEditingBook(bookMetadata);
  };

  return (
    <section className="animate-fadeIn rounded-lg p-8">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-4">
        <div className="flex-1">
          <Input
            id={`search-text-input`}
            type="text"
            label={'Búsqueda por texto'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={'Buscar por título, autor...'}
            disabled={isFetching}
          />
        </div>
        <Button type="submit" disabled={isFetching || !query.trim()}>
          {isFetching ? 'Buscando...' : 'Buscar'}
        </Button>
      </form>
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0">Resultado:</h3>
        </div>
        {books && books.length > 0 ? (
          <>
            <div className="mt-4">
              <p className="mb-4 text-base text-gray-700">
                {books.length} {books.length === 1 ? 'resultado' : 'resultados'}{' '}
                encontrado{books.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
              {books.map((book, index) => (
                <BookCardSearch
                  key={`book-${index}`}
                  book={book}
                  onAdd={(book) => handleAddToLibrary(book)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-500 italic">
            <p>No se encontraron resultados</p>
          </div>
        )}
      </div>
    </section>
  );
};
