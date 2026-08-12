import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppHeader } from '@/components/organisms/AppHeader';

export const Route = createRootRoute({ component: RootLayout });

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <Outlet />
    </div>
  );
}
