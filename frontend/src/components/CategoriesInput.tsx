import { useState, useRef, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';

interface CategoriesInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
}

export const CategoriesInput = ({
  value,
  onChange,
  placeholder = 'Escribe para buscar o añadir categorías',
  label = 'Categorías',
}: CategoriesInputProps) => {
  const { data: categoriesList, isLoading } = useCategories();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar categorías según el texto introducido
  useEffect(() => {
    if (!categoriesList || !inputValue) {
      setFilteredCategories([]);
      return;
    }

    const searchText = inputValue.toLowerCase().trim();
    const filtered = categoriesList.filter(
      (category) =>
        category.name.toLowerCase().includes(searchText) &&
        !value.includes(category.name)
    );

    setFilteredCategories(filtered);
  }, [inputValue, categoriesList, value]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);
  };

  const handleAddCategory = (categoryName: string) => {
    if (!value.includes(categoryName) && categoryName.trim()) {
      onChange([...value, categoryName.trim()]);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onChange(value.filter((cat) => cat !== categoryToRemove));
  };

  const handleInputFocus = () => {
    if (categoriesList && categoriesList.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddCategory(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Eliminar la última categoría si se presiona backspace con input vacío
      onChange(value.slice(0, -1));
    }
  };

  // Mostrar categorías disponibles no seleccionadas
  const availableCategories = categoriesList?.filter(
    (cat) => !value.includes(cat.name)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Contenedor de tags y input */}
      <div className="min-h-[42px] w-full rounded-md border border-gray-300 px-3 py-2 transition-colors duration-200 focus-within:border-blue-500">
        <div className="flex flex-wrap gap-2">
          {/* Tags de categorías seleccionadas */}
          {value.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
            >
              {category}
              <button
                type="button"
                onClick={() => handleRemoveCategory(category)}
                className="text-blue-700 hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}

          {/* Input para añadir nuevas categorías */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={value.length === 0 ? placeholder : ''}
              autoComplete="off"
              className="w-full border-none bg-transparent p-0 text-gray-700 outline-none"
            />
            {isLoading && inputValue && (
              <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown de resultados filtrados */}
      {showDropdown && filteredCategories.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
          <div className="py-1">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleAddCategory(category.name)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay coincidencias pero hay texto */}
      {showDropdown &&
        inputValue.trim().length > 0 &&
        filteredCategories.length === 0 &&
        !isLoading &&
        categoriesList &&
        categoriesList.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-500 shadow-lg">
            No se encontró ninguna categoría. Presiona Enter para crear &ldquo;
            {inputValue}&rdquo;
          </div>
        )}

      {/* Mostrar todas las categorías disponibles al hacer foco */}
      {showDropdown &&
        !inputValue &&
        availableCategories &&
        availableCategories.length > 0 &&
        !isLoading && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
            <div className="px-4 py-2 text-xs font-medium text-gray-500">
              Categorías disponibles ({availableCategories.length})
            </div>
            <div className="py-1">
              {availableCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleAddCategory(category.name)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
