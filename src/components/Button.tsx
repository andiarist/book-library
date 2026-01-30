import { cn } from '@/helpers/cn';
import { ButtonHTMLAttributes } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-sky-500 text-white',
    'hover:bg-sky-500/50',
    'disabled:opacity-50 disabled:hover:bg-sky-500'
  ),
  secondary: cn(
    'bg-gray-500 text-white',
    'hover:bg-gray-600',
    'disabled:opacity-50 disabled:hover:bg-gray-500'
  ),
  success: cn(
    'bg-green-500 text-white',
    'hover:bg-green-600',
    'disabled:opacity-50 disabled:hover:bg-green-500'
  ),
  danger: cn(
    'bg-red-500 text-white',
    'hover:bg-red-600',
    'disabled:opacity-50 disabled:hover:bg-red-500'
  ),
  ghost: cn(
    'bg-transparent border-2 border-current',
    'hover:bg-gray-100 dark:hover:bg-gray-800'
  ),
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        // Base styles
        'cursor-pointer rounded-lg font-medium transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        // Width
        fullWidth && 'w-full',
        // Custom className
        className
      )}
    >
      {children}
    </button>
  );
}
