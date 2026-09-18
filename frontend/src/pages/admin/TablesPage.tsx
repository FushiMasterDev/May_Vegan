import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import clsx from 'clsx';
import { listTables, createTable, updateTable, updateTableStatus, deleteTable, type TablePayload } from '@/services/tableApi';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminCreateOrderModal } from '@/components/common/AdminCreateOrderModal';
import { TABLE_STATUS_META } from '@/utils/statusMeta';
import { getApiErrorMessage } from '@/utils/apiError';
import type { RestaurantTable, TableStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: TableStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Trống' },
  { value: 'OCCUPIED', label: 'Đang sử dụng' },
  { value: 'RESERVED', label: 'Đã đặt' },
  { value: 'CLEANING', label: 'Đang dọn' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
];

const STATUS_CARD_CLASSES: Record<TableStatus, string> = {
  AVAILABLE: 'border-brand-300 bg-brand-50',
  OCCUPIED: 'border-red-300 bg-red-50',
  RESERVED: 'border-amber-300 bg-amber-50',
  CLEANING: 'border-sky-300 bg-sky-50',
  MAINTENANCE: 'border-gray-300 bg-gray-100',
};

export default function TablesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();
  const canManage = user && ['ADMIN', 'MANAGER'].includes(user.role);

  const [selected, setSelected] = useState<RestaurantTable | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [orderModalTable, setOrderModalTable] = useState<RestaurantTable | null>(null);

  const { data: tables, isLoading } = useQuery({ queryKey: ['admin-tables'], queryFn: () => listTables() });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableStatus }) => updateTableStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
      toast.success('Đã cập nhật trạng thái bàn');
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
      toast.success('Đã xoá bàn');
      setSelected(null);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(table: RestaurantTable) {
    const ok = await confirm({
      title: 'Xoá bàn',
      message: `Bạn có chắc chắn muốn xoá bàn ${table.code}?`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(table.id);
  }

  if (isLoading) return <PageLoading />;

  const grouped = new Map<string, RestaurantTable[]>();
  for (const t of tables ?? []) {
    grouped.set(t.area, [...(grouped.get(t.area) ?? []), t]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Sơ đồ bàn</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý trạng thái và tạo đơn tại bàn.</p>
        </div>
        {canManage && (
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={16} /> Thêm bàn
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        {STATUS_OPTIONS.map((s) => (
          <span key={s.value} className="flex items-center gap-1.5">
            <span className={clsx('h-2.5 w-2.5 rounded-full', STATUS_CARD_CLASSES[s.value].split(' ')[1])} />
            {s.label}
          </span>
        ))}
      </div>

      {!tables || tables.length === 0 ? (
        <EmptyState title="Chưa có bàn nào" description="Thêm bàn để bắt đầu quản lý sơ đồ nhà hàng." />
      ) : (
        Array.from(grouped.entries()).map(([area, list]) => (
          <div key={area}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-700">{area}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {list.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelected(table)}
                  className={clsx(
                    'flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-sm',
                    STATUS_CARD_CLASSES[table.status]
                  )}
                >
                  <span className="font-display text-lg text-[var(--text-primary)]">{table.code}</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Users size={12} /> {table.seats}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--text-muted)]">{TABLE_STATUS_META[table.status].label}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Detail / actions modal */}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Bàn ${selected.code}` : undefined} size="sm">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
              <span>Khu vực: {selected.area}</span>
              <span>{selected.seats} chỗ ngồi</span>
            </div>

            <Select
              label="Trạng thái"
              options={STATUS_OPTIONS}
              value={selected.status}
              onChange={(e) => {
                const status = e.target.value as TableStatus;
                statusMutation.mutate({ id: selected.id, status });
                setSelected({ ...selected, status });
              }}
            />

            {selected.status === 'AVAILABLE' && (
              <Button onClick={() => setOrderModalTable(selected)}>
                <UtensilsCrossed size={16} /> Tạo đơn tại bàn
              </Button>
            )}

            {canManage && (
              <div className="flex gap-2 border-t border-[var(--border-subtle)] pt-4">
                <Button variant="outline" fullWidth onClick={() => { setEditing(selected); setFormOpen(true); }}>
                  <Pencil size={14} /> Sửa
                </Button>
                <Button variant="danger" fullWidth onClick={() => handleDelete(selected)}>
                  <Trash2 size={14} /> Xoá
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <TableFormModal
        open={formOpen}
        table={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          setSelected(null);
          queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
        }}
      />

      {orderModalTable && (
        <AdminCreateOrderModal
          open={Boolean(orderModalTable)}
          onClose={() => setOrderModalTable(null)}
          tableId={orderModalTable.id}
          tableLabel={orderModalTable.code}
          onCreated={() => {
            setOrderModalTable(null);
            setSelected(null);
            queryClient.invalidateQueries({ queryKey: ['admin-tables'] });
          }}
        />
      )}

      {dialog}
    </div>
  );
}

function TableFormModal({
  open,
  table,
  onClose,
  onSaved,
}: {
  open: boolean;
  table: RestaurantTable | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<TablePayload>(
    table
      ? { code: table.code, seats: table.seats, area: table.area, status: table.status }
      : { code: '', seats: 4, area: '', status: 'AVAILABLE' }
  );

  // Đồng bộ form khi modal được mở cho một bàn khác (hoặc chuyển sang "thêm mới").
  const lastTableId = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    const currentId = table?.id ?? null;
    if (open && lastTableId.current !== currentId) {
      lastTableId.current = currentId;
      setForm(
        table
          ? { code: table.code, seats: table.seats, area: table.area, status: table.status }
          : { code: '', seats: 4, area: '', status: 'AVAILABLE' }
      );
    }
  }, [open, table]);

  const mutation = useMutation({
    mutationFn: () => (table ? updateTable(table.id, form) : createTable(form)),
    onSuccess: () => {
      toast.success(table ? 'Đã cập nhật bàn' : 'Đã thêm bàn mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={table ? `Sửa bàn ${table.code}` : 'Thêm bàn mới'}
      size="sm"
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Mã bàn" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: B13" />
        <Input
          label="Số ghế"
          type="number"
          min={1}
          value={form.seats}
          onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
        />
        <Input label="Khu vực" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="VD: Tầng 1" />
        <Select
          label="Trạng thái"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as TableStatus })}
        />
      </div>
    </Modal>
  );
}
