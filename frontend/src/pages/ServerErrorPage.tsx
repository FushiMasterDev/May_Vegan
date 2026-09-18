import { Link } from 'react-router-dom';

export default function ServerErrorPage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-display text-6xl text-brand-700">500</p>
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Đã xảy ra lỗi hệ thống</h1>
      <p className="text-[var(--text-muted)]">
        Có lỗi ngoài ý muốn xảy ra. Vui lòng thử lại sau ít phút.
      </p>
      <Link
        to="/"
        className="mt-4 rounded-full bg-brand-600 px-6 py-2 text-white transition hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </section>
  );
}
