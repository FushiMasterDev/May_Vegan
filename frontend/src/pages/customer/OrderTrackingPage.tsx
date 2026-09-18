import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getOrderByCode } from '@/services/orderApi';
import { OrderDetailCard } from '@/components/common/OrderDetailCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

export default function OrderTrackingPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState(code ?? '');

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', 'code', code],
    queryFn: () => getOrderByCode(code as string),
    enabled: Boolean(code),
    retry: false,
  });

  function handleSearch() {
    if (input.trim()) navigate(`/track-order/${input.trim().toUpperCase()}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="mb-2 font-display text-3xl text-[var(--text-primary)]">Tra cứu đơn hàng</h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">Nhập mã đơn hàng để xem trạng thái xử lý.</p>

      <div className="flex gap-2">
        <Input
          placeholder="VD: MV20260917001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search size={16} /> Tra cứu
        </Button>
      </div>

      <div className="mt-8">
        {isLoading && <PageLoading />}
        {isError && (
          <EmptyState title="Không tìm thấy đơn hàng" description="Vui lòng kiểm tra lại mã đơn hàng." />
        )}
        {order && <OrderDetailCard order={order} />}
      </div>
    </div>
  );
}
