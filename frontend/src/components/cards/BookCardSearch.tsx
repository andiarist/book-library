import { BookMetadata } from '@/types/books.types';
import { BookInfoItem } from '../BookInfoItem';
import { Button } from '../Button';

interface BookCardSearchProps {
  book: BookMetadata;
  onAdd?: (book: BookMetadata) => void;
}

export const BookCardSearch = ({ book, onAdd }: BookCardSearchProps) => {
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
          <BookInfoItem label="Autor(es)" value={book.authors.join(', ')} />
        )}

        {book.isbn && <BookInfoItem label="ISBN" value={book.isbn} />}

        {book.publisher && (
          <BookInfoItem label="Editorial" value={book.publisher} />
        )}

        {book.publishedDate && (
          <BookInfoItem
            label="Fecha de publicación"
            value={book.publishedDate}
          />
        )}

        {book.pageCount !== undefined && book.pageCount > 0 && (
          <BookInfoItem label="Páginas" value={book.pageCount} />
        )}

        {book.categories && book.categories.length > 0 && (
          <BookInfoItem label="Categorías" value={book.categories.join(', ')} />
        )}

        {book.description && (
          <p className="mt-4 line-clamp-3 text-sm text-gray-300">
            {book.description}
          </p>
        )}

        {onAdd && (
          <Button
            variant="success"
            onClick={() => onAdd(book)}
            fullWidth
            className="mt-4"
          >
            Añadir a biblioteca
          </Button>
        )}
      </div>
    </div>
  );
};
