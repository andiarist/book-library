import { ReactNode, useRef } from 'react';
import { Button } from '../Button';
import { cn } from '@/helpers/cn';

interface BookFormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}

export const BookFormModal = ({
  title,
  isOpen,
  onClose,
  children,
  testId = 'book-form-modal',
}: BookFormModalProps) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 p-4"
      data-testid={testId}
    >
      <div
        ref={modalContentRef}
        className="relative max-h-[90vh] w-full max-w-200 overflow-y-auto rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className={cn(
            'absolute top-4 right-4 z-1 h-8 w-8',
            'flex items-center justify-center',
            'rounded-full border-0 text-lg text-white transition-colors duration-200',
            'cursor-pointer bg-gray-700 hover:bg-gray-900'
          )}
          onClick={onClose}
        >
          ✕
        </Button>

        <div className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export const useModalScroll = () => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    modalContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { modalContentRef, scrollToTop };
};
