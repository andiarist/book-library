import { SearchMode } from '@/types/book';
import { Button } from './Button';
import { cn } from '@/helpers/cn';

interface IModeSearchBtnProps {
  searchModeOnClick: (mode: SearchMode) => void;
  isActive: boolean;
  searchMode: SearchMode;
}

export const ModeSearchBtn = ({
  searchModeOnClick,
  isActive,
  searchMode,
}: IModeSearchBtnProps) => {
  return (
    <Button
      className={cn('flex-1 hover:bg-gray-500', isActive && 'bg-sky-700')}
      onClick={() => searchModeOnClick(searchMode)}
    >
      {searchMode === 'isbn' ? 'Buscar por ISBN' : 'Buscar por texto'}
    </Button>
  );
};
