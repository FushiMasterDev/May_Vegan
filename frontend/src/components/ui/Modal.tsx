import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      style={{ animation: 'fade-in 0.15s ease-out' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-[var(--bg-surface)] shadow-xl sm:rounded-2xl',
          SIZE_CLASSES[size]
        )}
        style={{ animation: 'modal-in 0.18s ease-out' }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <h2 className="font-display text-lg text-brand-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-brand-50 hover:text-brand-800"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-[var(--border-subtle)] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
