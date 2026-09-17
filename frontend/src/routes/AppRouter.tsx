import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '@/layouts/CustomerLayout';
import AdminLayout from '@/layouts/AdminLayout';
import HomePage from '@/pages/customer/HomePage';
import DashboardPage from '@/pages/admin/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ServerErrorPage from '@/pages/ServerErrorPage';

// Customer pages (Menu, ProductDetail, Cart, Checkout, Reservation, Auth, Profile...)
// and remaining admin pages (Orders, Tables, Products...) are added in Phase 4,
// together with role-based route guards once auth is wired up.
export default function AppRouter() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
