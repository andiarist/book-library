import { SpinnerIcon } from '@/components/icons';

export const SearchLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <SpinnerIcon className="mb-4 h-12 w-12 text-blue-600" />
      <p className="text-lg font-medium text-gray-700">Buscando libros...</p>
      <p className="mt-2 text-sm text-gray-500">
        Consultando Google Books y Open Library
      </p>
    </div>
  );
};
