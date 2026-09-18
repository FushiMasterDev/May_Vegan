import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, toNumber } from '@/utils/format';
import { getPrimaryImage } from '@/utils/product';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const isNew = Date.now() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30;
  const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.status === 'HIDDEN';
  const finalPrice = toNumber(product.salePrice ?? product.price);

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unitPrice: finalPrice,
      image: getPrimaryImage(product),
    });
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/menu/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <ProductImage
          src={getPrimaryImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {product.isBestSeller && <Badge color="orange">Bán chạy</Badge>}
          {product.salePrice && <Badge color="red">Khuyến mãi</Badge>}
          {isNew && <Badge color="blue">Mới</Badge>}
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-900">Hết hàng</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/menu/${product.slug}`}>
          <h3 className="font-display text-base text-[var(--text-primary)] line-clamp-1">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{product.description}</p>
        )}

        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Star size={14} className="fill-accent-500 text-accent-500" />
          <span>{toNumber(product.ratingAvg).toFixed(1)}</span>
          <span>({product.ratingCount})</span>
          <span className="mx-1">·</span>
          <span>Đã bán {product.soldCount}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-brand-800">{formatCurrency(finalPrice)}</span>
            {product.salePrice && (
              <span className="text-xs text-[var(--text-muted)] line-through">{formatCurrency(product.price)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Thêm vào giỏ"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
