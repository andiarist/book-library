import { Book } from '@/types/book';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onDelete?: () => void;
}

export function BookDetail({ book, onClose, onDelete }: BookDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="book-detail-overlay" onClick={onClose}>
      <div className="book-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        <div className="book-detail-content">
          <div className="book-detail-header">
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={`Portada de ${book.title}`}
                className="book-detail-cover"
              />
            )}
            <div className="book-detail-header-info">
              <h2>{book.title}</h2>
              {book.authors.length > 0 && (
                <p className="detail-authors">{book.authors.join(', ')}</p>
              )}
              {book.isbn && (
                <p className="detail-isbn">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}
            </div>
          </div>

          <div className="book-detail-body">
            {book.description && (
              <div className="detail-section">
                <h3>Descripción</h3>
                <p className="detail-description">{book.description}</p>
              </div>
            )}

            <div className="detail-section">
              <h3>Información</h3>
              <div className="detail-info-grid">
                {book.publisher && (
                  <div className="info-item">
                    <span className="info-label">Editorial:</span>
                    <span className="info-value">{book.publisher}</span>
                  </div>
                )}
                {book.publishedDate && (
                  <div className="info-item">
                    <span className="info-label">Fecha de publicación:</span>
                    <span className="info-value">{book.publishedDate}</span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="info-item">
                    <span className="info-label">Páginas:</span>
                    <span className="info-value">{book.pageCount}</span>
                  </div>
                )}
                {book.language && (
                  <div className="info-item">
                    <span className="info-label">Idioma:</span>
                    <span className="info-value">{book.language}</span>
                  </div>
                )}
                {book.fileFormat && (
                  <div className="info-item">
                    <span className="info-label">Formato:</span>
                    <span className="info-value">
                      {book.fileFormat.toUpperCase()}
                    </span>
                  </div>
                )}
                {book.filePath && (
                  <div className="info-item">
                    <span className="info-label">Ruta del archivo:</span>
                    <span className="info-value file-path">
                      {book.filePath}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="detail-section">
                <h3>Categorías</h3>
                <div className="categories-list">
                  {book.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h3>Metadata</h3>
              <div className="detail-info-grid">
                <div className="info-item">
                  <span className="info-label">Añadido:</span>
                  <span className="info-value">{formatDate(book.addedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Última modificación:</span>
                  <span className="info-value">
                    {formatDate(book.lastModified)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {onDelete && (
            <div className="book-detail-footer">
              <button className="delete-button" onClick={onDelete}>
                🗑️ Eliminar de la biblioteca
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
