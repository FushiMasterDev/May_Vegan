import { Outlet } from 'react-router-dom';

// Full navbar/footer design is built in Phase 4 (Frontend).
export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-app)]">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
