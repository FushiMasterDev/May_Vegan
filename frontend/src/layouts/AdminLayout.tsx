import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/common/AdminSidebar';
import { AdminTopbar } from '@/components/common/AdminTopbar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
