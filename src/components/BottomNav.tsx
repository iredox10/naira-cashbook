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
    <nav className="bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )
            }
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
