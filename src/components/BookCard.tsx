import { BookMetadata } from '@/types/book';
import { Button } from './Button';

interface BookCardProps {
  book: BookMetadata;
  onAdd?: () => void;
}

export function BookCard({ book, onAdd }: BookCardProps) {
  console.log(book);
  console.log('pageCount:', book.pageCount, 'type:', typeof book.pageCount);

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg bg-emerald-600 p-6">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={`Portada de ${book.title}`}
          className="mx-auto h-auto w-full max-w-37.5 rounded-sm object-cover shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        />
      )}
      <div className="flex-1">
        <h3 className="mt-0 mb-3 text-lg leading-5">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="authors">
            <strong>Autor(es):</strong> {book.authors.join(', ')}
          </p>
        )}
        {book.isbn && (
          <p className="mx-0 my-2 text-base leading-1.5">
            <strong>ISBN:</strong> {book.isbn}
          </p>
        )}
        {book.publisher && (
          <p className="mx-0 my-2 text-base leading-1.5">
            <strong>Editorial:</strong> {book.publisher}
          </p>
        )}
        {book.publishedDate && (
          <p className="text-base-date mx-0 my-2 leading-1.5">
            <strong>Fecha de publicación:</strong> {book.publishedDate}
          </p>
        )}
        {book.pageCount !== undefined && book.pageCount > 0 && (
          <p className="mx-0 my-2 text-base leading-1.5">
            <strong>Páginas:</strong> {book.pageCount}
          </p>
        )}
        {book.categories && book.categories.length > 0 && (
          <p className="mx-0 my-2 text-base leading-1.5">
            <strong>Categorías:</strong> {book.categories.join(', ')}
          </p>
        )}
        {book.description && (
          <p className="mt-4 line-clamp-3 text-sm text-gray-300">
            {book.description}
          </p>
        )}
        {onAdd && (
          <Button
            onClick={onAdd}
            className="mt-4 w-full bg-green-300 hover:bg-green-500"
          >
            Añadir a biblioteca
          </Button>
        )}
      </div>
    </div>
  );
}
