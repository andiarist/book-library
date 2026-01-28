import { BookMetadata } from '@/types/book';

interface BookCardProps {
  book: BookMetadata;
  onAdd?: () => void;
}

export function BookCard({ book, onAdd }: BookCardProps) {
  console.log(book);
  console.log('pageCount:', book.pageCount, 'type:', typeof book.pageCount);

  return (
    <div className="book-card">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={`Portada de ${book.title}`}
          className="book-cover"
        />
      )}
      <div className="book-info">
        <h3>{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="authors">
            <strong>Autor(es):</strong> {book.authors.join(', ')}
          </p>
        )}
        {book.isbn && (
          <p className="isbn">
            <strong>ISBN:</strong> {book.isbn}
          </p>
        )}
        {book.publisher && (
          <p className="publisher">
            <strong>Editorial:</strong> {book.publisher}
          </p>
        )}
        {book.publishedDate && (
          <p className="published-date">
            <strong>Fecha de publicación:</strong> {book.publishedDate}
          </p>
        )}
        {book.pageCount !== undefined && book.pageCount > 0 && (
          <p className="page-count">
            <strong>Páginas:</strong> {book.pageCount}
          </p>
        )}
        {book.categories && book.categories.length > 0 && (
          <p className="categories">
            <strong>Categorías:</strong> {book.categories.join(', ')}
          </p>
        )}
        {book.description && <p className="description">{book.description}</p>}
        {onAdd && (
          <button onClick={onAdd} className="add-button">
            Añadir a biblioteca
          </button>
        )}
      </div>
    </div>
  );
}
