import { Home, History, FileBarChart, Settings, LayoutDashboard, ChevronDown, Plus, Users, Package } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useBusiness } from '../context/BusinessContext';
import { useState } from 'react';

export function DesktopSidebar() {
  const { currentBusiness, businesses, switchBusiness, createBusiness } = useBusiness();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Dashboard', to: '/' },
    { icon: Users, label: 'Parties', to: '/parties' },
    { icon: Package, label: 'Inventory', to: '/inventory' },
    { icon: History, label: 'Transactions', to: '/history' },
    { icon: FileBarChart, label: 'Reports', to: '/reports' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  const handleCreate = async () => {
      const name = prompt("Enter new business name:");
      if (name) {
          await createBusiness(name);
          setIsDropdownOpen(false);
      }
  };

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
      
      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100 relative">
         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Business</h4>
         
         <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
         >
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {currentBusiness?.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                <p className="text-sm font-bold text-gray-700 truncate w-24">{currentBusiness?.name}</p>
                <p className="text-xs text-gray-400">Manage</p>
                </div>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
         </button>

         {/* Dropdown */}
         {isDropdownOpen && (
             <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-50">
                 <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1">
                     {businesses?.map(b => (
                         <button
                            key={b.id}
                            onClick={() => {
                                switchBusiness(b.id);
                                setIsDropdownOpen(false);
                            }}
                            className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-medium", currentBusiness?.id === b.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-gray-50 text-gray-700")}
                         >
                             {b.name}
                         </button>
                     ))}
                 </div>
                 <div className="h-[1px] bg-gray-100 my-2"></div>
                 <button
                    onClick={handleCreate}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                 >
                     <Plus size={16} />
                     <span>Add Business</span>
                 </button>
             </div>
         )}
      </div>
    </aside>
  );
}
