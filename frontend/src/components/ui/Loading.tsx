import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export function Spinner({ size = 24, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={clsx('animate-spin text-brand-600', className)} />;
}

export function PageLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size={32} />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-skeleton rounded-lg bg-cream-200', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
