import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-6xl text-brand-700">404</p>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Không tìm thấy trang</h1>
      <p className="text-[var(--text-muted)]">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-brand-600 px-6 py-2 text-white transition hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </section>
  );
}
