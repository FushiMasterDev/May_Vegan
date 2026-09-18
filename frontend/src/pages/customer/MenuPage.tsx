import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { ProductCard } from '@/components/common/ProductCard';
import { CardSkeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ListProductParams } from '@/services/productApi';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export default function MenuPage() {
  const [params, setParams] = useSearchParams();
  const { data: categories } = useCategories();

  const [search, setSearch] = useState(params.get('search') ?? '');
  const debouncedSearch = useDebounce(search);
  const [showFilters, setShowFilters] = useState(false);

  const categoryId = params.get('categoryId') ? Number(params.get('categoryId')) : undefined;
  const sort = (params.get('sort') as ListProductParams['sort']) ?? 'newest';
  const page = params.get('page') ? Number(params.get('page')) : 1;
  const minPrice = params.get('minPrice') ? Number(params.get('minPrice')) : undefined;
  const maxPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined;
  const isBestSeller = params.get('isBestSeller') === 'true' || undefined;
  const isFeatured = params.get('isFeatured') === 'true' || undefined;
  const onSale = params.get('onSale') === 'true' || undefined;
  const isNew = params.get('isNew') === 'true' || undefined;

  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set('search', debouncedSearch);
        else next.delete('search');
        next.delete('page');
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function update(patch: Record<string, string | undefined>) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      }
      if (!('page' in patch)) next.delete('page');
      return next;
    });
  }

  function toggleFlag(key: 'isBestSeller' | 'isFeatured' | 'onSale' | 'isNew') {
    update({ [key]: params.get(key) === 'true' ? undefined : 'true' });
  }

  function clearFilters() {
    setSearch('');
    setParams(new URLSearchParams());
  }

  const { data, isLoading, isFetching } = useProducts({
    search: debouncedSearch || undefined,
    categoryId,
    sort,
    page,
    minPrice,
    maxPrice,
    isBestSeller,
    isFeatured,
    onSale,
    isNew,
    limit: 12,
  });

  const activeFilterCount = [categoryId, minPrice, maxPrice, isBestSeller, isFeatured, onSale, isNew].filter(
    Boolean
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-[var(--text-primary)]">Thực đơn</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Chọn món chay yêu thích của bạn — tất cả đều tươi mỗi ngày.</p>
      </div>

      {/* Search + sort */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            leftIcon={<Search size={16} />}
            placeholder="Tìm món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="sm:w-48"
          />
          <Button
            variant="outline"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0 sm:hidden"
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeFilterCount}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => update({ categoryId: undefined })}
          className={clsx(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition',
            !categoryId
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-300'
          )}
        >
          Tất cả
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            onClick={() => update({ categoryId: String(c.id) })}
            className={clsx(
              'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition',
              categoryId === c.id
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-brand-300'
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className={clsx('mb-6 flex flex-wrap items-center gap-2', !showFilters && 'hidden sm:flex')}>
        {[
          { key: 'isNew' as const, label: 'Món mới' },
          { key: 'isBestSeller' as const, label: 'Bán chạy' },
          { key: 'isFeatured' as const, label: 'Nổi bật' },
          { key: 'onSale' as const, label: 'Khuyến mãi' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => toggleFlag(f.key)}
            className={clsx(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
              params.get(f.key) === 'true'
                ? 'border-accent-500 bg-accent-500 text-white'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-accent-300'
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Từ"
            defaultValue={minPrice}
            onBlur={(e) => update({ minPrice: e.target.value || undefined })}
            className="h-8 w-20 rounded-full border border-[var(--border-subtle)] px-2.5 text-xs"
          />
          <span className="text-xs text-[var(--text-muted)]">–</span>
          <input
            type="number"
            placeholder="Đến"
            defaultValue={maxPrice}
            onBlur={(e) => update({ maxPrice: e.target.value || undefined })}
            className="h-8 w-20 rounded-full border border-[var(--border-subtle)] px-2.5 text-xs"
          />
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
          >
            <X size={12} /> Xoá lọc
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div
            className={clsx(
              'grid grid-cols-2 gap-4 transition-opacity sm:gap-6 md:grid-cols-3 lg:grid-cols-4',
              isFetching && 'opacity-60'
            )}
          >
            {data.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination meta={data.meta} onPageChange={(p) => update({ page: String(p) })} />
          </div>
        </>
      ) : (
        <EmptyState title="Không tìm thấy món ăn" description="Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm khác." />
      )}
    </div>
  );
}
