import { BookMetadata } from '@/types/book';
import { BookCard } from './BookCard';

interface BookListProps {
  books: BookMetadata[];
  onAddBook?: (book: BookMetadata) => void;
  emptyMessage?: string;
}

export function BookList({ books, onAddBook, emptyMessage }: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="empty-results">
        <p>{emptyMessage || 'No se encontraron resultados'}</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      <p className="results-count">
        {books.length} {books.length === 1 ? 'resultado' : 'resultados'}{' '}
        encontrado{books.length === 1 ? '' : 's'}
      </p>
      <div className="book-grid">
        {books.map((book, index) => (
          <BookCard
            key={`book-${index}`}
            book={book}
            onAdd={onAddBook ? () => onAddBook(book) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
