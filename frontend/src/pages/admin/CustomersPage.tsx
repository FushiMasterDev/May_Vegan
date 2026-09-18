import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Lock, Unlock, Eye } from 'lucide-react';
import { listCustomers, getCustomer, setCustomerStatus } from '@/services/customerApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { ORDER_STATUS_META, RESERVATION_STATUS_META } from '@/utils/statusMeta';

export default function CustomersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', debouncedSearch, page],
    queryFn: () => listCustomers({ search: debouncedSearch || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const { data: detail } = useQuery({
    queryKey: ['admin-customer', selectedId],
    queryFn: () => getCustomer(selectedId as number),
    enabled: selectedId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACTIVE' | 'LOCKED' }) => setCustomerStatus(id, status),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái tài khoản');
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-customer'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleToggleLock(id: number, currentStatus: string) {
    const locking = currentStatus === 'ACTIVE';
    const ok = await confirm({
      title: locking ? 'Khoá tài khoản' : 'Mở khoá tài khoản',
      message: locking
        ? 'Khách hàng sẽ không thể đăng nhập cho đến khi được mở khoá lại. Tiếp tục?'
        : 'Khách hàng sẽ có thể đăng nhập trở lại. Tiếp tục?',
      confirmLabel: locking ? 'Khoá' : 'Mở khoá',
      danger: locking,
    });
    if (ok) statusMutation.mutate({ id, status: locking ? 'LOCKED' : 'ACTIVE' });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-[var(--text-primary)]">Khách hàng</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Danh sách khách hàng và lịch sử mua hàng.</p>
      </div>

      <Input leftIcon={<Search size={16} />} placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-72" />

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Khách hàng</Th><Th>Liên hệ</Th><Th>Đơn hàng</Th><Th>Đã chi tiêu</Th><Th>Điểm</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Không có khách hàng" description="Chưa có khách hàng nào khớp với tìm kiếm." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Khách hàng</Th><Th>Liên hệ</Th><Th>Đơn hàng</Th><Th>Đã chi tiêu</Th><Th>Điểm</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
            <Tbody>
              {data.data.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-[var(--text-primary)]">{c.user.fullName}</Td>
                  <Td className="text-xs text-[var(--text-muted)]">{c.user.email}<br />{c.user.phone}</Td>
                  <Td>{c.totalOrders}</Td>
                  <Td>{formatCurrency(c.totalSpent)}</Td>
                  <Td>{c.loyaltyPoints}</Td>
                  <Td><Badge color={c.user.status === 'ACTIVE' ? 'green' : 'red'}>{c.user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khoá'}</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedId(c.id)} className="text-brand-600 hover:text-brand-800" aria-label="Xem chi tiết">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleToggleLock(c.id, c.user.status)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Khoá/Mở khoá">
                        {c.user.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <Modal open={selectedId !== null} onClose={() => setSelectedId(null)} title={detail?.user.fullName} size="lg">
        {detail && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[var(--bg-accent-soft)] p-3 text-center">
                <p className="font-display text-xl text-brand-800">{detail.totalOrders}</p>
                <p className="text-xs text-[var(--text-muted)]">Đơn hàng</p>
              </div>
              <div className="rounded-xl bg-[var(--bg-accent-soft)] p-3 text-center">
                <p className="font-display text-xl text-brand-800">{formatCurrency(detail.totalSpent)}</p>
                <p className="text-xs text-[var(--text-muted)]">Đã chi tiêu</p>
              </div>
              <div className="rounded-xl bg-[var(--bg-accent-soft)] p-3 text-center">
                <p className="font-display text-xl text-brand-800">{detail.loyaltyPoints}</p>
                <p className="text-xs text-[var(--text-muted)]">Điểm tích luỹ</p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Lịch sử đơn hàng</h3>
              {!detail.orders || detail.orders.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Chưa có đơn hàng nào.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {detail.orders.map((o) => (
                    <li key={o.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 text-sm">
                      <span>{o.orderCode} · {formatDateTime(o.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(o.totalAmount)}</span>
                        <Badge color={ORDER_STATUS_META[o.status].color}>{ORDER_STATUS_META[o.status].label}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">Lịch sử đặt bàn</h3>
              {!detail.reservations || detail.reservations.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Chưa có lượt đặt bàn nào.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {detail.reservations.map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3 text-sm">
                      <span>{r.reservationCode} · {formatDate(r.reservationDate)}</span>
                      <Badge color={RESERVATION_STATUS_META[r.status].color}>{RESERVATION_STATUS_META[r.status].label}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {dialog}
    </div>
  );
}
