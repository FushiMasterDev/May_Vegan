import type { ReactNode } from 'react';
import clsx from 'clsx';

export function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: 'brand' | 'accent' | 'wood';
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            accent === 'accent' ? 'bg-accent-100 text-accent-600' : accent === 'wood' ? 'bg-wood-400/20 text-wood-600' : 'bg-brand-100 text-brand-600'
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
          <p className="font-display text-xl text-brand-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
