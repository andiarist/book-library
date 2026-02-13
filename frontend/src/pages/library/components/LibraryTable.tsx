import { Book } from '@/types/books.types';
import {
  EyeIcon,
  EditIcon,
  DocumentIcon,
  TrashIcon,
} from '../../../components/icons';

interface ILibraryTableProps {
  books: Book[];
  currentPage: number;
  itemsPerPage: number;
  handleViewDetail: (value: Book | null) => void;
  handleEdit: (value: Book | null) => void;
  handlePreview: (value: Book | null) => void;
  handleDelete: (value: Book) => void;
}

const formatBadgeClass: Record<string, string> = {
  EPUB: 'bg-blue-100 text-blue-800',
  PDF: 'bg-red-100 text-red-800',
  PHYSICAL: 'bg-green-100 text-green-800',
};

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'center';
}) {
  const base = 'border-b border-gray-200 px-4 py-3 font-semibold text-gray-900';
  const cls = align === 'center' ? `${base} text-center` : base;
  return <th className={cls}>{children}</th>;
}

export const LibraryTable = ({
  books,
  currentPage,
  itemsPerPage,
  handleViewDetail,
  handleEdit,
  handlePreview,
  handleDelete,
}: ILibraryTableProps) => {
  const offset = (currentPage - 1) * itemsPerPage;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse bg-white text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th>#</Th>
            <Th>Nombre del libro</Th>
            <Th>Autor</Th>
            <Th>Serie</Th>
            <Th>Índice serie</Th>
            <Th>Formato</Th>
            <Th align="center">Acciones</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {books.map((book, index) => (
            <tr key={book.id} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">{offset + index + 1}</td>

              <td className="px-4 py-3 font-medium text-gray-900">
                {book.title}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {book.authors.map((a) => a.name).join(', ') || '-'}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {book.series?.name || '-'}
              </td>

              <td className="px-4 py-3 text-center text-gray-600">
                {book.seriesOrder ?? '-'}
              </td>

              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    formatBadgeClass[book.format] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {book.format}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  {/* Ver detalle */}
                  <button
                    onClick={() => handleViewDetail(book)}
                    className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                    title="Ver detalle"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => handleEdit(book)}
                    className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50"
                    title="Editar"
                  >
                    <EditIcon className="h-5 w-5" />
                  </button>

                  {/* Vista previa (solo si tiene archivo) */}
                  {book.filePath && (
                    <button
                      onClick={() => handlePreview(book)}
                      className="rounded p-1.5 text-purple-600 transition-colors hover:bg-purple-50"
                      title="Vista previa"
                    >
                      <DocumentIcon className="h-5 w-5" />
                    </button>
                  )}

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(book)}
                    className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
