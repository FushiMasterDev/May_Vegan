import { Leaf, Heart, Sprout, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-accent-600">Câu chuyện của chúng tôi</p>
      <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)]">Mây Vegan</h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-primary)]">
        Mây Vegan ra đời từ mong muốn mang đến những bữa ăn chay vừa lành, vừa ngon, vừa đẹp mắt cho nhịp sống hiện
        đại. Chúng tôi tin rằng ăn chay không cần cầu kỳ hay đơn điệu — chỉ cần nguyên liệu tươi sạch, công thức nấu
        nướng tận tâm và một không gian đủ nhẹ nhàng để bạn chậm lại giữa ngày bận rộn.
      </p>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-primary)]">
        Mỗi món ăn tại Mây Vegan đều được chế biến trong ngày, từ rau củ được chọn lọc kỹ càng đến nước dùng ninh từ
        nấm và rau củ tự nhiên — không dùng phẩm màu, không chất bảo quản.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] p-5">
          <Leaf className="mb-2 text-brand-600" size={22} />
          <p className="text-sm font-semibold text-[var(--text-primary)]">Thuần chay</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">100% nguyên liệu thực vật, không sản phẩm động vật.</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-5">
          <Sprout className="mb-2 text-brand-600" size={22} />
          <p className="text-sm font-semibold text-[var(--text-primary)]">Tươi mỗi ngày</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Nhập nguyên liệu và chế biến trong ngày.</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] p-5">
          <Heart className="mb-2 text-brand-600" size={22} />
          <p className="text-sm font-semibold text-[var(--text-primary)]">Tận tâm</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Từng món ăn được chuẩn bị bằng sự chăm chút.</p>
        </div>
      </div>

      <div className="mt-10 flex items-start gap-3 rounded-2xl bg-cream-100 p-5">
        <MapPin className="mt-0.5 shrink-0 text-brand-600" size={20} />
        <div className="text-sm">
          <p className="font-medium text-[var(--text-primary)]">12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          <p className="text-[var(--text-muted)]">Mở cửa 8:00 – 21:30 hằng ngày, kể cả cuối tuần và ngày lễ.</p>
        </div>
      </div>
    </div>
  );
}
