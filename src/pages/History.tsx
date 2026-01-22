import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format, isPast, isSameDay } from 'date-fns';
import { PrivacyBlur } from '../components/PrivacyBlur';
import { cn } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

export function History() {
  const transactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray(),
    []
  );

  if (!transactions || transactions.length === 0) {
    return (
       <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
         <p>No transactions yet.</p>
         <p className="text-sm">Start by adding Cash In or Out.</p>
       </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    const dateKey = format(t.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="p-4 space-y-4 pb-24">
      <h1 className="text-xl font-bold mb-4">Transaction History</h1>
      
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 sticky top-0 bg-gray-50 py-1">
             {isSameDay(new Date(date), new Date()) ? 'Today' : format(new Date(date), 'dd MMM, yyyy')}
          </h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {items.map((t, i) => (
               <div key={t.id} className={cn("p-4 flex justify-between items-center", i !== items.length - 1 && "border-b border-gray-100")}>
                 <div className="space-y-1">
                   <p className="font-medium text-gray-900">{t.remark || t.category}</p>
                   <div className="flex items-center space-x-2 text-xs text-gray-500">
                     <span className="bg-gray-100 px-2 py-0.5 rounded">{t.category}</span>
                     <span>{format(t.date, 'h:mm a')}</span>
                   </div>
                   {/* Feature 6: Promise to Pay Warning */}
                   {t.isCredit && t.dueDate && (
                     <div className={cn("flex items-center text-xs mt-1", isPast(t.dueDate) ? "text-red-600 font-bold" : "text-blue-600")}>
                        <AlertCircle size={12} className="mr-1" />
                        {isPast(t.dueDate) ? `Overdue: ${format(t.dueDate, 'dd MMM')}` : `Due: ${format(t.dueDate, 'dd MMM')}`}
                     </div>
                   )}
                 </div>
                 
                 <div className="text-right">
                   <PrivacyBlur className={cn("text-lg font-bold", t.type === 'IN' ? "text-green-600" : "text-red-600")}>
                     {t.type === 'IN' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN')}
                   </PrivacyBlur>
                   <p className="text-xs text-gray-400">{t.paymentMode}</p>
                 </div>
               </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
