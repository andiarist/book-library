import { Book } from '@/types/book';
import { formatDate } from '@/helpers/dateFormatter';
import { Button } from './Button';
import { cn } from '@/helpers/cn';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface InfoFieldProps {
  label: string;
  value: string | number;
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-400">{label}:</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h3 className="m-0 mb-4 text-xl text-blue-300">{title}</h3>
      {children}
    </div>
  );
}

interface BookHeaderProps {
  book: Book;
}

function BookHeader({ book }: BookHeaderProps) {
  return (
    <div className="mb-8 flex gap-8 border-b-gray-400 pb-8">
      {book.imageUrl && (
        <img
          src={book.imageUrl}
          alt={`Portada de ${book.title}`}
          className="h-auto w-52 shrink-0 rounded-lg object-cover shadow-lg shadow-black/30"
        />
      )}
      <div className="flex-1">
        <h2 className="leading-1.2 m-0 mb-4 text-3xl">{book.title}</h2>
        {book.authors.length > 0 && (
          <p className="m-0 mb-2 text-lg text-gray-300">
            {book.authors.join(', ')}
          </p>
        )}
        {book.isbn && (
          <p className="mx-0 my-2 text-base text-gray-500">
            <strong>ISBN:</strong> {book.isbn}
          </p>
        )}
      </div>
    </div>
  );
}

interface BookDescriptionProps {
  description: string;
}

function BookDescription({ description }: BookDescriptionProps) {
  return (
    <Section title="Descripción">
      <p className="m-0 leading-7 text-gray-300">{description}</p>
    </Section>
  );
}

interface BookInformationProps {
  book: Book;
}

function BookInformation({ book }: BookInformationProps) {
  const fields = [
    { key: 'publisher', label: 'Editorial', value: book.publisher },
    {
      key: 'publishedDate',
      label: 'Fecha de publicación',
      value: book.publishedDate,
    },
    { key: 'pageCount', label: 'Páginas', value: book.pageCount },
    { key: 'language', label: 'Idioma', value: book.language },
    { key: 'saga', label: 'Saga', value: book.saga },
    { key: 'sagaNumber', label: 'Número en la saga', value: book.sagaNumber },
    {
      key: 'format',
      label: 'Formato',
      value: book.format
        ? book.format === 'digital'
          ? 'Digital'
          : 'Físico'
        : undefined,
    },
    {
      key: 'fileFormat',
      label: 'Formato de archivo',
      value: book.fileFormat?.toUpperCase(),
    },
    { key: 'filePath', label: 'Ruta del archivo', value: book.filePath },
  ].filter((field) => field.value);

  if (fields.length === 0) return null;

  return (
    <Section title="Información">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {fields.map((field) => (
          <InfoField
            key={field.key}
            label={field.label}
            value={field.value as string | number}
          />
        ))}
      </div>
    </Section>
  );
}

interface BookCategoriesProps {
  categories: string[];
}

function BookCategories({ categories }: BookCategoriesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <Section title="Categorías">
      <div className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <span
            key={index}
            className="bg-gra border border-gray-400 px-4 py-2 text-sm text-gray-200"
          >
            {category}
          </span>
        ))}
      </div>
    </Section>
  );
}

interface BookMetadataProps {
  addedAt: string;
  lastModified: string;
}

function BookMetadata({ addedAt, lastModified }: BookMetadataProps) {
  return (
    <Section title="Metadata">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        <InfoField label="Añadido" value={formatDate(addedAt)} />
        <InfoField
          label="Última modificación"
          value={formatDate(lastModified)}
        />
      </div>
    </Section>
  );
}

export function BookDetail({
  book,
  onClose,
  onDelete,
  onEdit,
}: BookDetailProps) {
  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-200 overflow-y-auto rounded-xl bg-amber-200 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className={cn(
            'absolute top-4 right-4 z-1 h-32 w-8',
            'flex items-center justify-center',
            'rounded-full border-0 text-lg text-white transition-colors duration-200',
            'cursor-pointer bg-gray-700 hover:bg-gray-900'
          )}
          onClick={onClose}
        >
          ✕
        </Button>

        <div className="p-8">
          <BookHeader book={book} />

          <div className="flex flex-col gap-8">
            {book.description && (
              <BookDescription description={book.description} />
            )}
            <BookInformation book={book} />
            <BookCategories categories={book.categories || []} />
            <BookMetadata
              addedAt={book.addedAt}
              lastModified={book.lastModified}
            />
          </div>

          {(onEdit || onDelete) && (
            <div className="mt-8 flex justify-end gap-3 border-t border-t-gray-500 pt-8">
              {onEdit && (
                <Button variant="primary" onClick={onEdit}>
                  ✏️ Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" onClick={onDelete}>
                  🗑️ Eliminar de la biblioteca
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
