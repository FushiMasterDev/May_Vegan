import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { getOrderByCode } from '@/services/orderApi';
import { OrderDetailCard } from '@/components/common/OrderDetailCard';
import { PageLoading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

export default function OrderSuccessPage() {
  const { code } = useParams<{ code: string }>();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', 'code', code],
    queryFn: () => getOrderByCode(code as string),
    enabled: Boolean(code),
  });

  if (isLoading) return <PageLoading />;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Đặt hàng thành công!</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Cảm ơn bạn đã đặt món tại Mây Vegan. Vui lòng lưu lại mã đơn hàng để theo dõi.
        </p>
      </div>

      <OrderDetailCard order={order} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/menu" className="flex-1">
          <Button variant="outline" fullWidth>
            Tiếp tục đặt món
          </Button>
        </Link>
        <Link to={`/track-order/${order.orderCode}`} className="flex-1">
          <Button fullWidth>Theo dõi đơn hàng</Button>
        </Link>
      </div>
    </div>
  );
}
