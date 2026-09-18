import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border-subtle)] px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-brand-500">
        {icon ?? <PackageOpen size={26} />}
      </div>
      <h3 className="font-display text-lg text-brand-900">{title}</h3>
      {description && <p className="max-w-sm text-sm text-[var(--text-muted)]">{description}</p>}
      {action}
    </div>
  );
}
