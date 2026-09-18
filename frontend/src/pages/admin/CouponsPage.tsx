import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon, type CouponPayload } from '@/services/couponApi';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { COUPON_STATUS_META } from '@/utils/statusMeta';
import type { Coupon, CouponDiscountType, CouponStatus } from '@/types';

export default function CouponsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: () => listCoupons({ limit: 50 }) });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success('Đã xoá mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(coupon: Coupon) {
    const ok = await confirm({
      title: 'Xoá mã giảm giá',
      message: `Bạn có chắc chắn muốn xoá mã "${coupon.code}"?`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(coupon.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý mã giảm giá cho khách hàng.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Thêm mã giảm giá
        </Button>
      </div>

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Mã</Th><Th>Giảm giá</Th><Th>Điều kiện</Th><Th>Hiệu lực</Th><Th>Đã dùng</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Chưa có mã giảm giá" description="Tạo mã giảm giá đầu tiên cho khách hàng." />
      ) : (
        <Table>
          <Thead><tr><Th>Mã</Th><Th>Giảm giá</Th><Th>Điều kiện</Th><Th>Hiệu lực</Th><Th>Đã dùng</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>
            {data.data.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-[var(--text-primary)]">{c.code}<br /><span className="text-xs font-normal text-[var(--text-muted)]">{c.name}</span></Td>
                <Td>{c.discountType === 'PERCENT' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</Td>
                <Td className="text-xs text-[var(--text-muted)]">
                  Đơn tối thiểu {formatCurrency(c.minOrderAmount)}
                  {c.maxDiscountAmount && <><br />Giảm tối đa {formatCurrency(c.maxDiscountAmount)}</>}
                </Td>
                <Td className="text-xs text-[var(--text-muted)]">{formatDate(c.startDate)} - {formatDate(c.endDate)}</Td>
                <Td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</Td>
                <Td><Badge color={COUPON_STATUS_META[c.status].color}>{COUPON_STATUS_META[c.status].label}</Badge></Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditing(c); setFormOpen(true); }} className="text-brand-600 hover:text-brand-800" aria-label="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(c)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Xoá">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <CouponFormModal
        open={formOpen}
        coupon={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
        }}
      />

      {dialog}
    </div>
  );
}

interface FormState {
  code: string;
  name: string;
  discountType: CouponDiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  status: CouponStatus;
}

function emptyForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return { code: '', name: '', discountType: 'PERCENT', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', startDate: today, endDate: today, usageLimit: '', status: 'ACTIVE' };
}

function CouponFormModal({
  open,
  coupon,
  onClose,
  onSaved,
}: {
  open: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const lastId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = coupon?.id ?? null;
    if (open && lastId.current !== currentId) {
      lastId.current = currentId;
      setForm(
        coupon
          ? {
              code: coupon.code,
              name: coupon.name,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              minOrderAmount: coupon.minOrderAmount,
              maxDiscountAmount: coupon.maxDiscountAmount ?? '',
              startDate: coupon.startDate.slice(0, 10),
              endDate: coupon.endDate.slice(0, 10),
              usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
              status: coupon.status,
            }
          : emptyForm()
      );
    }
  }, [open, coupon]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CouponPayload = {
        code: form.code,
        name: form.name,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        status: form.status,
      };
      return coupon ? updateCoupon(coupon.id, payload) : createCoupon(payload);
    },
    onSuccess: () => {
      toast.success(coupon ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={coupon ? `Sửa "${coupon.code}"` : 'Thêm mã giảm giá mới'}
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Mã code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={Boolean(coupon)} />
          <Input label="Tên chương trình" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Loại giảm giá"
            options={[{ value: 'PERCENT', label: 'Phần trăm (%)' }, { value: 'AMOUNT', label: 'Số tiền cố định' }]}
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as CouponDiscountType })}
          />
          <Input label="Giá trị giảm" type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Đơn tối thiểu" type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          <Input label="Giảm tối đa" type="number" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} hint="Chỉ áp dụng cho giảm theo %" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="Ngày kết thúc" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Số lần sử dụng tối đa" type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} hint="Để trống nếu không giới hạn" />
          <Select
            label="Trạng thái"
            options={[{ value: 'ACTIVE', label: 'Đang áp dụng' }, { value: 'INACTIVE', label: 'Tạm ngưng' }]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as CouponStatus })}
          />
        </div>
      </div>
    </Modal>
  );
}
