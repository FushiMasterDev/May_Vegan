import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Xác nhận',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  danger,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} size="sm">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div
          className={
            danger
              ? 'flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600'
              : 'flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600'
          }
        >
          <AlertTriangle size={24} />
        </div>
        <h3 className="font-display text-lg text-brand-900">{title}</h3>
        <p className="text-sm text-[var(--text-muted)]">{message}</p>
        <div className="mt-2 flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
