import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BRAND = '#6f9349';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="mt-0.5 text-[var(--text-muted)]">{payload[0].value.toLocaleString('vi-VN')}</p>
    </div>
  );
}

export function SimpleBarChart({
  data,
  valueFormatter,
  height = 240,
}: {
  data: Array<{ label: string; value: number }>;
  valueFormatter?: (value: number) => string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#e7e2d6" strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8a8677' }} axisLine={{ stroke: '#e7e2d6' }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#8a8677' }}
          axisLine={false}
          tickLine={false}
          width={40}
          tickFormatter={valueFormatter}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(111,147,73,0.08)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell key={i} fill={BRAND} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
