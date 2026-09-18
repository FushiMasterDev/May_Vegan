import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/utils/apiError';
import { createCategory, updateCategory, deleteCategory, type CategoryPayload } from '@/services/categoryApi';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Đã xoá danh mục');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(category: Category) {
    const ok = await confirm({
      title: 'Xoá danh mục',
      message: `Bạn có chắc chắn muốn xoá danh mục "${category.name}"?`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(category.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-[var(--text-primary)]">Danh mục</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý danh mục thực đơn.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Thêm danh mục
        </Button>
      </div>

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Tên danh mục</Th><Th>Số món</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={4} />)}</Tbody>
        </Table>
      ) : !categories || categories.length === 0 ? (
        <EmptyState title="Chưa có danh mục" description="Thêm danh mục đầu tiên cho thực đơn." />
      ) : (
        <Table>
          <Thead><tr><Th>Tên danh mục</Th><Th>Số món</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>
            {categories.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-[var(--text-primary)]">{c.name}</Td>
                <Td>{c._count?.products ?? 0}</Td>
                <Td><Badge color={c.isActive ? 'green' : 'gray'}>{c.isActive ? 'Đang hiển thị' : 'Đã ẩn'}</Badge></Td>
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

      <CategoryFormModal
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }}
      />

      {dialog}
    </div>
  );
}

function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<CategoryPayload>({ name: '', description: '', displayOrder: 0, isActive: true });
  const lastId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = category?.id ?? null;
    if (open && lastId.current !== currentId) {
      lastId.current = currentId;
      setForm(
        category
          ? { name: category.name, description: category.description ?? '', displayOrder: category.displayOrder, isActive: category.isActive }
          : { name: '', description: '', displayOrder: 0, isActive: true }
      );
    }
  }, [open, category]);

  const mutation = useMutation({
    mutationFn: () => (category ? updateCategory(category.id, form) : createCategory(form)),
    onSuccess: () => {
      toast.success(category ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? `Sửa "${category.name}"` : 'Thêm danh mục mới'}
      size="sm"
      footer={
        <Button fullWidth onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Tên danh mục" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Textarea label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        <Input label="Thứ tự hiển thị" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
          Hiển thị trên thực đơn
        </label>
      </div>
    </Modal>
  );
}
