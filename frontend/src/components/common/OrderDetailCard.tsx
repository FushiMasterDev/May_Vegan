import { MapPin, Phone, User, CreditCard } from 'lucide-react';
import { OrderStatusTimeline } from './OrderStatusTimeline';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from '@/utils/statusMeta';
import type { Order } from '@/types';

const ORDER_TYPE_LABEL: Record<Order['orderType'], string> = {
  DINE_IN: 'Tại quán',
  DELIVERY: 'Giao hàng',
  PICKUP: 'Nhận tại quán',
};

export function OrderDetailCard({ order }: { order: Order }) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Mã đơn hàng</p>
          <p className="font-display text-xl text-[var(--text-primary)]">{order.orderCode}</p>
        </div>
        <div className="flex gap-2">
          <Badge color={ORDER_STATUS_META[order.status].color}>{ORDER_STATUS_META[order.status].label}</Badge>
          <Badge color={PAYMENT_STATUS_META[order.paymentStatus].color}>
            {PAYMENT_STATUS_META[order.paymentStatus].label}
          </Badge>
        </div>
      </div>

      <div className="border-b border-[var(--border-subtle)] py-5">
        <OrderStatusTimeline order={order} />
      </div>

      <div className="grid gap-4 border-b border-[var(--border-subtle)] py-5 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <User size={16} className="mt-0.5 text-brand-500" />
          <span>{order.customer?.user.fullName ?? order.guestName}</span>
        </div>
        <div className="flex items-start gap-2">
          <Phone size={16} className="mt-0.5 text-brand-500" />
          <span>{order.customer?.user.phone ?? order.guestPhone}</span>
        </div>
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 sm:col-span-2">
            <MapPin size={16} className="mt-0.5 text-brand-500" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <CreditCard size={16} className="mt-0.5 text-brand-500" />
          <span>
            {ORDER_TYPE_LABEL[order.orderType]} · {order.paymentMethod === 'CASH' ? 'Tiền mặt' : order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Online'}
          </span>
        </div>
        <div className="text-[var(--text-muted)]">Đặt lúc {formatDateTime(order.createdAt)}</div>
      </div>

      <ul className="flex flex-col gap-2 py-5 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span>
              {item.quantity} × {item.productNameSnapshot}
              {item.note && <span className="text-xs text-[var(--text-muted)]"> ({item.note})</span>}
            </span>
            <span className="shrink-0 text-[var(--text-muted)]">{formatCurrency(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--text-muted)]">Tạm tính</dt>
          <dd>{formatCurrency(order.subtotal)}</dd>
        </div>
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Giảm giá</dt>
            <dd>-{formatCurrency(order.discountAmount)}</dd>
          </div>
        )}
        {Number(order.deliveryFee) > 0 && (
          <div className="flex justify-between">
            <dt className="text-[var(--text-muted)]">Phí giao hàng</dt>
            <dd>{formatCurrency(order.deliveryFee)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2.5 text-base font-semibold text-[var(--text-primary)]">
          <dt>Tổng cộng</dt>
          <dd>{formatCurrency(order.totalAmount)}</dd>
        </div>
      </dl>
    </div>
  );
}
