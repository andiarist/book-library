import { BookCardSearch } from '@/components/cards/BookCardSearch';
import { BookMetadata } from '@/types/books.types';

interface SearchResultsProps {
  books: BookMetadata[];
  onAddBook: (book: BookMetadata) => void;
}

export const SearchResults = ({ books, onAddBook }: SearchResultsProps) => {
  const resultsCount = books.length;
  const resultsText =
    resultsCount === 1
      ? '1 resultado encontrado'
      : `${resultsCount} resultados encontrados`;

  return (
    <>
      <div className="mb-4">
        <p className="text-base text-gray-700">{resultsText}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {books.map((book, index) => (
          <BookCardSearch
            key={book.isbn || `${book.title}-${book.authors?.[0]}-${index}`}
            book={book}
            onAdd={onAddBook}
          />
        ))}
      </div>
    </>
  );
};
