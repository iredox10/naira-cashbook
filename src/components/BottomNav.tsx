import { Home, History, FileBarChart, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', to: '/' },
    { icon: History, label: 'History', to: '/history' },
    { icon: FileBarChart, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  return (
    <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300",
                isActive ? "text-emerald-600 scale-105" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
