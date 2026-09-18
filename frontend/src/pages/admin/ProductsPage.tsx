import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Star, Flame, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/contexts/ToastContext';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { TableRowSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProductImage } from '@/components/common/ProductImage';
import { formatCurrency } from '@/utils/format';
import { getApiErrorMessage } from '@/utils/apiError';
import { getPrimaryImage } from '@/utils/product';
import { PRODUCT_STATUS_META } from '@/utils/statusMeta';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  removeProductImage,
  type ProductPayload,
} from '@/services/productApi';
import type { Product, ProductStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: ProductStatus; label: string }> = [
  { value: 'AVAILABLE', label: 'Còn hàng' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { value: 'HIDDEN', label: 'Đã ẩn' },
];

export default function ProductsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirmDialog();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    status: (status as ProductStatus) || undefined,
    page,
    limit: 12,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Đã xoá món ăn');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function handleDelete(product: Product) {
    const ok = await confirm({
      title: 'Xoá món ăn',
      message: `Bạn có chắc chắn muốn xoá "${product.name}"?`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (ok) deleteMutation.mutate(product.id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-900">Thực đơn</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Quản lý món ăn, hình ảnh và trạng thái.</p>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Thêm món
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input leftIcon={<Search size={16} />} placeholder="Tìm món ăn..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-64" />
        <Select
          placeholder="Tất cả danh mục"
          options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="w-48"
        />
        <Select
          placeholder="Tất cả trạng thái"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {isLoading ? (
        <Table>
          <Thead><tr><Th>Món ăn</Th><Th>Danh mục</Th><Th>Giá</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
          <Tbody>{Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)}</Tbody>
        </Table>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Chưa có món ăn" description="Thêm món ăn đầu tiên cho thực đơn." />
      ) : (
        <>
          <Table>
            <Thead><tr><Th>Món ăn</Th><Th>Danh mục</Th><Th>Giá</Th><Th>Trạng thái</Th><Th></Th></tr></Thead>
            <Tbody>
              {data.data.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                        <ProductImage src={getPrimaryImage(product)} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-900">{product.name}</p>
                        <div className="flex gap-1">
                          {product.isFeatured && <Star size={12} className="text-accent-500" />}
                          {product.isBestSeller && <Flame size={12} className="text-orange-500" />}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>{product.category?.name}</Td>
                  <Td>
                    {formatCurrency(product.salePrice ?? product.price)}
                    {product.salePrice && <span className="ml-1.5 text-xs text-[var(--text-muted)] line-through">{formatCurrency(product.price)}</span>}
                  </Td>
                  <Td><Badge color={PRODUCT_STATUS_META[product.status].color}>{PRODUCT_STATUS_META[product.status].label}</Badge></Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setEditing(product); setFormOpen(true); }} className="text-brand-600 hover:text-brand-800" aria-label="Sửa">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(product)} className="text-[var(--text-muted)] hover:text-red-600" aria-label="Xoá">
                        <Trash2 size={16} />
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

      <ProductFormModal
        open={formOpen}
        product={editing}
        categories={categories ?? []}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }}
      />

      {dialog}
    </div>
  );
}

interface FormState {
  categoryId: string;
  name: string;
  description: string;
  ingredientsText: string;
  calories: string;
  allergyInfo: string;
  price: string;
  salePrice: string;
  status: ProductStatus;
  isFeatured: boolean;
  isBestSeller: boolean;
}

function emptyForm(): FormState {
  return {
    categoryId: '',
    name: '',
    description: '',
    ingredientsText: '',
    calories: '',
    allergyInfo: '',
    price: '',
    salePrice: '',
    status: 'AVAILABLE',
    isFeatured: false,
    isBestSeller: false,
  };
}

function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  categories: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const lastId = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const currentId = product?.id ?? null;
    if (open && lastId.current !== currentId) {
      lastId.current = currentId;
      setForm(
        product
          ? {
              categoryId: String(product.categoryId),
              name: product.name,
              description: product.description ?? '',
              ingredientsText: product.ingredientsText ?? '',
              calories: product.calories?.toString() ?? '',
              allergyInfo: product.allergyInfo ?? '',
              price: product.price,
              salePrice: product.salePrice ?? '',
              status: product.status,
              isFeatured: product.isFeatured,
              isBestSeller: product.isBestSeller,
            }
          : emptyForm()
      );
    }
  }, [open, product]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: ProductPayload = {
        categoryId: Number(form.categoryId),
        name: form.name,
        description: form.description || undefined,
        ingredientsText: form.ingredientsText || undefined,
        calories: form.calories ? Number(form.calories) : undefined,
        allergyInfo: form.allergyInfo || undefined,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        status: form.status,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
      };
      return product ? updateProduct(product.id, payload) : createProduct(payload);
    },
    onSuccess: () => {
      toast.success(product ? 'Đã cập nhật món ăn' : 'Đã thêm món ăn mới');
      onSaved();
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadProductImage(product!.id, file, (product?.images.length ?? 0) === 0),
    onSuccess: () => {
      toast.success('Đã tải ảnh lên');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Tải ảnh thất bại')),
  });

  const removeImageMutation = useMutation({
    mutationFn: (imageId: number) => removeProductImage(product!.id, imageId),
    onSuccess: () => {
      toast.success('Đã xoá ảnh');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? `Sửa "${product.name}"` : 'Thêm món ăn mới'}
      size="lg"
      footer={
        <Button fullWidth onClick={() => saveMutation.mutate()} isLoading={saveMutation.isPending}>
          Lưu món ăn
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tên món" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select
            label="Danh mục"
            placeholder="Chọn danh mục"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          />
        </div>

        <Textarea label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        <Input label="Thành phần" value={form.ingredientsText} onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Giá" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <Input label="Giá khuyến mãi" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} hint="Để trống nếu không giảm giá" />
          <Input label="Calories" type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
        </div>

        <Input label="Thông tin dị ứng" value={form.allergyInfo} onChange={(e) => setForm({ ...form, allergyInfo: e.target.value })} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Trạng thái" options={STATUS_OPTIONS} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProductStatus })} />
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
            Món nổi bật
          </label>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
            Món bán chạy
          </label>
        </div>

        {product && (
          <div className="border-t border-[var(--border-subtle)] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium text-brand-900">
                <ImageIcon size={15} /> Hình ảnh
              </p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} isLoading={uploadMutation.isPending}>
                <Upload size={14} /> Tải ảnh lên
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
            </div>
            <div className="flex flex-wrap gap-2">
              {product.images.map((img) => (
                <div key={img.id} className="group relative h-16 w-16 overflow-hidden rounded-lg">
                  <ProductImage src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImageMutation.mutate(img.id)}
                    className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Xoá ảnh"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {product.images.length === 0 && <p className="text-xs text-[var(--text-muted)]">Chưa có ảnh nào</p>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
