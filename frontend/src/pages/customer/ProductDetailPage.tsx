import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { ProductImage } from '@/components/common/ProductImage';
import { StarRating } from '@/components/ui/StarRating';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency, formatDateTime, toNumber } from '@/utils/format';
import { getPrimaryImage } from '@/utils/product';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { addItem } = useCart();
  const toast = useToast();

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (isLoading) return <PageLoading />;
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="Không tìm thấy món ăn" description="Món ăn có thể đã bị gỡ khỏi thực đơn." />
      </div>
    );
  }

  const image = activeImage ?? getPrimaryImage(product);
  const finalPrice = toNumber(product.salePrice ?? product.price);
  const isOutOfStock = product.status !== 'AVAILABLE';

  function handleAddToCart() {
    if (!product) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        unitPrice: finalPrice,
        image: getPrimaryImage(product),
        note: note || undefined,
      },
      quantity
    );
    toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
    setQuantity(1);
    setNote('');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--text-muted)]">
        <Link to="/menu" className="hover:text-brand-700">Thực đơn</Link>
        <span className="mx-2">/</span>
        <span className="text-brand-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl">
            <ProductImage src={image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className="h-16 w-16 overflow-hidden rounded-xl border border-[var(--border-subtle)]"
                >
                  <ProductImage src={img.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-1.5">
            {product.isBestSeller && <Badge color="orange">Bán chạy</Badge>}
            {product.isFeatured && <Badge color="purple">Nổi bật</Badge>}
            {product.salePrice && <Badge color="red">Khuyến mãi</Badge>}
            {isOutOfStock && <Badge color="gray">Hết hàng</Badge>}
          </div>

          <h1 className="mt-3 font-display text-3xl text-brand-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <StarRating value={toNumber(product.ratingAvg)} />
            <span>{toNumber(product.ratingAvg).toFixed(1)}</span>
            <span>({product.ratingCount} đánh giá)</span>
            <span className="mx-1">·</span>
            <span>Đã bán {product.soldCount}</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl text-brand-800">{formatCurrency(finalPrice)}</span>
            {product.salePrice && (
              <span className="text-base text-[var(--text-muted)] line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-primary)]">{product.description}</p>
          )}

          <dl className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border-subtle)] bg-cream-50 p-4 text-sm sm:grid-cols-2">
            {product.ingredientsText && (
              <div className="sm:col-span-2">
                <dt className="font-medium text-brand-800">Thành phần</dt>
                <dd className="text-[var(--text-muted)]">{product.ingredientsText}</dd>
              </div>
            )}
            {product.calories !== null && (
              <div className="flex items-center gap-1.5">
                <Flame size={15} className="text-accent-600" />
                <span>{product.calories} kcal</span>
              </div>
            )}
            {product.allergyInfo && (
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-amber-600" />
                <span>{product.allergyInfo}</span>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <Textarea
              label="Ghi chú cho món này"
              placeholder="Ví dụ: ít cay, không hành..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button size="lg" onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1">
              <ShoppingBag size={18} />
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-[var(--border-subtle)] pt-10">
        <h2 className="font-display text-2xl text-brand-900">Đánh giá từ khách hàng</h2>
        {!product.reviews || product.reviews.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--text-muted)]">Chưa có đánh giá nào cho món này.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-900">{r.customer?.user.fullName}</span>
                  <span className="text-xs text-[var(--text-muted)]">{formatDateTime(r.createdAt)}</span>
                </div>
                <StarRating value={r.rating} size={14} />
                {r.comment && <p className="mt-2 text-sm text-[var(--text-primary)]">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
