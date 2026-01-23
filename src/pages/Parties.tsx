import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Party } from '../db/db';
import { useBusiness } from '../context/BusinessContext';
import { Plus, Search, Phone, ArrowRight, X, Save, MessageCircle, QrCode } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { ReceiptShareButton } from '../components/ReceiptShareButton';

export function Parties() {
    const { currentBusiness } = useBusiness();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);

    const parties = useLiveQuery(async () => {
        if (!currentBusiness) return [];
        return await db.parties
            .where('businessId')
            .equals(currentBusiness.id ?? 0)
            .toArray();
    }, [currentBusiness?.id]);

    const filteredParties = parties?.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.phone ?? '').includes(search)
    );

    return (
        <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">

            {!selectedParty ? (
                <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Parties</h1>
                            <p className="text-slate-500 text-sm">Customers & Suppliers</p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search name or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                            >
                                <Plus size={20} />
                                <span className="hidden md:inline">Add Party</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredParties?.map(party => (
                            <PartyCard key={party.id} party={party} onClick={() => setSelectedParty(party)} />
                        ))}
                    </div>
                </>
            ) : (
                <PartyLedger party={selectedParty} onBack={() => setSelectedParty(null)} />
            )}

            {isModalOpen && (
                <PartyModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    businessId={currentBusiness?.id!}
                />
            )}
        </div>
    );
}

function PartyCard({ party, onClick }: { party: Party; onClick: () => void }) {
    // Calculate balance
    const balance = useLiveQuery(async () => {
        const txs = await db.transactions.where('partyId').equals(party.id ?? 0).toArray();
        let bal = 0;
        txs.forEach(t => {
            if (party.type === 'Customer') {
                if (t.type === 'OUT' && t.isCredit) bal += t.amount;
                if (t.type === 'IN') bal -= t.amount;
            } else {
                // SUPPLIER
                if (t.type === 'IN' && t.isCredit) bal += t.amount;
                if (t.type === 'OUT') bal -= t.amount;
            }
        });
        return bal;
    }, [party.id]);

    return (
        <div onClick={onClick} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                    {party.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">{party.name}</h3>
                    <div className="flex items-center text-xs text-slate-400 mt-0.5">
                        <Phone size={12} className="mr-1" />
                        {party.phone}
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className={cn("text-lg font-bold", (balance || 0) > 0 ? "text-red-600" : "text-emerald-600")}>
                    {formatCurrency(Math.abs(balance || 0))}
                </p>
                <p className="text-xs text-slate-400">{(balance || 0) > 0 ? (party.type === 'Customer' ? 'You receive' : 'You pay') : 'Settled'}</p>
            </div>
        </div>
    );
}

function PartyLedger({ party, onBack }: { party: Party; onBack: () => void }) {
    const [showQR, setShowQR] = useState(false);

    const transactions = useLiveQuery(
        () => db.transactions.where('partyId').equals(party.id ?? 0).reverse().sortBy('date'),
        [party.id]
    );

    const balance = useLiveQuery(async () => {
        if (!transactions) return 0;
        let bal = 0;
        transactions.forEach(t => {
            if (party.type === 'Customer') {
                if (t.type === 'OUT' && t.isCredit) bal += t.amount;
                if (t.type === 'IN') bal -= t.amount;
            } else {
                if (t.type === 'IN' && t.isCredit) bal += t.amount;
                if (t.type === 'OUT') bal -= t.amount;
            }
        });
        return bal;
    }, [transactions]);

    const sendWhatsApp = () => {
        if (!balance || balance <= 0) return;
        const msg = `Hello ${party.name}, your pending balance is ${formatCurrency(balance)}. Please pay at your earliest convenience.`;
        const url = `https://wa.me/${party.phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight size={24} className="rotate-180" /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{party.name}</h1>
                    <p className="text-slate-500 text-sm">{party.type}</p>
                </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex justify-between items-center">
                <div>
                    <p className="text-slate-400 text-sm mb-1">{party.type === 'Customer' ? 'Receivable Balance' : 'Payable Balance'}</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(balance || 0)}</h2>
                </div>
                <div className="flex gap-2">
                    {(balance || 0) > 0 && (
                        <button
                            onClick={sendWhatsApp}
                            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold transition-all active:scale-95"
                        >
                            <MessageCircle size={20} />
                            <span className="hidden md:inline">Remind</span>
                        </button>
                    )}
                    <button
                        onClick={() => setShowQR(true)}
                        className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-xl font-bold transition-all active:scale-95"
                    >
                        <QrCode size={20} />
                    </button>
                </div>
            </div>

            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowQR(false)}>
                    <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center space-y-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900">Scan to Pay</h3>
                        <p className="text-slate-500 text-sm">Ask {party.name} to scan this code</p>

                        <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 inline-block">
                            <QRCodeSVG
                                value={`upi://pay?pa=example@upi&pn=MyBusiness&am=${Math.abs(balance || 0)}&tn=Payment from ${party.name}`}
                                size={200}
                                level="H"
                            />
                        </div>

                        <p className="font-mono font-bold text-2xl text-slate-900">{formatCurrency(Math.abs(balance || 0))}</p>

                        <button onClick={() => setShowQR(false)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700">Close</button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <h3 className="font-bold text-slate-900">Transaction History</h3>
                {transactions?.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-slate-900">{t.remark || 'Transaction'}</p>
                            <p className="text-xs text-slate-400">{format(t.date, 'dd MMM yyyy')}</p>
                        </div>
                        <div className="text-right">
                            <div className={cn("font-bold mb-1", t.type === 'IN' ? "text-emerald-600" : "text-red-600")}>
                                {t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}
                            </div>
                            <ReceiptShareButton transaction={t} partyName={party.name} variant="icon" />
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}

function PartyModal({ isOpen, onClose, businessId }: { isOpen: boolean; onClose: () => void; businessId: number }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.parties.add({
            businessId,
            name,
            phone,
            type
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-slate-900">New Party</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => setType('Customer')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", type === 'Customer' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Customer</button>
                        <button type="button" onClick={() => setType('Supplier')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm", type === 'Supplier' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}>Supplier</button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone (WhatsApp)</label>
                        <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="+234..." />
                    </div>

                    <button type="submit" className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
                        <Save size={20} />
                        <span>Save Party</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
