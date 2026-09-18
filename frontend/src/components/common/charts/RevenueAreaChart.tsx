import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/format';

const BRAND_LINE = '#567539';
const BRAND_FILL = '#6f9349';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-[var(--text-primary)]">{label}</p>
      <p className="mt-0.5 text-[var(--text-muted)]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function RevenueAreaChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  const formatted = data.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_FILL} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BRAND_FILL} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e7e2d6" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#8a8677' }}
          axisLine={{ stroke: '#e7e2d6' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#8a8677' }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr` : `${Math.round(v / 1000)}k`)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={BRAND_LINE}
          strokeWidth={2}
          fill="url(#revenueFill)"
          dot={false}
          activeDot={{ r: 4, fill: BRAND_LINE, stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
