import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useBusiness } from '../context/BusinessContext';
import { Plus, Trash2, X, Save, Share2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Staff() {
  const { currentBusiness } = useBusiness();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staff = useLiveQuery(async () => {
    if (!currentBusiness) return [];
    return await db.staff
      .where('businessId')
      .equals(currentBusiness.id ?? 0)
      .toArray();
  }, [currentBusiness?.id]);

  const handleDelete = async (id: number) => {
    if (confirm('Remove this staff member?')) {
      await db.staff.delete(id);
    }
  };

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Members</h1>
          <p className="text-slate-500 text-sm">Staff & Partners</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff?.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                {s.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">{s.role}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(s.id!)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {/* Helper Card for Sharing */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Share Book with Partner?</h3>
            <p className="text-indigo-100 text-sm opacity-90">Export your business data securely and send it to your partner or accountant.</p>
          </div>
          <button
            onClick={() => (document.getElementById('backup-btn') as HTMLElement)?.click()}
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-indigo-50 active:scale-95 transition-all shadow-md"
          >
            <Share2 size={18} />
            <span>Share Data File</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <StaffModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          businessId={currentBusiness?.id!}
        />
      )}
    </div>
  );
}

function StaffModal({ isOpen, onClose, businessId }: { isOpen: boolean; onClose: () => void; businessId: number }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.staff.add({
      businessId,
      name,
      role
    } as any);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900">Add Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="Staff Name" />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setRole('STAFF')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", role === 'STAFF' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Staff</button>
            <button type="button" onClick={() => setRole('ADMIN')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", role === 'ADMIN' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Partner (Admin)</button>
          </div>

          <button type="submit" className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
            <Save size={20} />
            <span>Add Member</span>
          </button>
        </form>
      </div>
    </div>
  );
}
