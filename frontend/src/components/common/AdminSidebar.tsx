import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Grid3x3,
  UtensilsCrossed,
  Wheat,
  Warehouse,
  Users,
  UserCog,
  Ticket,
  Star,
  TrendingUp,
  FileBarChart,
  Settings,
  Leaf,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
  { to: '/admin/tables', label: 'Bàn', icon: Grid3x3, roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  { to: '/admin/products', label: 'Thực đơn', icon: UtensilsCrossed, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/categories', label: 'Danh mục', icon: Grid3x3, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/ingredients', label: 'Nguyên liệu', icon: Wheat, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/inventory', label: 'Kho', icon: Warehouse, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/customers', label: 'Khách hàng', icon: Users, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/employees', label: 'Nhân viên', icon: UserCog, roles: ['ADMIN'] },
  { to: '/admin/coupons', label: 'Khuyến mãi', icon: Ticket, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/reviews', label: 'Đánh giá', icon: Star, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/revenue', label: 'Doanh thu', icon: TrendingUp, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/reports', label: 'Báo cáo', icon: FileBarChart, roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin'}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
              isActive ? 'bg-brand-600 text-white' : 'text-brand-100/80 hover:bg-white/10 hover:text-white'
            )
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-brand-900 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Leaf className="text-accent-400" size={24} />
        <span className="font-display text-xl font-semibold text-white">Mây Vegan</span>
      </div>
      <AdminNavLinks />
    </aside>
  );
}
