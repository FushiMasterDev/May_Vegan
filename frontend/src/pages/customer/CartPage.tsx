import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Trash2, Ticket, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { ProductImage } from '@/components/common/ProductImage';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { validateCoupon } from '@/services/couponApi';

export default function CartPage() {
  const { items, updateQuantity, updateNote, removeItem, subtotal, couponCode, setCouponCode } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const couponMutation = useMutation({
    mutationFn: (code: string) => validateCoupon(code, subtotal),
    onSuccess: (result) => {
      setCouponCode(result.coupon.code);
      toast.success(`Áp dụng mã "${result.coupon.code}" thành công`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Mã giảm giá không hợp lệ')),
  });

  const appliedCouponQuery = useQuery({
    queryKey: ['couponValidate', couponCode, subtotal],
    queryFn: () => validateCoupon(couponCode as string, subtotal),
    enabled: Boolean(couponCode) && subtotal > 0,
    retry: false,
  });

  const discountAmount = appliedCouponQuery.data?.discountAmount ?? 0;

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    couponMutation.mutate(couponInput.trim().toUpperCase());
  }

  function handleRemoveCoupon() {
    setCouponCode(null);
    setCouponInput('');
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<ShoppingBag size={26} />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá thực đơn và thêm món yêu thích vào giỏ hàng."
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
      <h1 className="mb-8 font-display text-4xl text-brand-900">Giỏ hàng</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/menu/${item.slug}`} className="font-medium text-brand-900 hover:underline">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-[var(--text-muted)] hover:text-red-600"
                    aria-label="Xoá món"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  defaultValue={item.note ?? ''}
                  onBlur={(e) => updateNote(item.productId, e.target.value)}
                  placeholder="Ghi chú cho món này..."
                  className="w-full rounded-lg border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
                <div className="mt-auto flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.productId, q)}
                  />
                  <span className="font-display text-base text-brand-800">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h2 className="font-display text-lg text-brand-900">Tạm tính</h2>

          <div className="mt-4 flex gap-2">
            {couponCode ? (
              <div className="flex w-full items-center justify-between rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-brand-700">
                  <Ticket size={14} /> {couponCode}
                </span>
                <button onClick={handleRemoveCoupon} aria-label="Bỏ mã giảm giá">
                  <X size={14} className="text-[var(--text-muted)]" />
                </button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Mã giảm giá"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleApplyCoupon} isLoading={couponMutation.isPending}>
                  Áp dụng
                </Button>
              </>
            )}
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Tạm tính</dt>
              <dd className="font-medium">{formatCurrency(subtotal)}</dd>
            </div>
            {couponCode && (
              <div className="flex justify-between text-brand-700">
                <dt>Giảm giá</dt>
                <dd>-{formatCurrency(discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2.5 text-base font-semibold text-brand-900">
              <dt>Tổng cộng</dt>
              <dd>{formatCurrency(subtotal - discountAmount)}</dd>
            </div>
            <p className="text-xs text-[var(--text-muted)]">* Phí giao hàng (nếu có) sẽ được tính ở bước thanh toán.</p>
          </dl>

          <Button fullWidth size="lg" className="mt-5" onClick={() => navigate('/checkout')}>
            Tiến hành thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
