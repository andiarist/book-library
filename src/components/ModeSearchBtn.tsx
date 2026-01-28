import { SearchMode } from '@/types/book';
import { Button } from './Button';

interface IModeSearchBtnProps {
  searchModeOnClick: (mode: SearchMode) => void;
  searchModeSelected: SearchMode;
  searchMode: SearchMode;
}

export const ModeSearchBtn = ({
  searchModeOnClick,
  searchModeSelected,
  searchMode,
}: IModeSearchBtnProps) => {
  return (
    <Button
      //className={searchMode === searchModeSelected ? 'active' : ''}
      className={`flex-1 hover:bg-pink-500 ${searchMode === searchModeSelected ? 'bg-pink-500' : ''}`}
      onClick={() => searchModeOnClick(searchMode)}
    >
      {searchMode === 'isbn' ? 'Buscar por ISBN' : 'Buscar por texto'}
    </Button>
  );
};
