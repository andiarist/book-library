import { Book } from '@/types/books.types';

interface BookCardMiniProps {
  book: Book;
  onClick?: () => void;
}

export const BookCardMini = ({ book, onClick }: BookCardMiniProps) => {
  return (
    <div
      className="flex h-full cursor-pointer gap-4 rounded-lg bg-amber-200 p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      onClick={onClick}
      data-testid="book-card-mini"
      key={book.id}
    >
      {book.coverPath && (
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}${book.coverPath}`}
          alt={`Portada de ${book.title}`}
          className="h-32 w-20 shrink-0 rounded-sm object-cover shadow-md shadow-black/20"
        />
      )}
      <div className="min-w-0 flex-1 flex-col gap-2">
        <h3 className="m-0 line-clamp-2 text-lg leading-5">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="m-0 line-clamp-1 text-sm text-gray-400">
            {book.authors.map((a) => a.name).join(', ')}
          </p>
        )}
        <div className="mt-auto flex flex-col gap-1">
          {book.series && (
            <span className="flex items-center gap-1 text-sm font-medium text-purple-700">
              📚 {book.series.name}
              {book.seriesOrder && ` #${book.seriesOrder}`}
            </span>
          )}
          {book.pageCount && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              📖 {book.pageCount} páginas
            </span>
          )}
          {book.format && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              📄 {book.format.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
