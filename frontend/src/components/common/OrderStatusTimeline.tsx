import { Check, X } from 'lucide-react';
import clsx from 'clsx';
import type { Order } from '@/types';

const BASE_STEPS: Array<{ key: Order['status']; label: string }> = [
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'PREPARING', label: 'Đang chuẩn bị' },
  { key: 'READY', label: 'Sẵn sàng' },
  { key: 'DELIVERING', label: 'Đang giao' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
];

export function OrderStatusTimeline({ order }: { order: Order }) {
  const steps = BASE_STEPS.filter((s) => s.key !== 'DELIVERING' || order.orderType === 'DELIVERY');

  if (order.status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
          <X size={18} />
        </div>
        <div>
          <p className="font-medium">Đơn hàng đã bị huỷ</p>
          <p className="text-xs text-red-500">Liên hệ Mây Vegan nếu bạn cần hỗ trợ thêm.</p>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {steps.map((step, idx) => {
        const done = idx <= currentIndex;
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="flex flex-1 sm:flex-col">
            <div className="flex flex-col items-center sm:flex-row sm:w-full">
              <div
                className={clsx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  done ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 text-gray-400'
                )}
              >
                {done ? <Check size={14} /> : idx + 1}
              </div>
              {!isLast && (
                <div
                  className={clsx(
                    'mx-2 my-1 w-0.5 flex-1 sm:my-0 sm:mx-0 sm:h-0.5 sm:w-full',
                    idx < currentIndex ? 'bg-brand-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            <p
              className={clsx(
                'mt-1 pb-4 text-xs font-medium sm:pb-0 sm:pt-2',
                done ? 'text-brand-800' : 'text-gray-400'
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
