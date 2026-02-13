import { ScanResultsModal } from '@/components/modals/ScanResultsModal';
import { BookDetail } from '@/components/modals/DetailBookModal';
import { EditLibraryBookModal } from '@/components/modals/EditLibraryBookModal';
import { BookPreview } from '@/components/previews/BookPreview';
import { Book } from '@/types/books.types';
import { ScanLibraryResult } from '@/api/books.api';

type Props = {
  books: Book[];

  showResults: boolean;
  onCloseResults: () => void;
  scanResults: ScanLibraryResult | null;

  selectedBook: Book | null;
  onCloseSelected: () => void;
  onEditFromDetail: (book: Book) => void;

  editingBook: Book | null;
  onCloseEditing: () => void;

  previewBook: Book | null;
  onClosePreview: () => void;
};

export function LibraryModalHost({
  books,

  showResults,
  onCloseResults,
  scanResults,

  selectedBook,
  onCloseSelected,
  onEditFromDetail,

  editingBook,
  onCloseEditing,

  previewBook,
  onClosePreview,
}: Props) {
  const selectedBookFresh =
    selectedBook &&
    (books.find((b) => b.id === selectedBook.id) || selectedBook);

  return (
    <>
      <ScanResultsModal
        isOpen={showResults}
        onClose={onCloseResults}
        results={scanResults}
      />

      {selectedBookFresh && (
        <BookDetail
          book={selectedBookFresh}
          onClose={onCloseSelected}
          onEdit={() => onEditFromDetail(selectedBookFresh)}
        />
      )}

      {editingBook && (
        <EditLibraryBookModal book={editingBook} onClose={onCloseEditing} />
      )}

      {previewBook && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Vista previa: {previewBook.title}
                </h2>
                <button
                  onClick={onClosePreview}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                <BookPreview book={previewBook} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
