import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Calendar, Save } from 'lucide-react';
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

  // Update category default when type changes
  useEffect(() => {
     if (type === 'IN' && category === 'Food') setCategory('Sales');
     if (type === 'OUT' && category === 'Sales') setCategory('Food');
  }, [type]);

  // Handle Share Target
  useEffect(() => {
    const sharedText = searchParams.get('text') || searchParams.get('title');
    if (sharedText) {
      parseVoiceInput(sharedText);
    }
  }, [searchParams]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-IN';
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
    // Simple parser: looks for first number as amount
    const numbers = text.match(/(\d+)/);
    if (numbers) {
      setAmount(numbers[0]);
    }
    // Set remark to text
    const formattedRemark = text.charAt(0).toUpperCase() + text.slice(1);
    setRemark(formattedRemark);
  };

  const handleSave = async () => {
    if (!amount) return;
    
    await db.transactions.add({
      amount: parseFloat(amount),
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={cn("p-4 text-white flex items-center space-x-4", type === 'IN' ? "bg-green-600" : "bg-red-600")}>
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">{type === 'IN' ? 'Cash In' : 'Cash Out'}</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Type Toggle */}
        <div className="flex bg-gray-200 p-1 rounded-xl">
          <button 
            onClick={() => setType('IN')}
            className={cn("flex-1 py-2 rounded-lg font-medium transition-all", type === 'IN' ? "bg-white text-green-700 shadow-sm" : "text-gray-500")}
          >
            Cash In (+)
          </button>
          <button 
             onClick={() => setType('OUT')}
             className={cn("flex-1 py-2 rounded-lg font-medium transition-all", type === 'OUT' ? "bg-white text-red-700 shadow-sm" : "text-gray-500")}
          >
            Cash Out (-)
          </button>
        </div>

        {/* Amount Input */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <label className="text-sm text-gray-500 block mb-1">Amount</label>
           <div className={cn("flex items-center text-3xl font-bold border-b-2 pb-2", type === 'IN' ? "text-green-600 border-green-100" : "text-red-600 border-red-100")}>
             <span>₹</span>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="w-full bg-transparent outline-none ml-2 placeholder-gray-300"
               placeholder="0"
               autoFocus
             />
           </div>
        </div>

        {/* Details Form */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
           {/* Date */}
           <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
             <Calendar className="text-gray-400" size={20} />
             <input 
               type="date" 
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="flex-1 bg-transparent outline-none text-gray-700"
             />
           </div>

           {/* Remark with Voice */}
           <div className="flex items-center space-x-3 border-b border-gray-100 pb-3">
             <input 
               type="text" 
               value={remark}
               onChange={(e) => setRemark(e.target.value)}
               placeholder="Remark (Item name, person...)"
               className="flex-1 bg-transparent outline-none text-gray-700"
             />
             <button 
               onClick={startListening}
               className={cn("p-2 rounded-full transition-colors", isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500")}
             >
               <Mic size={20} />
             </button>
           </div>

           {/* Category */}
           <div className="flex flex-wrap gap-2 pt-2">
             {CATEGORIES.map(cat => (
               <button
                 key={cat}
                 onClick={() => setCategory(cat)}
                 className={cn("px-3 py-1 rounded-full text-sm border", category === cat ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600")}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>

        {/* Feature 6: Promise to Pay (Credit) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
             <span className="font-medium text-gray-700">Is this Credit / Udhaar?</span>
             <input 
               type="checkbox" 
               checked={isCredit}
               onChange={(e) => setIsCredit(e.target.checked)}
               className="w-5 h-5 accent-blue-600"
             />
          </div>
          {isCredit && (
             <div className="mt-4 animate-in slide-in-from-top-2 fade-in">
               <label className="text-sm text-gray-500 block mb-1">Due Date (Promise to Pay)</label>
               <input 
                 type="date"
                 value={dueDate}
                 onChange={(e) => setDueDate(e.target.value)}
                 className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
               />
             </div>
          )}
        </div>

      </div>

      {/* Save Button */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button 
          onClick={handleSave}
          className={cn("w-full py-3 rounded-xl font-bold text-white flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-transform", type === 'IN' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
        >
          <Save size={20} />
          <span>Save Transaction</span>
        </button>
      </div>
    </div>
  );
}
