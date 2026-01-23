import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, isPast, isSameDay } from 'date-fns';
import { PrivacyBlur } from '../components/PrivacyBlur';
import { ReceiptShareButton } from '../components/ReceiptShareButton';
import { cn } from '../lib/utils';
import { AlertCircle, Search, Filter } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBusiness } from '../context/BusinessContext';

export function History() {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [search, setSearch] = useState('');

  const transactions = useLiveQuery(
    async () => {
      if (!currentBusiness) return [];
      return await db.transactions
        .where('businessId')
        .equals(currentBusiness.id ?? 0)
        .reverse()
        .sortBy('date');
    },
    [currentBusiness?.id]
  );

  if (!transactions) return null;

  const filtered = transactions.filter(t =>
    t.remark?.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, t) => {
    const dateKey = format(t.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500 text-sm">Track every penny in and out</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by remark or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {Object.entries(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Filter size={48} className="text-gray-300 mb-4" />
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center space-x-4 mb-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                  {isSameDay(new Date(date), new Date()) ? 'Today' : format(new Date(date), 'dd MMM, yyyy')}
                </h3>
                <div className="h-[1px] flex-1 bg-gray-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/add?id=${t.id}`)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-100 transition-all duration-200 group cursor-pointer active:scale-95"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{t.remark || t.category}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">
                            {t.category}
                          </span>
                          <span className="text-[10px] text-slate-400 py-1">
                            {format(t.date, 'h:mm a')} • {t.paymentMode}
                          </span>
                        </div>
                        {t.isCredit && t.dueDate && (
                          <div className={cn("flex items-center text-xs mt-2 font-medium px-2 py-1 rounded-md w-fit",
                            isPast(t.dueDate) ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                          )}>
                            <AlertCircle size={12} className="mr-1.5" />
                            {isPast(t.dueDate) ? `Overdue: ${format(t.dueDate, 'dd MMM')}` : `Due: ${format(t.dueDate, 'dd MMM')}`}
                          </div>
                        )}
                      </div>

                      <PrivacyBlur className={cn("text-lg font-bold tabular-nums", t.type === 'IN' ? "text-emerald-600" : "text-red-500")}>
                        {t.type === 'IN' ? '+' : '-'} {formatCurrency(t.amount)}
                      </PrivacyBlur>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <ReceiptShareButton transaction={t} variant="button" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
