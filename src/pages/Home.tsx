import { Eye, EyeOff, Plus, Minus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import { PrivacyBlur } from '../components/PrivacyBlur';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { CashflowPredictor } from '../components/CashflowPredictor';
import { formatCurrency } from '../lib/format';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useBusiness } from '../context/BusinessContext';
import { cn } from '../lib/utils';

export function Home() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();

  const data = useLiveQuery(async () => {
    if (!currentBusiness?.id) return { totalIn: 0, totalOut: 0, balance: 0, todayIn: 0, todayOut: 0, chartData: [] };

    const transactions = await db.transactions
      .where('businessId')
      .equals(currentBusiness.id)
      .toArray();

    let totalIn = 0;
    let totalOut = 0;
    let todayIn = 0;
    let todayOut = 0;

    const today = new Date().setHours(0, 0, 0, 0);

    // Prepare chart data (last 10 transactions)
    const chartData = transactions.slice(-10).map((t, i) => ({
      name: i,
      amount: t.type === 'IN' ? t.amount : -t.amount
    }));

    transactions.forEach(t => {
      const isToday = new Date(t.date).setHours(0, 0, 0, 0) === today;
      if (t.type === 'IN') {
        totalIn += t.amount;
        if (isToday) todayIn += t.amount;
      } else {
        totalOut += t.amount;
        if (isToday) todayOut += t.amount;
      }
    });

    return { totalIn, totalOut, balance: totalIn - totalOut, todayIn, todayOut, chartData };
  }, [currentBusiness?.id], { totalIn: 0, totalOut: 0, balance: 0, todayIn: 0, todayOut: 0, chartData: [] });

  return (
    <div className="p-4 md:p-0 space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            {currentBusiness?.name || 'Overview of your cash flow'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePrivacyMode}
            className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all"
          >
            {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </header>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Balance Card - Featured */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-2xl shadow-emerald-200 md:col-span-1 min-h-[180px] flex flex-col justify-between group">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-emerald-100 mb-2">
              <Wallet size={18} />
              <span className="font-semibold tracking-wide uppercase text-xs">Net Balance</span>
            </div>
            <PrivacyBlur className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {formatCurrency(data.balance)}
            </PrivacyBlur>
          </div>
          <div className="relative z-10 text-emerald-100 text-xs font-medium mt-4">
            Updated just now
          </div>
        </div>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Income</p>
            <PrivacyBlur className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              {formatCurrency(data.totalIn)}
            </PrivacyBlur>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <TrendingDown size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Last 30 days</span>
            </div>
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Expense</p>
            <PrivacyBlur className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
              {formatCurrency(data.totalOut)}
            </PrivacyBlur>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Today's Summary</h3>
          <span className="text-xs font-medium text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/50 rounded-2xl">
            <p className="text-xs font-bold text-emerald-600/60 uppercase mb-1">Inflow</p>
            <PrivacyBlur className="text-xl font-bold text-emerald-700">{formatCurrency(data.todayIn)}</PrivacyBlur>
          </div>
          <div className="p-4 bg-red-50/50 rounded-2xl">
            <p className="text-xs font-bold text-red-600/60 uppercase mb-1">Outflow</p>
            <PrivacyBlur className="text-xl font-bold text-red-700">{formatCurrency(data.todayOut)}</PrivacyBlur>
          </div>
          <div className="p-4 bg-slate-50/50 rounded-2xl col-span-2">
            <p className="text-xs font-bold text-slate-600/60 uppercase mb-1">Net Cash</p>
            <PrivacyBlur className={cn("text-xl font-bold", data.todayIn - data.todayOut >= 0 ? "text-emerald-700" : "text-red-700")}>
              {formatCurrency(data.todayIn - data.todayOut)}
            </PrivacyBlur>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
          <button
            onClick={() => navigate('/add?type=IN')}
            className="w-full flex items-center justify-between px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Plus size={20} />
              </div>
              <span>Cash In</span>
            </div>
            <span className="opacity-60 text-sm">Income</span>
          </button>

          <button
            onClick={() => navigate('/add?type=OUT')}
            className="w-full flex items-center justify-between px-6 py-4 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-2xl font-bold shadow-sm active:scale-95 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 group-hover:bg-red-100 rounded-lg transition-colors">
                <Minus size={20} />
              </div>
              <span>Cash Out</span>
            </div>
            <span className="opacity-40 text-sm">Expense</span>
          </button>

          {/* Widget */}
          <CashflowPredictor />
        </div>

        {/* Chart (Hidden on small mobile if needed, but lets keep it responsive) */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[300px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Cashflow Trend</h3>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [formatCurrency(value), 'Amount']}
                />
                <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
