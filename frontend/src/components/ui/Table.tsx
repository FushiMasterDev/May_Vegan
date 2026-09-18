import type { ReactNode } from 'react';

// Bọc bảng trong container cuộn ngang cho màn hình nhỏ — tránh vỡ layout trên mobile.
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-[var(--bg-accent-soft)] text-xs font-semibold uppercase tracking-wide text-brand-700">
      {children}
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-semibold ${className ?? ''}`}>{children}</th>;
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)]">{children}</tbody>;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={`transition hover:bg-[var(--bg-accent-soft)] ${className ?? ''}`}>{children}</tr>;
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-[var(--text-primary)] ${className ?? ''}`}>{children}</td>;
}
