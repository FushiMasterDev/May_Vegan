import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function useConfirmDialog() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  function handleConfirm() {
    state?.resolve(true);
    setState(null);
  }

  const dialog = (
    <ConfirmDialog
      open={Boolean(state)}
      title={state?.title}
      message={state?.message ?? ''}
      confirmLabel={state?.confirmLabel}
      danger={state?.danger}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}
