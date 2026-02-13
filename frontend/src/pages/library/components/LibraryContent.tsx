import { BookCardMini } from '@/components/cards/BookCardMini';
import { LibraryTable } from '@/pages/library/components/LibraryTable';
import { Book } from '@/types/books.types';
import type { ViewMode } from '../useLibraryPage';

type Props = {
  viewMode: ViewMode;
  books: Book[];

  currentPage: number;
  itemsPerPage: number;

  onViewDetail: (book: Book | null) => void;
  onEdit: (book: Book | null) => void;
  onPreview: (book: Book | null) => void;
  onDelete: (book: Book) => void;
};

export function LibraryContent({
  viewMode,
  books,
  currentPage,
  itemsPerPage,
  onViewDetail,
  onEdit,
  onPreview,
  onDelete,
}: Props) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {books.map((book) => (
          <div key={book.id} className="h-full">
            <BookCardMini book={book} onClick={() => onViewDetail(book)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <LibraryTable
      books={books}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      handleViewDetail={onViewDetail}
      handleEdit={onEdit}
      handlePreview={onPreview}
      handleDelete={onDelete}
    />
  );
}
