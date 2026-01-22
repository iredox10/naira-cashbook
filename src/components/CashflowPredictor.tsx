import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { addDays, isAfter, isBefore, format } from 'date-fns';
import { TrendingUp, AlertTriangle } from 'lucide-react';

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
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-amber-100 rounded-full text-amber-600">
           <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-800">Upcoming Payments</h4>
          <p className="text-sm text-amber-700 mt-1">
            You have <span className="font-bold">{prediction.count} payments</span> totaling <span className="font-bold">₹{prediction.totalDue.toLocaleString()}</span> due in the next 7 days.
          </p>
          <button className="mt-3 text-xs font-bold text-amber-800 uppercase tracking-wide bg-amber-100 px-3 py-1 rounded-full">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
