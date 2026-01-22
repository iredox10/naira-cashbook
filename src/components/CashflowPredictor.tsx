import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { addDays, isAfter, isBefore } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../lib/format';

export function CashflowPredictor() {
  const prediction = useLiveQuery(async () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    // Find all 'Credit' transactions that are due in the next 7 days
    const upcomingDues = await db.transactions
      .filter(t => 
        t.isCredit === true && 
        !!t.dueDate && 
        isAfter(new Date(t.dueDate), today) && 
        isBefore(new Date(t.dueDate), nextWeek)
      )
      .toArray();

    const totalDue = upcomingDues.reduce((sum, t) => sum + t.amount, 0);
    
    return { totalDue, count: upcomingDues.length };
  }, []);

  if (!prediction || prediction.count === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
           <AlertTriangle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-lg">Upcoming Payments</h4>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            You have <span className="font-bold bg-amber-100 px-1 rounded">{prediction.count} payments</span> totaling <span className="font-bold text-amber-900">{formatCurrency(prediction.totalDue)}</span> due in the next 7 days.
          </p>
          <button className="mt-3 text-xs font-bold text-amber-900 uppercase tracking-wide bg-amber-200/50 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
