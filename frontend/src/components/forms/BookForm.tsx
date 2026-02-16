import { Input } from '../Input';
import { SeriesSearchInput } from '../SeriesSearchInput';
import { BookFormat } from '@/types/books.types';

export interface BookFormData {
  title: string;
  authors: string[];
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  publishedDate?: string;
  pageCount?: number;
  description?: string;
  categories: string[];
  seriesName?: string;
  seriesOrder?: number;
  format?: BookFormat;
}

interface BookFormProps {
  formData: BookFormData;
  onChange: (data: BookFormData) => void;
  showFormatSelector?: boolean;
  formatOptions?: BookFormat[];
}

export const BookForm = ({
  formData,
  onChange,
  showFormatSelector = true,
  formatOptions = ['EPUB', 'PDF', 'MOBI', 'AZW3', 'PHYSICAL'],
}: BookFormProps) => {
  const updateField = <K extends keyof BookFormData>(
    field: K,
    value: BookFormData[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Título */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Título *
        </label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          required
        />
      </div>

      {/* Autores */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Autor(es) * (separados por coma)
        </label>
        <Input
          type="text"
          value={formData.authors.join(', ')}
          onChange={(e) =>
            updateField(
              'authors',
              e.target.value.split(',').map((a) => a.trim())
            )
          }
          required
        />
      </div>

      {/* ISBN */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ISBN
        </label>
        <Input
          type="text"
          value={formData.isbn || ''}
          onChange={(e) => updateField('isbn', e.target.value || undefined)}
        />
      </div>

      {/* Editorial */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Editorial
        </label>
        <Input
          type="text"
          value={formData.publisher || ''}
          onChange={(e) =>
            updateField('publisher', e.target.value || undefined)
          }
        />
      </div>

      {/* Año de publicación o fecha */}
      {formData.publishYear !== undefined ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Año de publicación
          </label>
          <Input
            type="number"
            value={formData.publishYear || ''}
            onChange={(e) =>
              updateField(
                'publishYear',
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Fecha de publicación
          </label>
          <Input
            type="text"
            value={formData.publishedDate || ''}
            onChange={(e) =>
              updateField('publishedDate', e.target.value || undefined)
            }
            placeholder="Ej: 2023-01-15"
          />
        </div>
      )}

      {/* Número de páginas */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Número de páginas
        </label>
        <Input
          type="number"
          value={formData.pageCount || ''}
          onChange={(e) =>
            updateField(
              'pageCount',
              e.target.value ? parseInt(e.target.value) : undefined
            )
          }
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Categorías (separadas por coma)
        </label>
        <Input
          type="text"
          value={formData.categories.join(', ')}
          onChange={(e) =>
            updateField(
              'categories',
              e.target.value
                ? e.target.value.split(',').map((c) => c.trim())
                : []
            )
          }
          placeholder="Ej: Ficción, Aventura, Fantasía"
        />
      </div>

      {/* Serie */}
      <SeriesSearchInput
        value={formData.seriesName || ''}
        onChange={(value) => updateField('seriesName', value || undefined)}
        placeholder="Nombre de la serie"
      />

      {/* Número de serie */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Número en la serie
        </label>
        <Input
          type="number"
          step="0.1"
          value={formData.seriesOrder || ''}
          onChange={(e) =>
            updateField(
              'seriesOrder',
              e.target.value ? parseFloat(e.target.value) : undefined
            )
          }
          placeholder="Ej: 1, 1.5, 2, 2.1..."
        />
      </div>

      {/* Formato */}
      {showFormatSelector && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Formato
          </label>
          <select
            value={formData.format || ''}
            onChange={(e) =>
              updateField(
                'format',
                e.target.value ? (e.target.value as BookFormat) : undefined
              )
            }
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 focus:border-blue-500 focus:outline-none"
          >
            {!formData.format && <option value="">Seleccionar formato</option>}
            {formatOptions.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Descripción */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) =>
            updateField('description', e.target.value || undefined)
          }
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 focus:border-blue-500 focus:outline-none"
          placeholder="Descripción del libro"
        />
      </div>
    </div>
  );
};
