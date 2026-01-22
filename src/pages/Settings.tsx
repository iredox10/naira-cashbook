import { User, Shield, HelpCircle, LogOut, Moon, Bell, Database, Download, Upload, Trash } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../db/db';
import { useBusiness } from '../context/BusinessContext';

export function Settings() {
  const { currentBusiness } = useBusiness();

  const handleBackup = async () => {
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const businesses = await db.businesses.toArray();
    
    const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        transactions,
        categories,
        businesses
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbook_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
          try {
              const data = JSON.parse(ev.target?.result as string);
              if (data.transactions) await db.transactions.bulkPut(data.transactions);
              if (data.categories) await db.categories.bulkPut(data.categories);
              if (data.businesses) await db.businesses.bulkPut(data.businesses);
              alert('Data restored successfully! Please refresh the app.');
              window.location.reload();
          } catch (err) {
              alert('Failed to restore backup. Invalid file.');
              console.error(err);
          }
      };
      reader.readAsText(file);
  };

  const handleReset = async () => {
      if (confirm('DANGER: This will delete ALL data permanently. Are you sure?')) {
          await db.delete();
          window.location.reload();
      }
  };

  const settingsItems = [
    { icon: User, label: 'Profile Settings', sub: 'Manage your account' },
    { icon: Bell, label: 'Notifications', sub: 'Reminders & Alerts' },
    { icon: HelpCircle, label: 'Help & Support', sub: 'Contact us, FAQ' },
  ];

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
         {/* Profile Header */}
         <div className="p-6 flex items-center space-x-4 border-b border-slate-50">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
               {currentBusiness?.name.substring(0, 1).toUpperCase()}
            </div>
            <div>
               <h3 className="font-bold text-lg text-slate-900">{currentBusiness?.name}</h3>
               <p className="text-slate-500 text-sm">Pro Plan</p>
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

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center"><Database size={18} className="mr-2"/> Data Management</h3>
          
          <button 
            onClick={handleBackup}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-colors group"
          >
              <div className="flex items-center space-x-3">
                  <Download size={20} className="text-slate-500 group-hover:text-emerald-600" />
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700">Backup Data</span>
              </div>
          </button>

          <label className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl transition-colors group cursor-pointer">
              <div className="flex items-center space-x-3">
                  <Upload size={20} className="text-slate-500 group-hover:text-blue-600" />
                  <span className="font-medium text-slate-700 group-hover:text-blue-700">Restore Data</span>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
          </label>

          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-red-50 rounded-2xl transition-colors group"
          >
              <div className="flex items-center space-x-3">
                  <Trash size={20} className="text-slate-500 group-hover:text-red-600" />
                  <span className="font-medium text-slate-700 group-hover:text-red-700">Reset Everything</span>
              </div>
          </button>
      </div>

      <p className="text-center text-xs text-slate-300 py-4">
         Version 1.1.0 • Made with ❤️ in Nigeria
      </p>
    </div>
  );
}
