import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EyeOff, Eye, Trash2 } from 'lucide-react';
import { listAllReviews, hideReview, unhideReview, deleteReview } from '@/services/reviewApi';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { StarRating } from '@/components/ui/StarRating';
import { Pagination } from '@/components/ui/Pagination';
import { formatDateTime } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';

export default function ReviewsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [status, setStatus] = useState<'VISIBLE' | 'HIDDEN' | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status, page],
    queryFn: () => listAllReviews({ status: status || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
  }

  const hideMutation = useMutation({
    mutationFn: hideReview,
    onSuccess: () => { toast.success('Đã ẩn đánh giá'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const unhideMutation = useMutation({
    mutationFn: unhideReview,
    onSuccess: () => { toast.success('Đã hiện lại đánh giá'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => { toast.success('Đã xoá đánh giá'); invalidate(); },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Xoá đánh giá',
      message: 'Bạn có chắc chắn muốn xoá đánh giá này? Hành động này không thể hoàn tác.',
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-brand-900">Đánh giá</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Kiểm duyệt đánh giá từ khách hàng.</p>
      </div>

      <Select
        placeholder="Tất cả trạng thái"
        options={[{ value: 'VISIBLE', label: 'Đang hiển thị' }, { value: 'HIDDEN', label: 'Đã ẩn' }]}
        value={status}
        onChange={(e) => { setStatus(e.target.value as 'VISIBLE' | 'HIDDEN' | ''); setPage(1); }}
        className="w-52"
      />

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Món ăn</Th><Th>Khách hàng</Th><Th>Đánh giá</Th><Th>Nội dung</Th><Th>Thời gian</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Chưa có đánh giá" description="Đánh giá từ khách hàng sẽ hiển thị tại đây." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Món ăn</Th><Th>Khách hàng</Th><Th>Đánh giá</Th><Th>Nội dung</Th><Th>Thời gian</Th><Th></Th></tr></Thead>
            <Tbody>
              {data.data.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-medium text-brand-900">{r.product?.name}</Td>
                  <Td>{r.customer?.user.fullName}</Td>
                  <Td><StarRating value={r.rating} size={13} /></Td>
                  <Td className="max-w-xs text-xs text-[var(--text-muted)]">{r.comment}</Td>
                  <Td className="text-xs text-[var(--text-muted)]">{formatDateTime(r.createdAt)}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      {r.status === 'VISIBLE' ? (
                        <button onClick={() => hideMutation.mutate(r.id)} className="text-[var(--text-muted)] hover:text-amber-600" aria-label="Ẩn">
                          <EyeOff size={16} />
                        </button>
                      ) : (
                        <button onClick={() => unhideMutation.mutate(r.id)} className="text-[var(--text-muted)] hover:text-brand-600" aria-label="Hiện">
                          <Eye size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Xoá">
                        <Trash2 size={16} />
                      </button>
                      <Badge color={r.status === 'VISIBLE' ? 'green' : 'gray'}>{r.status === 'VISIBLE' ? 'Hiển thị' : 'Đã ẩn'}</Badge>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      {dialog}
    </div>
  );
}
