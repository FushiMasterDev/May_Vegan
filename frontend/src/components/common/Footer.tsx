import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-brand-900 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <span className="font-display text-2xl font-semibold text-white">Mây Vegan</span>
          <p className="mt-3 text-sm leading-relaxed text-brand-200">
            Một chút xanh cho một ngày an lành. Quán ăn chay thuần Việt, nguyên liệu tươi sạch mỗi ngày.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">Khám phá</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-200">
            <li><Link to="/menu" className="hover:text-white">Thực đơn</Link></li>
            <li><Link to="/reservation" className="hover:text-white">Đặt bàn</Link></li>
            <li><Link to="/about" className="hover:text-white">Giới thiệu</Link></li>
            <li><Link to="/track-order" className="hover:text-white">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">Tài khoản</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-200">
            <li><Link to="/login" className="hover:text-white">Đăng nhập</Link></li>
            <li><Link to="/register" className="hover:text-white">Đăng ký</Link></li>
            <li><Link to="/profile" className="hover:text-white">Hồ sơ của tôi</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-300">Liên hệ</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-200">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" />
              <span>0900 000 000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0" />
              <span>hello@mayvegan.vn</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="shrink-0" />
              <span>8:00 – 21:30 hằng ngày</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-brand-300 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Mây Vegan. Đã đăng ký bản quyền.
      </div>
    </footer>
  );
}
