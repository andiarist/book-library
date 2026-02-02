import { cn } from '@/helpers/cn';

interface BookInfoItemProps {
  label: string;
  value: string | number;
  className?: string;
}

export function BookInfoItem({ label, value, className }: BookInfoItemProps) {
  return (
    <p className={cn('mx-0 my-2 text-base leading-1.5', className)}>
      <strong>{label}:</strong> {value}
    </p>
  );
}
