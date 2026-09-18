import type { BadgeColor } from '@/components/ui/Badge';
import type {
  OrderStatus,
  ReservationStatus,
  TableStatus,
  CouponStatus,
  ProductStatus,
  OrderPaymentStatus,
} from '@/types';

interface StatusMeta {
  label: string;
  color: BadgeColor;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: 'Chờ xác nhận', color: 'yellow' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'orange' },
  READY: { label: 'Sẵn sàng', color: 'purple' },
  DELIVERING: { label: 'Đang giao', color: 'blue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
};

export const RESERVATION_STATUS_META: Record<ReservationStatus, StatusMeta> = {
  PENDING: { label: 'Chờ xác nhận', color: 'yellow' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  SEATED: { label: 'Đang phục vụ', color: 'purple' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã huỷ', color: 'red' },
};

export const TABLE_STATUS_META: Record<TableStatus, StatusMeta> = {
  AVAILABLE: { label: 'Trống', color: 'green' },
  OCCUPIED: { label: 'Đang sử dụng', color: 'red' },
  RESERVED: { label: 'Đã đặt', color: 'yellow' },
  CLEANING: { label: 'Đang dọn', color: 'blue' },
  MAINTENANCE: { label: 'Bảo trì', color: 'gray' },
};

export const COUPON_STATUS_META: Record<CouponStatus, StatusMeta> = {
  ACTIVE: { label: 'Đang áp dụng', color: 'green' },
  INACTIVE: { label: 'Tạm ngưng', color: 'gray' },
  EXPIRED: { label: 'Hết hạn', color: 'red' },
};

export const PRODUCT_STATUS_META: Record<ProductStatus, StatusMeta> = {
  AVAILABLE: { label: 'Còn hàng', color: 'green' },
  OUT_OF_STOCK: { label: 'Hết hàng', color: 'red' },
  HIDDEN: { label: 'Đã ẩn', color: 'gray' },
};

export const PAYMENT_STATUS_META: Record<OrderPaymentStatus, StatusMeta> = {
  UNPAID: { label: 'Chưa thanh toán', color: 'yellow' },
  PAID: { label: 'Đã thanh toán', color: 'green' },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'gray' },
};
