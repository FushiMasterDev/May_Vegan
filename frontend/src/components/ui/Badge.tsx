import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeColor = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'purple' | 'orange';

const COLOR_CLASSES: Record<BadgeColor, string> = {
  green: 'bg-brand-100 text-brand-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
  blue: 'bg-sky-100 text-sky-700',
  purple: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
};

export function Badge({ color = 'gray', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        COLOR_CLASSES[color]
      )}
    >
      {children}
    </span>
  );
}
