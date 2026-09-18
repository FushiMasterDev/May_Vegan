import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Home, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminNavLinks } from './AdminSidebar';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên phục vụ',
  KITCHEN: 'Nhân viên bếp',
};

export function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 dark:text-cream-100 dark:hover:bg-white/10 lg:hidden"
            aria-label="Mở menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-lg text-[var(--text-primary)] lg:hidden">Mây Vegan</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
            {user && ROLE_LABEL[user.role]}
          </span>
          <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 dark:text-cream-100 dark:hover:bg-white/10" />
          <Dropdown
            trigger={
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <User size={16} />
              </span>
            }
            items={[
              { label: 'Về trang chủ', icon: <Home size={16} />, onClick: () => navigate('/') },
              { label: 'Đăng xuất', icon: <LogOut size={16} />, danger: true, onClick: handleLogout },
            ]}
          />
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-900 px-4 py-6">
            <div className="mb-8 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Leaf className="text-accent-400" size={22} />
                <span className="font-display text-lg font-semibold text-white">Mây Vegan</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-white/70 hover:text-white" aria-label="Đóng menu">
                <X size={20} />
              </button>
            </div>
            <AdminNavLinks onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
