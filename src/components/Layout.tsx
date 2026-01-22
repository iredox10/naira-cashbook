import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-jakarta">
      {/* Desktop Sidebar - Hidden on mobile */}
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Mobile Navigation - Hidden on desktop */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
