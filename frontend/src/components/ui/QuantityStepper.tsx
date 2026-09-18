import { Minus, Plus } from 'lucide-react';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[var(--border-subtle)]">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50 disabled:opacity-30"
        aria-label="Giảm số lượng"
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-medium text-[var(--text-primary)]">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-700 hover:bg-brand-50 disabled:opacity-30"
        aria-label="Tăng số lượng"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
