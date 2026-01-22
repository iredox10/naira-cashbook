import { Home, History, FileBarChart, Settings, LayoutGrid } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useState } from 'react';

export function BottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-pb z-50 fixed bottom-0 w-full">
        <div className="flex justify-around items-center h-16">
          <NavItem icon={Home} label="Home" to="/" />
          <NavItem icon={History} label="History" to="/history" />
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300", isMenuOpen ? "text-emerald-600 scale-105" : "text-gray-400")}
          >
             <div className="bg-emerald-600 text-white p-3 rounded-full -mt-6 shadow-lg border-4 border-white">
                <LayoutGrid size={24} />
             </div>
             <span className="text-[10px] font-medium tracking-wide">Menu</span>
          </button>

          <NavItem icon={FileBarChart} label="Reports" to="/reports" />
          <NavItem icon={Settings} label="Settings" to="/settings" />
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMenuOpen(false)}>
           <div className="absolute bottom-20 left-4 right-4 bg-white rounded-3xl p-4 shadow-2xl animate-in slide-in-from-bottom-10 grid grid-cols-3 gap-4">
              <MenuLink to="/inventory" label="Inventory" icon="📦" color="bg-orange-100 text-orange-600" />
              <MenuLink to="/parties" label="Parties" icon="👥" color="bg-blue-100 text-blue-600" />
              <MenuLink to="/staff" label="Staff" icon="briefcase" color="bg-purple-100 text-purple-600" />
              <MenuLink to="/add?type=IN" label="Cash In" icon="+" color="bg-emerald-100 text-emerald-600" />
              <MenuLink to="/add?type=OUT" label="Cash Out" icon="-" color="bg-red-100 text-red-600" />
           </div>
        </div>
      )}
    </>
  );
}

function NavItem({ icon: Icon, label, to }: { icon: any, label: string, to: string }) {
  return (
    <NavLink
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
  );
}

function MenuLink({ to, label, icon, color }: { to: string, label: string, icon: string, color: string }) {
    return (
        <NavLink to={to} className="flex flex-col items-center space-y-2 p-2 rounded-xl active:bg-gray-50">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm", color)}>
                {icon === 'briefcase' ? <div className="scale-75">💼</div> : icon}
            </div>
            <span className="text-xs font-bold text-slate-700">{label}</span>
        </NavLink>
    )
}
