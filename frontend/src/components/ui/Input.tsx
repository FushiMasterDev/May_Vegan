import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-900">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-11 w-full rounded-xl border bg-[var(--bg-surface)] px-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 focus:ring-brand-400',
            leftIcon && 'pl-10',
            error ? 'border-red-400 focus:ring-red-300' : 'border-[var(--border-subtle)]',
            props.disabled && 'opacity-60',
            className
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
});
