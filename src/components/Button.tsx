import { cn } from '@/helpers/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'cursor-pointer rounded-lg bg-sky-500 px-6 py-3',
        'text-base font-medium text-white transition-colors',
        'hover:bg-sky-500/50',
        'disabled:opacity-50 disabled:hover:bg-sky-500',
        className
      )}
    />
  );
}
