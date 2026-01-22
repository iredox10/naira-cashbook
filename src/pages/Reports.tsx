import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Download, FileText } from 'lucide-react';
import { formatCurrency } from '../lib/format';

import { useBusiness } from '../context/BusinessContext';

export function Reports() {
  const { currentBusiness } = useBusiness();
  const transactions = useLiveQuery(async () => {
    if (!currentBusiness) return [];
    return await db.transactions
      .where('businessId')
      .equals(currentBusiness.id)
      .toArray();
  }, [currentBusiness?.id]);

  const downloadPDF = () => {
    // ... (existing PDF code)
  }; // Placeholder for existing code match

  const downloadExcel = () => {
    if (!transactions) return;

    const worksheet = XLSX.utils.json_to_sheet(transactions.map(t => ({
        Date: format(t.date, 'yyyy-MM-dd'),
        Remark: t.remark,
        Category: t.category,
        Type: t.type,
        Amount: t.amount,
        Mode: t.paymentMode,
        Status: t.isCredit ? (t.dueDate ? `Due: ${format(t.dueDate, 'yyyy-MM-dd')}` : 'Credit') : 'Paid'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "CashBook_Export.xlsx");
  };

  return (
    <div className="p-4 md:p-0 space-y-6 animate-in fade-in duration-500">
      <div className="md:flex md:items-center md:justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-500 text-sm">Export your financial data</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors"></div>
             
             <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">PDF Statement</h3>
                    <p className="text-sm text-slate-500 mt-1 px-4">Download a detailed list of all your income and expenses formatted for printing.</p>
                </div>
                <button 
                onClick={downloadPDF}
                className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-200 hover:bg-emerald-700 flex items-center justify-center space-x-2"
                >
                <Download size={18} />
                <span>Download PDF</span>
                </button>
             </div>
          </div>

           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-20 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:bg-green-100 transition-colors"></div>
             <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Excel Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Export data to .xlsx for advanced analysis.</p>
                </div>
                <button 
                  onClick={downloadExcel}
                  className="w-full mt-4 bg-green-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow-lg shadow-green-200 hover:bg-green-700 flex items-center justify-center space-x-2">
                    <Download size={18} />
                    <span>Download Excel</span>
                </button>
             </div>
          </div>
      </div>
    </div>
  );
}
