import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastCardProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-brand-500 text-brand-700',
  error: 'border-red-500 text-red-700',
  info: 'border-wood-500 text-wood-600',
};

export function ToastCard({ type, message, onClose }: ToastCardProps) {
  const Icon = ICONS[type];
  return (
    <div
      role="status"
      className={`flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 bg-[var(--bg-surface)] p-4 shadow-lg ring-1 ring-black/5 animate-[toast-in_0.2s_ease-out] ${STYLES[type]}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm text-[var(--text-primary)]">{message}</p>
      <button
        onClick={onClose}
        aria-label="Đóng thông báo"
        className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <X size={16} />
      </button>
    </div>
  );
}
