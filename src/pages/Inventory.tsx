import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Item } from '../db/db';
import { useBusiness } from '../context/BusinessContext';
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2, X, Save } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { cn } from '../lib/utils';

export function Inventory() {
  const { currentBusiness } = useBusiness();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const items = useLiveQuery(async () => {
    if (!currentBusiness) return [];
    return await db.items
      .where('businessId')
      .equals(currentBusiness.id ?? 0)
      .reverse()
      .toArray();
  }, [currentBusiness?.id]);

  const filteredItems = items?.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('Delete this item?')) {
      await db.items.delete(id);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500 text-sm">Manage stock and pricing</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems?.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className={cn("p-3 rounded-xl", item.stock <= (item.minStock ?? 0) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{formatCurrency(item.price)} / {item.unit ?? 'pcs'}</p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(item.id!)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Level</div>
              <div className={cn("flex items-center space-x-1 font-bold", item.stock <= (item.minStock ?? 0) ? "text-red-600" : "text-emerald-700")}>
                {item.stock <= (item.minStock ?? 0) && <AlertTriangle size={14} />}
                <span>{item.stock} {item.unit ?? 'pcs'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={editingItem}
          businessId={currentBusiness?.id!}
        />
      )}
    </div>
  );
}

function ItemModal({ isOpen, onClose, item, businessId }: { isOpen: boolean; onClose: () => void; item: Item | null; businessId: number }) {
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price.toString() || '');
  const [stock, setStock] = useState(item?.stock.toString() || '');
  const [minStock, setMinStock] = useState(item?.minStock?.toString() || '5');
  const [unit, setUnit] = useState(item?.unit || 'pcs');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      businessId,
      name,
      price: parseFloat(price),
      stock: parseFloat(stock),
      minStock: parseFloat(minStock),
      unit
    };

    if (item) {
      await db.items.update(item.id!, data);
    } else {
      await db.items.add(data as any);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900">{item ? 'Edit Item' : 'New Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Milk Carton" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
              <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Unit</label>
              <input required type="text" value={unit} onChange={e => setUnit(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="pcs, kg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Current Stock</label>
              <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Low Stock Alert</label>
              <input required type="number" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-emerald-500" placeholder="5" />
            </div>
          </div>

          <button type="submit" className="w-full py-4 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all">
            <Save size={20} />
            <span>Save Item</span>
          </button>
        </form>
      </div>
    </div>
  );
}
