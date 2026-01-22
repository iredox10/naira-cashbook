import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

export function Reports() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);

  const downloadPDF = () => {
    if (!transactions) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("CashBook Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 14, 30);

    const tableData = transactions.map(t => [
       format(t.date, 'dd/MM/yyyy'),
       t.remark || t.category,
       t.type,
       t.amount.toString(),
       t.paymentMode
    ]);

    autoTable(doc, {
      head: [['Date', 'Remark', 'Type', 'Amount', 'Mode']],
      body: tableData,
      startY: 40,
    });

    doc.save('cashbook_report.pdf');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Reports</h1>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center space-y-4">
         <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Download size={32} />
         </div>
         <div>
            <h3 className="font-bold text-gray-900">Transaction Statement</h3>
            <p className="text-sm text-gray-500">Download all your transactions in PDF format.</p>
         </div>
         <button 
           onClick={downloadPDF}
           className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
         >
           Download PDF
         </button>
      </div>
    </div>
  );
}
