import { User, Shield, HelpCircle, LogOut, Moon, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const settingsItems = [
    { icon: User, label: 'Profile Settings', sub: 'Manage your account' },
    { icon: Bell, label: 'Notifications', sub: 'Reminders & Alerts' },
    { icon: Shield, label: 'Security & Backup', sub: 'Pin lock, Google Drive' },
    { icon: HelpCircle, label: 'Help & Support', sub: 'Contact us, FAQ' },
  ];

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
         {/* Profile Header */}
         <div className="p-6 flex items-center space-x-4 border-b border-slate-50">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
               S
            </div>
            <div>
               <h3 className="font-bold text-lg text-slate-900">Shop #1</h3>
               <p className="text-slate-500 text-sm">Free Plan</p>
            </div>
            <button className="ml-auto text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors">
               Edit
            </button>
         </div>

         <div className="p-4 space-y-1">
            {settingsItems.map((item, i) => (
               <button key={i} className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors text-left group">
                  <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-white group-hover:text-emerald-600 group-hover:shadow-sm transition-all">
                     <item.icon size={20} />
                  </div>
                  <div>
                     <p className="font-semibold text-slate-900">{item.label}</p>
                     <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
               </button>
            ))}
         </div>
      </div>

      <button className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors">
         <LogOut size={20} />
         <span>Sign Out</span>
      </button>

      <p className="text-center text-xs text-slate-300 py-4">
         Version 1.0.0 • Made with ❤️ in Nigeria
      </p>
    </div>
  );
}
