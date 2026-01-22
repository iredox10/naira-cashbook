import { Eye, EyeOff, Plus, Minus } from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { PrivacyBlur } from '../components/PrivacyBlur';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { CashflowPredictor } from '../components/CashflowPredictor';

export function Home() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const navigate = useNavigate();

  const stats = useLiveQuery(async () => {
    const transactions = await db.transactions.toArray();
    let totalIn = 0;
    let totalOut = 0;
    
    transactions.forEach(t => {
      if (t.type === 'IN') totalIn += t.amount;
      else totalOut += t.amount;
    });

    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [], { totalIn: 0, totalOut: 0, balance: 0 });

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">My Business</h1>
           <p className="text-sm text-gray-500">Shop #1</p>
        </div>
        <button 
          onClick={togglePrivacyMode}
          className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
        >
          {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </header>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-200">
        <p className="text-blue-100 text-sm font-medium mb-1">Net Balance</p>
        <PrivacyBlur className="text-4xl font-bold block">
           ₹ {stats.balance.toLocaleString('en-IN')}
        </PrivacyBlur>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
           <div className="flex items-center space-x-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
             <p className="text-green-700 text-sm font-medium uppercase tracking-wider">Total In</p>
           </div>
           <PrivacyBlur className="text-green-700 text-2xl font-bold block">
             ₹ {stats.totalIn.toLocaleString('en-IN')}
           </PrivacyBlur>
         </div>
         
         <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
           <div className="flex items-center space-x-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             <p className="text-red-700 text-sm font-medium uppercase tracking-wider">Total Out</p>
           </div>
           <PrivacyBlur className="text-red-700 text-2xl font-bold block">
             ₹ {stats.totalOut.toLocaleString('en-IN')}
           </PrivacyBlur>
         </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          onClick={() => navigate('/add?type=IN')}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform cursor-pointer"
        >
           <Plus size={20} />
           <span>Cash In</span>
        </button>
        <button 
          onClick={() => navigate('/add?type=OUT')}
          className="flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-xl font-medium shadow-md active:scale-95 transition-transform cursor-pointer"
        >
           <Minus size={20} />
           <span>Cash Out</span>
        </button>
      </div>

      {/* Feature 4: Cashflow Predictor */}
      <CashflowPredictor />
    </div>
  );
}
