import { Home, History, FileBarChart, Settings, LayoutDashboard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function DesktopSidebar() {
  const navItems = [
    { icon: Home, label: 'Dashboard', to: '/' },
    { icon: History, label: 'Transactions', to: '/history' },
    { icon: FileBarChart, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-100 sticky top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
           <LayoutDashboard size={24} />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">CashBook</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Business</h4>
         <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">S1</div>
            <div>
              <p className="text-sm font-bold text-gray-700">Shop #1</p>
              <p className="text-xs text-gray-400">Pro Plan</p>
            </div>
         </div>
      </div>
    </aside>
  );
}
