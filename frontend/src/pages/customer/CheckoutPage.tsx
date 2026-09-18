import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Store, Truck, Banknote, Landmark } from 'lucide-react';
import clsx from 'clsx';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { isValidPhone } from '@/utils/validation';
import { DELIVERY_FEE } from '@/utils/constants';
import { createOrder } from '@/services/orderApi';
import { validateCoupon } from '@/services/couponApi';
import type { OrderType, PaymentMethod } from '@/types';

interface FormState {
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  deliveryAddress: string;
  note: string;
  requestedTime: string;
  paymentMethod: PaymentMethod;
}

export default function CheckoutPage() {
  const { items, subtotal, couponCode, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>('PICKUP');
  const [form, setForm] = useState<FormState>({
    guestName: user?.fullName ?? '',
    guestPhone: user?.phone ?? '',
    guestEmail: user?.email ?? '',
    deliveryAddress: user?.customer?.address ?? '',
    note: '',
    requestedTime: '',
    paymentMethod: 'CASH',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const couponQuery = useQuery({
    queryKey: ['couponValidate', couponCode, subtotal],
    queryFn: () => validateCoupon(couponCode as string, subtotal),
    enabled: Boolean(couponCode) && subtotal > 0,
    retry: false,
  });
  const discountAmount = couponQuery.data?.discountAmount ?? 0;
  const deliveryFee = orderType === 'DELIVERY' ? DELIVERY_FEE : 0;
  const total = Math.max(0, subtotal - discountAmount) + deliveryFee;

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      clear();
      toast.success('Đặt hàng thành công!');
      navigate(`/order-success/${order.orderCode}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Đặt hàng thất bại. Vui lòng thử lại.')),
  });

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.guestName.trim()) next.guestName = 'Vui lòng nhập họ tên';
    if (!isValidPhone(form.guestPhone)) next.guestPhone = 'Số điện thoại không hợp lệ';
    if (orderType === 'DELIVERY' && !form.deliveryAddress.trim()) {
      next.deliveryAddress = 'Vui lòng nhập địa chỉ giao hàng';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    orderMutation.mutate({
      orderType,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, note: i.note })),
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestEmail: form.guestEmail || undefined,
      deliveryAddress: orderType === 'DELIVERY' ? form.deliveryAddress : undefined,
      note: form.note || undefined,
      requestedTime: form.requestedTime ? new Date(form.requestedTime).toISOString() : undefined,
      couponCode: couponCode ?? undefined,
      paymentMethod: form.paymentMethod,
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Giỏ hàng trống"
          description="Vui lòng thêm món trước khi thanh toán."
          action={
            <Link to="/menu">
              <Button className="mt-2">Xem thực đơn</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-4xl text-[var(--text-primary)]">Thanh toán</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Order type */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Hình thức nhận hàng</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('PICKUP')}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition',
                  orderType === 'PICKUP' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                )}
              >
                <Store size={22} /> Nhận tại quán
              </button>
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={clsx(
                  'flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition',
                  orderType === 'DELIVERY' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                )}
              >
                <Truck size={22} /> Giao hàng
              </button>
            </div>
          </div>

          {/* Customer info */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Thông tin nhận hàng</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Họ tên"
                value={form.guestName}
                onChange={(e) => updateField('guestName', e.target.value)}
                error={errors.guestName}
              />
              <Input
                label="Số điện thoại"
                value={form.guestPhone}
                onChange={(e) => updateField('guestPhone', e.target.value)}
                error={errors.guestPhone}
              />
              <Input
                label="Email (không bắt buộc)"
                type="email"
                value={form.guestEmail}
                onChange={(e) => updateField('guestEmail', e.target.value)}
                className="sm:col-span-2"
              />
              {orderType === 'DELIVERY' && (
                <Input
                  label="Địa chỉ giao hàng"
                  value={form.deliveryAddress}
                  onChange={(e) => updateField('deliveryAddress', e.target.value)}
                  error={errors.deliveryAddress}
                  className="sm:col-span-2"
                />
              )}
              <Input
                label="Thời gian mong muốn (không bắt buộc)"
                type="datetime-local"
                value={form.requestedTime}
                onChange={(e) => updateField('requestedTime', e.target.value)}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Ghi chú đơn hàng"
                placeholder="Ghi chú thêm cho quán..."
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Phương thức thanh toán</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateField('paymentMethod', 'CASH')}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-medium transition',
                  form.paymentMethod === 'CASH' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                )}
              >
                <Banknote size={18} /> Tiền mặt
              </button>
              <button
                onClick={() => updateField('paymentMethod', 'BANK_TRANSFER')}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-medium transition',
                  form.paymentMethod === 'BANK_TRANSFER' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                )}
              >
                <Landmark size={18} /> Chuyển khoản
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h2 className="font-display text-lg text-[var(--text-primary)]">Đơn hàng của bạn</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-2">
                <span className="text-[var(--text-primary)]">
                  {item.quantity} × {item.name}
                </span>
                <span className="shrink-0 text-[var(--text-muted)]">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Tạm tính</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            {couponCode && (
              <div className="flex justify-between text-brand-700">
                <dt>Giảm giá ({couponCode})</dt>
                <dd>-{formatCurrency(discountAmount)}</dd>
              </div>
            )}
            {orderType === 'DELIVERY' && (
              <div className="flex justify-between">
                <dt className="text-[var(--text-muted)]">Phí giao hàng</dt>
                <dd>{formatCurrency(deliveryFee)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2.5 text-base font-semibold text-[var(--text-primary)]">
              <dt>Tổng cộng</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Button fullWidth size="lg" className="mt-5" onClick={handleSubmit} isLoading={orderMutation.isPending}>
            Đặt hàng
          </Button>
        </div>
      </div>
    </div>
  );
}
