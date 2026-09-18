import { useRef, useState, type ReactNode } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: ReactNode;
}

export function Dropdown({ trigger, items }: { trigger: ReactNode; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button onClick={() => setOpen((o) => !o)} className="inline-flex">
        {trigger}
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 shadow-lg"
          style={{ animation: 'fade-in 0.12s ease-out' }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm hover:bg-[var(--bg-accent-soft)] ${
                item.danger ? 'text-red-600' : 'text-[var(--text-primary)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
