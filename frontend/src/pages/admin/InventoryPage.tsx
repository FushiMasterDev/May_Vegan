import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Package, AlertTriangle, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getInventoryDashboard, listInventoryTransactions, createInventoryTransaction, type CreateInventoryTransactionPayload } from '@/services/inventoryApi';
import { listIngredients } from '@/services/ingredientApi';
import { useToast } from '@/contexts/ToastContext';
import { StatCard } from '@/components/common/StatCard';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton, PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import type { InventoryTransactionType } from '@/types';

const TYPE_OPTIONS: Array<{ value: InventoryTransactionType; label: string }> = [
  { value: 'IMPORT', label: 'Nhập kho' },
  { value: 'EXPORT', label: 'Xuất kho' },
  { value: 'ADJUST', label: 'Điều chỉnh' },
  { value: 'STOCKTAKE', label: 'Kiểm kê' },
];

const TYPE_BADGE: Record<InventoryTransactionType, 'green' | 'red' | 'blue' | 'purple'> = {
  IMPORT: 'green',
  EXPORT: 'red',
  ADJUST: 'blue',
  STOCKTAKE: 'purple',
};

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<InventoryTransactionType | ''>('');
  const [formOpen, setFormOpen] = useState(false);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['inventory-dashboard'],
    queryFn: getInventoryDashboard,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ['inventory-transactions', type, page],
    queryFn: () => listInventoryTransactions({ type: type || undefined, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  if (dashboardLoading || !dashboard) return <PageLoading />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Kho</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Theo dõi nhập / xuất / điều chỉnh tồn kho.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} /> Giao dịch mới
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<Package size={20} />} label="Tổng nguyên liệu" value={dashboard.totalIngredients} />
        <StatCard icon={<AlertTriangle size={20} />} label="Sắp hết hàng" value={dashboard.lowStockCount} accent="wood" />
        <StatCard icon={<Wallet size={20} />} label="Giá trị tồn kho" value={formatCurrency(dashboard.stockValue)} accent="accent" />
        <StatCard icon={<ArrowDownCircle size={20} />} label="Nhập trong tháng" value={dashboard.importedThisMonth} />
        <StatCard icon={<ArrowUpCircle size={20} />} label="Xuất trong tháng" value={dashboard.exportedThisMonth} />
      </div>

      {dashboard.lowStockItems.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
            <AlertTriangle size={15} /> Nguyên liệu sắp hết hàng
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dashboard.lowStockItems.map((i) => (
              <span key={i.id} className="rounded-full bg-white px-3 py-1 text-xs text-amber-800">
                {i.name} — còn {i.quantityInStock} {i.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Select
          placeholder="Tất cả loại giao dịch"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => { setType(e.target.value as InventoryTransactionType | ''); setPage(1); }}
          className="w-52"
        />
      </div>

      {txLoading ? (
        <Table>
          <Thead><tr><Th>Nguyên liệu</Th><Th>Loại</Th><Th>Số lượng</Th><Th>Ghi chú</Th><Th>Người tạo</Th><Th>Thời gian</Th></tr></Thead>
          <Tbody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</Tbody>
        </Table>
      ) : !transactions || transactions.data.length === 0 ? (
        <EmptyState title="Chưa có giao dịch" description="Lịch sử nhập/xuất kho sẽ hiển thị tại đây." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Nguyên liệu</Th><Th>Loại</Th><Th>Số lượng</Th><Th>Ghi chú</Th><Th>Người tạo</Th><Th>Thời gian</Th></tr></Thead>
            <Tbody>
              {transactions.data.map((tx) => (
                <Tr key={tx.id}>
                  <Td className="font-medium text-brand-900">{tx.ingredient?.name}</Td>
                  <Td><Badge color={TYPE_BADGE[tx.type]}>{TYPE_OPTIONS.find((t) => t.value === tx.type)?.label}</Badge></Td>
                  <Td className={Number(tx.quantity) < 0 ? 'text-red-600' : 'text-brand-700'}>
                    {Number(tx.quantity) > 0 ? '+' : ''}{tx.quantity} {tx.ingredient?.unit}
                  </Td>
                  <Td className="text-xs text-[var(--text-muted)]">{tx.note ?? '—'}</Td>
                  <Td className="text-xs text-[var(--text-muted)]">{tx.createdByUser?.fullName ?? '—'}</Td>
                  <Td className="text-xs text-[var(--text-muted)]">{formatDateTime(tx.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination meta={transactions.meta} onPageChange={setPage} />
        </>
      )}

      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        }}
      />
    </div>
  );
}

function TransactionFormModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { data: ingredients } = useQuery({
    queryKey: ['ingredients-all'],
    queryFn: () => listIngredients({ limit: 200 }),
    enabled: open,
  });

  const [ingredientId, setIngredientId] = useState('');
  const [txType, setTxType] = useState<InventoryTransactionType>('IMPORT');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [note, setNote] = useState('');

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CreateInventoryTransactionPayload = {
        ingredientId: Number(ingredientId),
        type: txType,
        quantity: Number(quantity),
        unitCost: unitCost ? Number(unitCost) : undefined,
        note: note || undefined,
      };
      return createInventoryTransaction(payload);
    },
    onSuccess: () => {
      toast.success('Đã ghi nhận giao dịch kho');
      setIngredientId('');
      setQuantity('');
      setUnitCost('');
      setNote('');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const isAdjustLike = txType === 'ADJUST' || txType === 'STOCKTAKE';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Giao dịch kho mới"
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending} disabled={!ingredientId || !quantity}>
          Lưu giao dịch
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="Nguyên liệu"
          placeholder="Chọn nguyên liệu"
          options={(ingredients?.data ?? []).map((i) => ({ value: String(i.id), label: `${i.name} (${i.quantityInStock} ${i.unit})` }))}
          value={ingredientId}
          onChange={(e) => setIngredientId(e.target.value)}
        />
        <Select label="Loại giao dịch" options={TYPE_OPTIONS} value={txType} onChange={(e) => setTxType(e.target.value as InventoryTransactionType)} />
        <Input
          label="Số lượng"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          hint={isAdjustLike ? 'Nhập số âm nếu giảm, số dương nếu tăng' : 'Nhập số lượng dương'}
        />
        {txType === 'IMPORT' && <Input label="Đơn giá nhập" type="number" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />}
        <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}
