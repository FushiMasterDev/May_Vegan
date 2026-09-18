export function RankedBarList({
  items,
}: {
  items: Array<{ label: string; value: number; valueLabel: string }>;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, idx) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-xs font-semibold text-[var(--text-muted)]">{idx + 1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--text-primary)] line-clamp-1">{item.label}</span>
              <span className="shrink-0 text-xs text-[var(--text-muted)]">{item.valueLabel}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
