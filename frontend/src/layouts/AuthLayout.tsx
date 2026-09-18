import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <span className="font-display text-3xl font-semibold text-brand-800 dark:text-cream-100">Mây Vegan</span>
        </Link>
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
