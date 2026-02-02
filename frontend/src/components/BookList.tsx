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
      <div className="p-8 text-center text-gray-500 italic">
        <p>{emptyMessage || 'No se encontraron resultados'}</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-4 text-base text-gray-700">
        {books.length} {books.length === 1 ? 'resultado' : 'resultados'}{' '}
        encontrado{books.length === 1 ? '' : 's'}
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
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
