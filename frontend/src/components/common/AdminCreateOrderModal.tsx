import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Search } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatCurrency, toNumber } from '@/utils/format';
import { createOrder } from '@/services/orderApi';
import type { Order } from '@/types';

interface SelectedItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

export function AdminCreateOrderModal({
  open,
  onClose,
  tableId,
  tableLabel,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tableId: number;
  tableLabel: string;
  onCreated: (order: Order) => void;
}) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [guestName, setGuestName] = useState('');

  const { data } = useProducts({ search: debouncedSearch || undefined, limit: 8, status: 'AVAILABLE' });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      toast.success(`Đã tạo đơn ${order.orderCode}`);
      onCreated(order);
      reset();
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Tạo đơn thất bại')),
  });

  function reset() {
    setItems([]);
    setGuestName('');
    setSearch('');
  }

  function addItem(product: { id: number; name: string; price: string; salePrice: string | null }) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { productId: product.id, name: product.name, unitPrice: toNumber(product.salePrice ?? product.price), quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  function handleSubmit() {
    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất một món');
      return;
    }
    mutation.mutate({
      orderType: 'DINE_IN',
      tableId,
      guestName: guestName.trim() || `Khách bàn ${tableLabel}`,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod: 'CASH',
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title={`Tạo đơn tại bàn ${tableLabel}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between">
          <span className="font-display text-lg text-[var(--text-primary)]">{formatCurrency(subtotal)}</span>
          <Button onClick={handleSubmit} isLoading={mutation.isPending} disabled={items.length === 0}>
            Tạo đơn
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Tên khách (không bắt buộc)" placeholder={`Khách bàn ${tableLabel}`} value={guestName} onChange={(e) => setGuestName(e.target.value)} />

        <div>
          <label className="text-sm font-medium text-[var(--text-primary)]">Thêm món</label>
          <Input leftIcon={<Search size={16} />} placeholder="Tìm món ăn..." value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1.5" />
          {debouncedSearch && data && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
              {data.data.length === 0 ? (
                <p className="p-3 text-sm text-[var(--text-muted)]">Không tìm thấy món ăn</p>
              ) : (
                data.data.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addItem(p)}
                    className="flex w-full items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3.5 py-2.5 text-left text-sm last:border-0 hover:bg-[var(--bg-accent-soft)]"
                  >
                    <span>{p.name}</span>
                    <span className="flex items-center gap-2 text-[var(--text-muted)]">
                      {formatCurrency(p.salePrice ?? p.price)} <Plus size={14} className="text-brand-600" />
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Món đã chọn</p>
          {items.length === 0 ? (
            <EmptyState title="Chưa có món nào" description="Tìm và thêm món phía trên." />
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-subtle)] p-3">
                  <span className="flex-1 text-sm">{item.name}</span>
                  <QuantityStepper value={item.quantity} onChange={(q) => updateQuantity(item.productId, q)} />
                  <span className="w-20 text-right text-sm text-[var(--text-muted)]">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  <button onClick={() => updateQuantity(item.productId, 0)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Xoá món">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
