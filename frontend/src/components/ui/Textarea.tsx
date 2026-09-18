import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={props.rows ?? 4}
        className={clsx(
          'w-full resize-y rounded-xl border bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 focus:ring-brand-400',
          error ? 'border-red-400 focus:ring-red-300' : 'border-[var(--border-subtle)]',
          props.disabled && 'opacity-60',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
});
