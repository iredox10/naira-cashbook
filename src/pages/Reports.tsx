import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Download, FileText, Share2 } from 'lucide-react';
import { formatCurrency } from '../lib/format';

export function Reports() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);

  const downloadPDF = () => {
    if (!transactions) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(5, 150, 105); // Emerald 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("CashBook Statement", 14, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, h:mm a')}`, 14, 33);

    const tableData = transactions.map(t => [
       format(t.date, 'dd/MM/yyyy'),
       t.remark || t.category,
       t.type,
       formatCurrency(t.amount),
       t.paymentMode
    ]);

    autoTable(doc, {
      head: [['Date', 'Remark', 'Type', 'Amount', 'Mode']],
      body: tableData,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105] },
      alternateRowStyles: { fillColor: [240, 253, 244] }, // emerald-50
    });

    doc.save('cashbook_statement.pdf');
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

          {/* Placeholder for Excel */}
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden opacity-60">
             <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                    <FileText size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Excel Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Export data to .xlsx for advanced analysis.</p>
                </div>
                <button disabled className="w-full mt-4 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl cursor-not-allowed">
                    Coming Soon
                </button>
             </div>
          </div>
      </div>
    </div>
  );
}
