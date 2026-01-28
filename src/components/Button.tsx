type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`cursor-pointer rounded-[1vw] bg-sky-500 px-6 py-3 text-base font-medium text-white transition-colors hover:not-disabled:bg-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
    />
  );
}
