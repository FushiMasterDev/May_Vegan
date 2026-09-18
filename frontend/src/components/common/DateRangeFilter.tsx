import clsx from 'clsx';
import { Input } from '@/components/ui/Input';
import type { RevenueRange } from '@/services/reportApi';

const RANGE_OPTIONS: Array<{ value: RevenueRange; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year', label: 'Năm nay' },
  { value: 'custom', label: 'Tuỳ chọn' },
];

export function DateRangeFilter({
  range,
  from,
  to,
  onRangeChange,
  onFromChange,
  onToChange,
}: {
  range: RevenueRange;
  from: string;
  to: string;
  onRangeChange: (range: RevenueRange) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onRangeChange(opt.value)}
          className={clsx(
            'rounded-full border px-3.5 py-2 text-xs font-medium transition',
            range === opt.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-300'
          )}
        >
          {opt.label}
        </button>
      ))}
      {range === 'custom' && (
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="w-40" />
          <span className="text-xs text-[var(--text-muted)]">đến</span>
          <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="w-40" />
        </div>
      )}
    </div>
  );
}
