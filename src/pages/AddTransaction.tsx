import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { db, CATEGORIES } from '../db/db';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function AddTransaction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = searchParams.get('type') === 'OUT' ? 'OUT' : 'IN';
  
  const [type, setType] = useState<'IN' | 'OUT'>(initialType);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
     if (type === 'IN' && category === 'Food') setCategory('Sales');
     if (type === 'OUT' && category === 'Sales') setCategory('Food');
  }, [type]);

  useEffect(() => {
    const sharedText = searchParams.get('text') || searchParams.get('title');
    if (sharedText) parseVoiceInput(sharedText);
  }, [searchParams]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-NG';
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      parseVoiceInput(transcript);
    };
    
    recognition.start();
  };

  const parseVoiceInput = (text: string) => {
    const numbers = text.match(/(\d+)/);
    if (numbers) {
       const raw = numbers[0];
       const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
       setAmount(formatted);
    }
    const formattedRemark = text.charAt(0).toUpperCase() + text.slice(1);
    setRemark(formattedRemark);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    if ((value.match(/\./g) || []).length > 1) return;
    if (value.includes('.')) {
        const [whole, decimal] = value.split('.');
        if (decimal.length > 2) value = `${whole}.${decimal.substring(0, 2)}`;
    }
    if (value) {
       const parts = value.split('.');
       parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
       setAmount(parts.join('.'));
    } else {
       setAmount('');
    }
  };

  const handleSave = async () => {
    if (!amount) return;
    const numericAmount = parseFloat(amount.replace(/,/g, ''));
    
    await db.transactions.add({
      amount: numericAmount,
      type,
      category,
      remark,
      date: new Date(date),
      paymentMode: 'Cash',
      isCredit,
      dueDate: isCredit && dueDate ? new Date(dueDate) : undefined
    });
    
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-0 md:py-10">
      
      <div className="w-full max-w-lg bg-white md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden min-h-screen md:min-h-0 flex flex-col">
        {/* Header */}
        <div className={cn("px-6 py-6 text-white flex items-center justify-between transition-colors duration-500", type === 'IN' ? "bg-emerald-600" : "bg-red-600")}>
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold tracking-wide">{type === 'IN' ? 'Record Income' : 'Record Expense'}</h1>
            </div>
            <div className="flex bg-black/20 p-1 rounded-lg backdrop-blur-sm">
                <button 
                    onClick={() => setType('IN')}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === 'IN' ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-100 hover:bg-white/10")}
                >
                    In
                </button>
                <button 
                    onClick={() => setType('OUT')}
                    className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-all", type === 'OUT' ? "bg-white text-red-700 shadow-sm" : "text-red-100 hover:bg-white/10")}
                >
                    Out
                </button>
            </div>
        </div>

        <div className="flex-1 p-6 space-y-8">
            
            {/* Amount Input */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</label>
                <div className="relative group">
                    <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold transition-colors", type === 'IN' ? "text-emerald-600" : "text-red-600")}>₦</span>
                    <input 
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    className={cn("w-full pl-8 py-2 bg-transparent border-b-2 text-4xl font-bold outline-none placeholder-gray-200 transition-colors", type === 'IN' ? "border-emerald-100 focus:border-emerald-500 text-emerald-700" : "border-red-100 focus:border-red-500 text-red-700")}
                    placeholder="0"
                    autoFocus
                    />
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                
                {/* Remark */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remark</label>
                    <div className="flex items-center space-x-2">
                        <input 
                        type="text" 
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="What is this for?"
                        className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                        <button 
                        onClick={startListening}
                        className={cn("p-3 rounded-xl transition-all active:scale-95", isListening ? "bg-red-100 text-red-600 ring-2 ring-red-200 animate-pulse" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                        >
                        <Mic size={20} />
                        </button>
                    </div>
                </div>

                {/* Date & Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-slate-700"
                            />
                         </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all border", 
                                category === cat 
                                ? "bg-slate-800 text-white border-slate-800 shadow-md transform scale-105" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {cat}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Credit Toggle */}
                <div className={cn("p-4 rounded-xl border transition-all duration-300", isCredit ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100")}>
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsCredit(!isCredit)}>
                        <div className="flex items-center space-x-3">
                             <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-colors", isCredit ? "bg-amber-500 border-amber-500" : "border-gray-300")}>
                                {isCredit && <CheckCircle2 size={14} className="text-white" />}
                             </div>
                             <span className="font-medium text-slate-700">Mark as Unpaid / Credit</span>
                        </div>
                    </div>
                    {isCredit && (
                        <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
                            <label className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 block">Due Date</label>
                            <input 
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-white border border-amber-200 rounded-lg p-2 text-amber-900 focus:ring-2 focus:ring-amber-500/20 outline-none"
                            />
                        </div>
                    )}
                </div>

            </div>

        </div>

        {/* Footer Action */}
        <div className="p-6 bg-white border-t border-slate-50">
            <button 
            onClick={handleSave}
            className={cn("w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center space-x-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300", type === 'IN' ? "bg-emerald-600 shadow-emerald-200" : "bg-red-600 shadow-red-200")}
            >
            <Save size={20} />
            <span>Save Transaction</span>
            </button>
        </div>
      </div>
    </div>
  );
}
