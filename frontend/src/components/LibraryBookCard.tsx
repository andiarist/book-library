import { Book } from '@/types/book';
import { Button } from './Button';

interface LibraryBookCardProps {
  book: Book;
  onClick?: () => void;
  onEdit?: () => void;
}

export function LibraryBookCard({
  book,
  onClick,
  onEdit,
}: LibraryBookCardProps) {
  return (
    <div
      className="relative flex h-full cursor-pointer gap-4 rounded-lg bg-amber-200 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      onClick={onClick}
    >
      {onEdit && (
        <Button
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-blue-500 p-0 text-white hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Editar libro"
        >
          ✏️
        </Button>
      )}
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={`Portada de ${book.title}`}
          className="h-32 w-20 shrink-0 rounded-sm object-cover shadow-md shadow-black/20"
        />
      )}
      <div className="min-w-0 flex-1 flex-col gap-2">
        <h3 className="m-0 line-clamp-2 text-lg leading-5">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="m-0 line-clamp-1 text-sm text-gray-400">
            {book.authors.join(', ')}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-1">
          {book.pageCount && (
            <span className="meta-item">📖 {book.pageCount} páginas</span>
          )}
          {book.fileFormat && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              📄 {book.fileFormat.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
