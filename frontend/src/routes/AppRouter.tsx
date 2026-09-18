import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CustomerLayout from '@/layouts/CustomerLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PageLoading } from '@/components/ui/Loading';

import HomePage from '@/pages/customer/HomePage';
import MenuPage from '@/pages/customer/MenuPage';
import ProductDetailPage from '@/pages/customer/ProductDetailPage';
import CartPage from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrderSuccessPage from '@/pages/customer/OrderSuccessPage';
import OrderTrackingPage from '@/pages/customer/OrderTrackingPage';
import ReservationPage from '@/pages/customer/ReservationPage';
import AboutPage from '@/pages/customer/AboutPage';
import ProfilePage from '@/pages/customer/ProfilePage';
import LoginPage from '@/pages/customer/LoginPage';
import RegisterPage from '@/pages/customer/RegisterPage';
import ForgotPasswordPage from '@/pages/customer/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/customer/ResetPasswordPage';

import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ServerErrorPage from '@/pages/ServerErrorPage';

// Admin pages đều nằm sau route guard + chỉ nhân viên dùng — tách bundle
// riêng để khách hàng không phải tải phần này khi ghé trang chủ/thực đơn.
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage'));
const TablesPage = lazy(() => import('@/pages/admin/TablesPage'));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const IngredientsPage = lazy(() => import('@/pages/admin/IngredientsPage'));
const InventoryPage = lazy(() => import('@/pages/admin/InventoryPage'));
const CustomersPage = lazy(() => import('@/pages/admin/CustomersPage'));
const EmployeesPage = lazy(() => import('@/pages/admin/EmployeesPage'));
const CouponsPage = lazy(() => import('@/pages/admin/CouponsPage'));
const ReviewsPage = lazy(() => import('@/pages/admin/ReviewsPage'));
const RevenuePage = lazy(() => import('@/pages/admin/RevenuePage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

const MANAGEMENT_ROLES = ['ADMIN', 'MANAGER'] as const;

function AdminHome() {
  const { user } = useAuth();
  if (user && !(['ADMIN', 'MANAGER'] as string[]).includes(user.role)) {
    return <Navigate to="/admin/orders" replace />;
  }
  return <DashboardPage />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:code" element={<OrderSuccessPage />} />
        <Route path="/track-order" element={<OrderTrackingPage />} />
        <Route path="/track-order/:code" element={<OrderTrackingPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']} />}>
        <Route
          element={
            <Suspense fallback={<PageLoading />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminHome />} />

          <Route path="orders" element={<OrdersPage />} />
          <Route path="tables" element={<TablesPage />} />

          <Route element={<ProtectedRoute roles={[...MANAGEMENT_ROLES]} />}>
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="ingredients" element={<IngredientsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="employees" element={<EmployeesPage />} />
          </Route>

          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
