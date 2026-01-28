import { Book } from '@/types/book';

interface LibraryBookCardProps {
  book: Book;
  onClick?: () => void;
}

export function LibraryBookCard({ book, onClick }: LibraryBookCardProps) {
  return (
    <div className="library-book-card" onClick={onClick}>
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={`Portada de ${book.title}`}
          className="library-book-cover"
        />
      )}
      <div className="library-book-info">
        <h3>{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="library-authors">{book.authors.join(', ')}</p>
        )}
        <div className="library-book-meta">
          {book.pageCount && (
            <span className="meta-item">📖 {book.pageCount} páginas</span>
          )}
          {book.fileFormat && (
            <span className="meta-item">
              📄 {book.fileFormat.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
