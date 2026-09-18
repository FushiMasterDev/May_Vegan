import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm',
        className
      )}
      {...props}
    />
  );
}
