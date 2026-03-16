import { cn } from '@/helpers/cn';
import { ReactNode } from 'react';
import { SadFaceIcon } from '@/components/icons';

type NoResultsStateProps = {
  title?: string;
  message: ReactNode;
  suggestion?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'bordered';
  className?: string;
  icon?: ReactNode;
};

export function NoResultsState({
  title = 'No se encontraron resultados',
  message,
  suggestion,
  action,
  variant = 'default',
  className,
  icon,
}: NoResultsStateProps) {
  const containerClasses = cn(
    'flex flex-col items-center justify-center px-6',
    variant === 'default' && 'py-16',
    variant === 'bordered' &&
      'rounded-lg border border-gray-200 bg-gray-50 p-8',
    className
  );

  const defaultIcon = (
    <SadFaceIcon
      className="mx-auto mb-4 h-16 w-16 text-gray-400"
      strokeWidth={variant === 'bordered' ? 1.5 : 2}
    />
  );

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          'text-center',
          variant === 'bordered' && 'mx-auto max-w-md'
        )}
      >
        {icon || defaultIcon}

        <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>

        <p
          className={cn(
            variant === 'default' ? 'text-gray-500' : 'text-gray-600'
          )}
        >
          {message}
        </p>

        {suggestion && (
          <p className="mt-2 text-sm text-gray-500">{suggestion}</p>
        )}

        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              'mt-6 rounded-lg bg-blue-600 px-6 py-2.5',
              'font-semibold text-white transition-colors',
              'hover:bg-blue-700 focus:ring-2 focus:outline-none',
              'focus:ring-blue-500 focus:ring-offset-2'
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
