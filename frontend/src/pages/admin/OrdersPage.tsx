import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Printer, Ban } from 'lucide-react';
import { listOrders, updateOrderStatus, cancelOrder } from '@/services/orderApi';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { OrderDetailCard } from '@/components/common/OrderDetailCard';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { ORDER_STATUS_META } from '@/utils/statusMeta';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PREPARING', label: 'Đang chuẩn bị' },
  { value: 'READY', label: 'Sẵn sàng' },
  { value: 'DELIVERING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['DELIVERING', 'COMPLETED'],
  DELIVERING: ['COMPLETED'],
};

export default function OrdersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', debouncedSearch, status, dateFrom, dateTo, page],
    queryFn: () =>
      listOrders({
        search: debouncedSearch || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit: 15,
      }),
    placeholderData: (prev) => prev,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status: s }: { id: number; status: OrderStatus }) => updateOrderStatus(id, s),
    onSuccess: (order) => {
      toast.success('Đã cập nhật trạng thái đơn hàng');
      setSelectedOrder(order);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: (order) => {
      toast.success('Đã huỷ đơn hàng');
      setSelectedOrder(order);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleCancel(order: Order) {
    const ok = await confirm({
      title: 'Huỷ đơn hàng',
      message: `Bạn có chắc chắn muốn huỷ đơn hàng ${order.orderCode}?`,
      confirmLabel: 'Huỷ đơn',
      danger: true,
    });
    if (ok) cancelMutation.mutate(order.id);
  }

  function handlePrint() {
    window.print();
  }

  const canManage = user && ['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN'].includes(user.role);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-brand-900">Đơn hàng</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý và xử lý đơn hàng của Mây Vegan.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          leftIcon={<Search size={16} />}
          placeholder="Mã đơn, tên, SĐT..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <Select
          placeholder="Tất cả trạng thái"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '');
            setPage(1);
          }}
          className="w-48"
        />
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
        <span className="pb-2.5 text-sm text-[var(--text-muted)]">đến</span>
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
      </div>

      {isLoading ? (
        <Table>
          <Thead>
            <tr>
              <Th>Mã đơn</Th><Th>Khách hàng</Th><Th>Loại</Th><Th>Tổng tiền</Th><Th>Trạng thái</Th><Th>Thời gian</Th><Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}
          </Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Không có đơn hàng" description="Chưa có đơn hàng nào khớp với bộ lọc hiện tại." />
      ) : (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Mã đơn</Th><Th>Khách hàng</Th><Th>Loại</Th><Th>Tổng tiền</Th><Th>Trạng thái</Th><Th>Thời gian</Th><Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {data.data.map((order) => (
                <Tr key={order.id}>
                  <Td className="font-medium text-brand-900">{order.orderCode}</Td>
                  <Td>{order.customer?.user.fullName ?? order.guestName}</Td>
                  <Td>{order.orderType === 'DINE_IN' ? 'Tại quán' : order.orderType === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại quán'}</Td>
                  <Td>{formatCurrency(order.totalAmount)}</Td>
                  <Td><Badge color={ORDER_STATUS_META[order.status].color}>{ORDER_STATUS_META[order.status].label}</Badge></Td>
                  <Td className="text-xs text-[var(--text-muted)]">{formatDateTime(order.createdAt)}</Td>
                  <Td>
                    <button onClick={() => setSelectedOrder(order)} className="text-brand-600 hover:text-brand-800" aria-label="Xem chi tiết">
                      <Eye size={18} />
                    </button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title="Chi tiết đơn hàng" size="lg">
        {selectedOrder && (
          <div>
            <div id="print-receipt">
              <OrderDetailCard order={selectedOrder} />
            </div>

            {canManage && selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
              <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
                {(NEXT_STATUS[selectedOrder.status] ?? [])
                  .filter((next) => user?.role !== 'KITCHEN' || (['PREPARING', 'READY'] as OrderStatus[]).includes(next))
                  .map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    variant={next === 'CANCELLED' ? 'danger' : 'primary'}
                    isLoading={statusMutation.isPending}
                    onClick={() =>
                      next === 'CANCELLED'
                        ? handleCancel(selectedOrder)
                        : statusMutation.mutate({ id: selectedOrder.id, status: next })
                    }
                  >
                    {next === 'CANCELLED' ? <Ban size={14} /> : null}
                    Chuyển sang "{ORDER_STATUS_META[next].label}"
                  </Button>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer size={14} /> In hoá đơn
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {dialog}
    </div>
  );
}
