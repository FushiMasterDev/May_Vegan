import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, ClipboardList, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/menu', label: 'Thực đơn' },
  { to: '/reservation', label: 'Đặt bàn' },
  { to: '/about', label: 'Giới thiệu' },
];

const STAFF_ROLES = new Set(['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-brand-800 dark:text-cream-100">Mây Vegan</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-brand-700' : 'text-[var(--text-muted)] hover:text-brand-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 dark:text-cream-100 dark:hover:bg-white/10" />
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 dark:text-cream-100 dark:hover:bg-white/10"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-semibold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <Dropdown
              trigger={
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <User size={18} />
                </span>
              }
              items={[
                { label: 'Hồ sơ của tôi', icon: <User size={16} />, onClick: () => navigate('/profile') },
                {
                  label: 'Đơn hàng của tôi',
                  icon: <ClipboardList size={16} />,
                  onClick: () => navigate('/profile?tab=orders'),
                },
                {
                  label: 'Đặt bàn của tôi',
                  icon: <CalendarDays size={16} />,
                  onClick: () => navigate('/profile?tab=reservations'),
                },
                ...(STAFF_ROLES.has(user.role)
                  ? [{ label: 'Trang quản trị', icon: <LayoutDashboard size={16} />, onClick: () => navigate('/admin') }]
                  : []),
                { label: 'Đăng xuất', icon: <LogOut size={16} />, danger: true, onClick: handleLogout },
              ]}
            />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Đăng ký
              </Button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-800 hover:bg-brand-50 dark:text-cream-100 dark:hover:bg-white/10 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-app)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-[var(--text-primary)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2 px-3">
                <Button variant="outline" fullWidth onClick={() => navigate('/login')}>
                  Đăng nhập
                </Button>
                <Button fullWidth onClick={() => navigate('/register')}>
                  Đăng ký
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
