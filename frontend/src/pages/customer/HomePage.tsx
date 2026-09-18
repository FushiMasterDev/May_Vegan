import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Leaf, Truck, Sparkles, CalendarCheck, ArrowRight, Quote } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { listRecentReviews } from '@/services/reviewApi';
import { ProductCard } from '@/components/common/ProductCard';
import { CardSkeleton } from '@/components/ui/Loading';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';

const USPS = [
  { icon: Leaf, title: '100% thuần chay', desc: 'Nguyên liệu thực vật tươi sạch, không phẩm màu, không chất bảo quản.' },
  { icon: Sparkles, title: 'Chế biến mỗi ngày', desc: 'Món ăn được chuẩn bị trong ngày, đảm bảo trọn vẹn hương vị.' },
  { icon: Truck, title: 'Giao hàng tận nơi', desc: 'Giao nhanh trong nội thành, đóng gói giữ nhiệt cẩn thận.' },
  { icon: CalendarCheck, title: 'Đặt bàn dễ dàng', desc: 'Giữ chỗ trực tuyến chỉ trong vài giây, xác nhận nhanh chóng.' },
];

function SectionHeading({ eyebrow, title, viewAllHref }: { eyebrow: string; title: string; viewAllHref?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent-600">{eyebrow}</p>
        <h2 className="mt-1 font-display text-3xl text-brand-900">{title}</h2>
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="hidden items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900 sm:flex"
        >
          Xem tất cả <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

function ProductGridSection({
  eyebrow,
  title,
  params,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  params: Parameters<typeof useProducts>[0];
  viewAllHref: string;
}) {
  const { data, isLoading } = useProducts(params);
  const items = data?.data ?? [];
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow={eyebrow} title={title} viewAllHref={viewAllHref} />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: categories } = useCategories();
  const comboCategory = categories?.find((c) => c.slug === 'combo');

  const { data: testimonials } = useQuery({
    queryKey: ['reviews', 'recent'],
    queryFn: () => listRecentReviews(6),
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 to-[var(--bg-app)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <Leaf size={14} /> Quán ăn chay thuần Việt
            </p>
            <h1 className="font-display text-5xl leading-[1.1] text-brand-900 sm:text-6xl">Mây Vegan</h1>
            <p className="mt-4 text-lg text-[var(--text-muted)]">Một chút xanh cho một ngày an lành.</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
              Thực đơn chay phong phú từ cơm, mì, lẩu đến tráng miệng — nấu mỗi ngày từ nguyên liệu tươi, phục vụ tận
              bàn hoặc giao tận nơi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => (window.location.href = '/menu')}>
                Xem thực đơn
              </Button>
              <Link to="/menu">
                <Button size="lg" variant="outline">
                  Đặt món
                </Button>
              </Link>
              <Link to="/reservation">
                <Button size="lg" variant="secondary">
                  Đặt bàn
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-brand-200 via-accent-100 to-cream-200 p-8 shadow-lg">
              <div className="grid h-full grid-cols-2 gap-4">
                <div className="flex flex-col justify-end rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <Leaf className="mb-2 text-brand-600" size={22} />
                  <p className="text-sm font-semibold text-brand-900">100% thực vật</p>
                </div>
                <div className="flex flex-col justify-end rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <Sparkles className="mb-2 text-accent-600" size={22} />
                  <p className="text-sm font-semibold text-brand-900">Tươi mỗi ngày</p>
                </div>
                <div className="col-span-2 flex flex-col justify-end rounded-2xl bg-white/70 p-4 backdrop-blur">
                  <p className="font-display text-2xl text-brand-800">26+ món chay</p>
                  <p className="text-sm text-[var(--text-muted)]">từ khai vị đến tráng miệng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {USPS.map((u) => (
            <div key={u.title} className="flex flex-col items-start gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <u.icon size={20} />
              </div>
              <p className="text-sm font-semibold text-brand-900">{u.title}</p>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductGridSection eyebrow="Đừng bỏ lỡ" title="Món nổi bật" params={{ isFeatured: true, limit: 4 }} viewAllHref="/menu?isFeatured=true" />
      <ProductGridSection eyebrow="Được yêu thích nhất" title="Món bán chạy" params={{ isBestSeller: true, limit: 4 }} viewAllHref="/menu?isBestSeller=true" />
      {comboCategory && (
        <ProductGridSection
          eyebrow="Trọn vị, tiết kiệm"
          title="Combo Mây"
          params={{ categoryId: comboCategory.id, limit: 4 }}
          viewAllHref={`/menu?categoryId=${comboCategory.id}`}
        />
      )}

      {/* Promo banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-brand-800 px-6 py-8 text-center text-white sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-2xl">Nhập mã MAYVEGAN10 để giảm 10%</p>
            <p className="mt-1 text-sm text-brand-200">Áp dụng cho đơn hàng từ 150.000đ, giảm tối đa 30.000đ.</p>
          </div>
          <Link to="/menu">
            <Button variant="secondary" size="lg">
              Đặt món ngay
            </Button>
          </Link>
        </div>
      </section>

      <ProductGridSection eyebrow="Ưu đãi hôm nay" title="Đang khuyến mãi" params={{ onSale: true, limit: 4 }} viewAllHref="/menu?onSale=true" />

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Khách hàng nói gì" title="Đánh giá từ thực khách" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((r) => (
              <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
                <Quote className="text-accent-400" size={22} />
                <StarRating value={r.rating} size={14} />
                <p className="flex-1 text-sm leading-relaxed text-[var(--text-primary)]">"{r.comment}"</p>
                <div className="flex items-center justify-between pt-2 text-xs text-[var(--text-muted)]">
                  <span className="font-medium text-brand-800">{r.customer?.user.fullName}</span>
                  <span>{r.product?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reservation CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--border-subtle)] bg-cream-100 px-6 py-12 text-center">
          <CalendarCheck className="text-brand-600" size={32} />
          <h2 className="font-display text-3xl text-brand-900">Ghé Mây Vegan dùng bữa cùng người thân</h2>
          <p className="max-w-lg text-sm text-[var(--text-muted)]">
            Giữ chỗ trước để có bàn ưng ý — chỉ mất chưa đến một phút.
          </p>
          <Link to="/reservation">
            <Button size="lg">Đặt bàn ngay</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
