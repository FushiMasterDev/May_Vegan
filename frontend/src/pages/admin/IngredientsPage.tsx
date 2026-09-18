import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { useDebounce } from '@/hooks/useDebounce';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatCurrency, formatDate, toNumber } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type IngredientPayload,
} from '@/services/ingredientApi';
import type { Ingredient } from '@/types';

export default function IngredientsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();
  const { data: suppliers } = useSuppliers();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', debouncedSearch, lowStockOnly, page],
    queryFn: () => listIngredients({ search: debouncedSearch || undefined, lowStockOnly, page, limit: 15 }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      toast.success('Đã xoá nguyên liệu');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(ingredient: Ingredient) {
    const ok = await confirm({
      title: 'Xoá nguyên liệu',
      message: `Bạn có chắc chắn muốn xoá "${ingredient.name}"?`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(ingredient.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Nguyên liệu</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Theo dõi nguyên liệu và mức tồn kho tối thiểu.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Thêm nguyên liệu
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input leftIcon={<Search size={16} />} placeholder="Tìm nguyên liệu..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64" />
        <button
          onClick={() => { setLowStockOnly((v) => !v); setPage(1); }}
          className={clsx(
            'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition',
            lowStockOnly ? 'border-red-400 bg-red-50 text-red-700' : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
          )}
        >
          <AlertTriangle size={13} /> Sắp hết hàng
        </button>
      </div>

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Mã</Th><Th>Tên</Th><Th>Tồn kho</Th><Th>Giá nhập</Th><Th>Nhà cung cấp</Th><Th>HSD</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={7} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Không có nguyên liệu" description="Chưa có nguyên liệu nào khớp với bộ lọc." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Mã</Th><Th>Tên</Th><Th>Tồn kho</Th><Th>Giá nhập</Th><Th>Nhà cung cấp</Th><Th>HSD</Th><Th></Th></tr></Thead>
            <Tbody>
              {data.data.map((ing) => {
                const low = toNumber(ing.quantityInStock) < toNumber(ing.minStockLevel);
                return (
                  <Tr key={ing.id}>
                    <Td className="text-xs text-[var(--text-muted)]">{ing.code}</Td>
                    <Td className="font-medium text-brand-900">{ing.name}</Td>
                    <Td>
                      <span className={low ? 'font-semibold text-red-600' : ''}>
                        {ing.quantityInStock} {ing.unit}
                      </span>
                      {low && <span className="ml-1.5 text-xs text-red-500">(tối thiểu {ing.minStockLevel})</span>}
                    </Td>
                    <Td>{formatCurrency(ing.costPrice)}</Td>
                    <Td>{ing.supplier?.name ?? '—'}</Td>
                    <Td className="text-xs text-[var(--text-muted)]">{ing.expiryDate ? formatDate(ing.expiryDate) : '—'}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditing(ing); setFormOpen(true); }} className="text-brand-600 hover:text-brand-800" aria-label="Sửa">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(ing)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Xoá">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          <Pagination meta={data.meta} onPageChange={setPage} />
        </>
      )}

      <IngredientFormModal
        open={formOpen}
        ingredient={editing}
        suppliers={suppliers ?? []}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        }}
      />

      {dialog}
    </div>
  );
}

interface FormState {
  name: string;
  unit: string;
  minStockLevel: string;
  costPrice: string;
  supplierId: string;
  expiryDate: string;
  initialQuantity: string;
}

function emptyForm(): FormState {
  return { name: '', unit: '', minStockLevel: '', costPrice: '', supplierId: '', expiryDate: '', initialQuantity: '' };
}

function IngredientFormModal({
  open,
  ingredient,
  suppliers,
  onClose,
  onSaved,
}: {
  open: boolean;
  ingredient: Ingredient | null;
  suppliers: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(emptyForm());
  const lastId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = ingredient?.id ?? null;
    if (open && lastId.current !== currentId) {
      lastId.current = currentId;
      setForm(
        ingredient
          ? {
              name: ingredient.name,
              unit: ingredient.unit,
              minStockLevel: ingredient.minStockLevel,
              costPrice: ingredient.costPrice,
              supplierId: ingredient.supplierId ? String(ingredient.supplierId) : '',
              expiryDate: ingredient.expiryDate?.slice(0, 10) ?? '',
              initialQuantity: '',
            }
          : emptyForm()
      );
    }
  }, [open, ingredient]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: IngredientPayload = {
        name: form.name,
        unit: form.unit,
        minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : undefined,
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        supplierId: form.supplierId ? Number(form.supplierId) : undefined,
        expiryDate: form.expiryDate || undefined,
        initialQuantity: form.initialQuantity ? Number(form.initialQuantity) : undefined,
      };
      return ingredient ? updateIngredient(ingredient.id, payload) : createIngredient(payload);
    },
    onSuccess: () => {
      toast.success(ingredient ? 'Đã cập nhật nguyên liệu' : 'Đã thêm nguyên liệu mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={ingredient ? `Sửa "${ingredient.name}"` : 'Thêm nguyên liệu mới'}
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tên nguyên liệu" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Đơn vị tính" placeholder="kg, lít, gói..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Mức tồn tối thiểu" type="number" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} />
          <Input label="Giá nhập" type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Nhà cung cấp"
            placeholder="Không chọn"
            options={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
          />
          <Input label="Hạn sử dụng" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        </div>
        {!ingredient && (
          <Input
            label="Số lượng nhập ban đầu"
            type="number"
            value={form.initialQuantity}
            onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
            hint="Sẽ tự động tạo giao dịch nhập kho tương ứng"
          />
        )}
      </div>
    </Modal>
  );
}
