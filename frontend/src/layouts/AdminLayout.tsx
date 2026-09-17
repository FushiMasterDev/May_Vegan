import { Outlet } from 'react-router-dom';

// Full sidebar/topbar design + mobile drawer is built in Phase 4 (Frontend).
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-app)]">
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
