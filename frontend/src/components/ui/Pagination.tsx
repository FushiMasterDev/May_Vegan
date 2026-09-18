import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { ApiMeta } from '@/types';

export function Pagination({ meta, onPageChange }: { meta: ApiMeta; onPageChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;

  const pages = getPageList(meta.page, meta.totalPages);

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <p className="text-xs text-[var(--text-muted)]">
        Trang {meta.page}/{meta.totalPages} · {meta.total} kết quả
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50 disabled:opacity-30"
          aria-label="Trang trước"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-1 text-sm text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium',
                p === meta.page ? 'bg-brand-600 text-white' : 'text-brand-700 hover:bg-brand-50'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50 disabled:opacity-30"
          aria-label="Trang sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function getPageList(current: number, total: number): Array<number | '...'> {
  const delta = 1;
  const range: Array<number | '...'> = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  if (total > 1) range.push(total);

  return range;
}
