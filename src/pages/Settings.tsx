import { User, Shield, HelpCircle, Database, Download, Upload, Trash, LogOut, Cloud, RefreshCw, Briefcase, Plus, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../db/db';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

export function Settings() {
    const { currentBusiness, businesses, switchBusiness, createBusiness, userRole, switchRole } = useBusiness();
    const { user, logout } = useAuth();
    const { sync, isSyncing, lastSynced } = useSync();

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
        }
    };

    const handleBackup = async () => {
        if (!currentBusiness?.id) return;
        const business = await db.businesses.get(currentBusiness.id);
        const transactions = await db.transactions.where('businessId').equals(currentBusiness.id).toArray();
        const categories = await db.categories.where('businessId').equals(currentBusiness.id).toArray();
        const items = await db.items.where('businessId').equals(currentBusiness.id).toArray();
        const parties = await db.parties.where('businessId').equals(currentBusiness.id).toArray();
        const staff = await db.staff.where('businessId').equals(currentBusiness.id).toArray();

        const data = {
            version: 2,
            timestamp: new Date().toISOString(),
            business,
            transactions,
            categories,
            items,
            parties,
            staff
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashbook_${currentBusiness.name}_${new Date().toISOString().split('T')[0]}.json`;
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

                // Validate backup version or structure
                if (!data.business || !data.transactions) throw new Error("Invalid backup file");

                await db.transaction('rw', [db.businesses, db.transactions, db.categories, db.items, db.parties, db.staff], async () => {
                    // 1. Restore Business (Upsert)
                    await db.businesses.put(data.business);

                    // 2. Restore related data
                    if (data.transactions) await db.transactions.bulkPut(data.transactions);
                    if (data.categories) await db.categories.bulkPut(data.categories);
                    if (data.items) await db.items.bulkPut(data.items);
                    if (data.parties) await db.parties.bulkPut(data.parties);
                    if (data.staff) await db.staff.bulkPut(data.staff);
                });

                alert(`Successfully restored data for ${data.business.name}!`);
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
        { icon: HelpCircle, label: 'Help & Support', sub: 'Contact us, FAQ' },
    ];

    return (
        <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* User Info Header */}
                <div className="p-6 flex items-center space-x-4 border-b border-slate-50">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl">
                        {user?.name.substring(0, 1).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{user?.name || 'User Name'}</h3>
                        <p className="text-slate-500 text-sm">{user?.email}</p>
                    </div>
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

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 p-4 hover:bg-red-50 rounded-2xl transition-colors text-left group"
                    >
                        <div className="p-3 bg-slate-50 text-slate-500 rounded-xl group-hover:bg-white group-hover:text-red-600 group-hover:shadow-sm transition-all">
                            <LogOut size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors">Logout</p>
                            <p className="text-xs text-slate-400">Sign out of your account</p>
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
                <h3 className="font-bold text-slate-900 flex items-center justify-between">
                    <span className="flex items-center"><Briefcase size={18} className="mr-2" /> My Businesses</span>
                    <button onClick={async () => {
                        const name = prompt("Enter new business name:");
                        if (name) await createBusiness(name);
                    }} className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"><Plus size={14} className="mr-1" /> New</button>
                </h3>

                <div className="space-y-2">
                    {businesses?.map(b => (
                        <div key={b.id} className="relative group">
                            <button
                                onClick={() => switchBusiness(b.id!)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-xl transition-all border text-left",
                                    currentBusiness?.id === b.id ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]" : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                                )}>
                                <span className="font-bold">{b.name}</span>
                                {currentBusiness?.id === b.id && <span className="bg-white/20 text-xs px-2 py-1 rounded-full text-white">Active</span>}
                            </button>
                            {currentBusiness?.id === b.id && (
                                <a href="/add-member" className="absolute right-14 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors" title="Add Members">
                                    <UserPlus size={16} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Cloud size={18} className="mr-2" /> Cloud Synchronization</h3>

                <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-emerald-900">Sync with Appwrite</p>
                        <p className="text-xs text-emerald-600">
                            {lastSynced ? `Last synced: ${lastSynced.toLocaleTimeString()}` : 'Never synced to cloud'}
                        </p>
                    </div>
                    <button
                        onClick={sync}
                        disabled={isSyncing}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-sm",
                            isSyncing ? "bg-white text-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
                        )}
                    >
                        <RefreshCw size={20} className={cn(isSyncing && "animate-spin")} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 px-2">Your data is stored locally first. Sync to access it from any device safely.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Shield size={18} className="mr-2" /> Mode & Security</h3>

                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => switchRole('Admin')}
                        className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", userRole === 'Admin' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                    >
                        Admin Mode
                    </button>
                    <button
                        onClick={() => switchRole('Operator')}
                        className={cn("flex-1 py-3 rounded-xl font-bold text-sm transition-all", userRole === 'Operator' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
                    >
                        Operator Mode
                    </button>
                </div>
                <p className="text-xs text-slate-400 px-2 italic">Operator mode hides reports, staff management, and sensitive business costs.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center"><Database size={18} className="mr-2" /> Data Management</h3>

                <button
                    onClick={handleBackup}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-colors group"
                >
                    <div className="flex items-center space-x-3">
                        <Download size={20} className="text-slate-500 group-hover:text-emerald-600" />
                        <span className="font-medium text-slate-700 group-hover:text-emerald-700">Backup Data</span>
                    </div>
                </button>

                {userRole === 'Admin' && (
                    <>
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
                    </>
                )}
            </div>

            <p className="text-center text-xs text-slate-300 py-4">
                Version 1.1.0 • Made with ❤️ in Nigeria
            </p>
        </div>
    );
}
