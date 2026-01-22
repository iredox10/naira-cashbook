import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="pb-20 max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
        <Outlet />
      </main>
      <div className="max-w-md mx-auto fixed bottom-0 left-0 right-0 z-50">
         <BottomNav />
      </div>
    </div>
  );
}
