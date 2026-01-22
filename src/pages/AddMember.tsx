import { useState } from 'react';
import { ArrowLeft, Search, Plus, Phone, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { db } from '../db/db';
import { cn } from '../lib/utils';

interface Contact {
    name: string;
    phone: string;
}

export function AddMember() {
    const navigate = useNavigate();
    const { currentBusiness } = useBusiness();
    const [searchQuery, setSearchQuery] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    // Manual Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

    // 1. Filter Contacts
    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    // 2. Fetch Native Contacts
    const handleOpenNativeContacts = async () => {
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name', 'tel'];
                const opts = { multiple: true };
                // @ts-ignore
                const selected = await navigator.contacts.select(props, opts);

                const newContacts = selected.map((c: any) => ({
                    name: c.name[0],
                    phone: c.tel[0]?.replace(/\s/g, '') || ''
                }));

                setContacts(prev => [...prev, ...newContacts]);
            } catch (ex) {
                console.error('Contact picker failed', ex);
            }
        } else {
            // Fallback to manual entry
            setIsManualModalOpen(true);
        }
    };

    // 3. Add to Database
    const handleAddMember = async (contactName: string, contactPhone: string, memberRole: 'ADMIN' | 'STAFF') => {
        if (!currentBusiness) return;

        try {
            await db.staff.add({
                businessId: currentBusiness.id!,
                name: contactName,
                role: memberRole,
                phone: contactPhone
            } as any);
            alert(`${contactName} added to members!`);
            navigate(-1);
        } catch (e) {
            console.error(e);
            alert('Failed to add member.');
        }
    };

    // 4. Send Invite 
    const handleInvite = (phone: string) => {
        const msg = `Hey, join me on CashBook to manage our business finances together!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
                <div className="flex items-center p-4 space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Add New Member</h1>
                </div>

                {/* Search Bar */}
                <div className="px-4 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or number"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-8 pb-24">

                {/* Empty State */}
                {contacts.length === 0 && (
                    <div className="text-center py-10 opacity-60">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Phone size={32} />
                        </div>
                        <p className="text-slate-500 mb-4">No contacts loaded.</p>
                        <button onClick={handleOpenNativeContacts} className="text-blue-600 font-bold underline">Load from Phonebook</button>
                    </div>
                )}

                {/* Contacts List */}
                {contacts.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Choose From Contacts</h3>
                            <span className="text-xs text-slate-400">({filteredContacts.length})</span>
                        </div>

                        <div className="space-y-4">
                            {filteredContacts.map((contact, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{contact.name}</h4>
                                            <p className="text-sm text-slate-500">{contact.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleInvite(contact.phone)} className="text-blue-600 font-bold text-xs px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors">
                                            INVITE
                                        </button>
                                        <button onClick={() => handleAddMember(contact.name, contact.phone, 'STAFF')} className="text-emerald-600 font-bold text-xs px-3 py-2 hover:bg-emerald-50 rounded-lg transition-colors">
                                            ADD
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 left-6 z-20">
                <button
                    onClick={() => setIsManualModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    <span>ADD MANUALLY</span>
                </button>
            </div>

            {/* Manual Add Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-slate-900">Add Member Manually</h2>
                            <button onClick={() => setIsManualModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input autoFocus type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="+1234567890" />
                            </div>

                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setRole('STAFF')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", role === 'STAFF' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Staff (Read Only)</button>
                                <button type="button" onClick={() => setRole('ADMIN')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", role === 'ADMIN' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Admin (Read/Write)</button>
                            </div>

                            <button onClick={() => handleAddMember(name, phone, role)} className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
                                <Save size={20} />
                                <span>Save & Add</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
