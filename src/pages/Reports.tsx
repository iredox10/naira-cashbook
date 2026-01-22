import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Download, FileText, Receipt, Printer } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export function Reports() {
  const { currentBusiness } = useBusiness();
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [taxRate, setTaxRate] = useState('7.5');

  const transactions = useLiveQuery(async () => {
    if (!currentBusiness) return [];
    return await db.transactions
      .where('businessId')
      .equals(currentBusiness.id ?? 0)
      .toArray();
  }, [currentBusiness?.id]);

  const parties = useLiveQuery(() =>
    currentBusiness ? db.parties.where('businessId').equals(currentBusiness.id ?? 0).toArray() : []
    , [currentBusiness?.id]);

  const downloadPDF = () => {
    if (!transactions) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(5, 150, 105); // Emerald 600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(currentBusiness?.name || "CashBook Statement", 14, 25);

    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, h:mm a')}`, 14, 33);

    const formatForPDF = (amount: number) => {
      return "NGN " + amount.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    };

    const tableData = transactions.map(t => [
      format(t.date, 'dd/MM/yyyy'),
      t.remark || t.category,
      t.type,
      formatForPDF(t.amount),
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

  const generateInvoice = async () => {
    if (!selectedPartyId || !transactions) {
      alert("Please select a party first");
      return;
    }

    const party = parties?.find(p => p.id === parseInt(selectedPartyId));
    if (!party) return;

    const partyTx = transactions.filter(t => t.partyId === party.id);

    const doc = new jsPDF();

    // Invoice Header
    doc.setFontSize(24);
    doc.setTextColor(33, 33, 33);
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`From: ${currentBusiness?.name}`, 14, 30);
    doc.text(`To: ${party.name}`, 14, 35);
    doc.text(`Phone: ${party.phone}`, 14, 40);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 150, 30);

    // Items (Transactions)
    const formatForPDF = (amount: number) => {
      return "NGN " + amount.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    };

    // Filter only "OUT" (Sales to customer) or "IN" depending on context?
    // Usually Invoice = Items Sold (Cash In or Credit Given). 
    // In Cashbook context, "Cash In" from customer = Payment. 
    // "Cash Out" to customer = Refund?
    // Wait, standard logic:
    // We sold goods -> Cash In (if paid) or Credit Sale (if unpaid).
    // So we want to list all "Sales" (IN)
    // Actually, if we sold on credit, it's a transaction where we *gave* goods.
    // Let's just list ALL transactions for the party to show the Statement/Invoice.

    // Better: "Statement of Account" style invoice
    const tableData = partyTx.map(t => [
      format(t.date, 'dd/MM'),
      t.remark,
      t.type === 'IN' ? formatForPDF(t.amount) : '-',
      t.type === 'OUT' ? formatForPDF(t.amount) : '-'
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Description', 'Paid (In)', 'Billed (Out)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66] }
    });

    // Totals
    const totalIn = partyTx.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
    const totalOut = partyTx.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIn - totalOut; // Simple Cashbook balance
    // If Customer: Balance > 0 means they paid more? No.
    // Usually Customer Balance = Sales (Debit) - Receipts (Credit).
    // In CashBook: IN = Receipt. OUT = Expense.
    // If we treat "OUT" as "Money OUT of pocket" -> We gave loan?
    // If we treat "IN" as "Money IN to pocket" -> We received payment.

    // Let's just show Net Balance
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.text(`Total Paid: ${formatForPDF(totalIn)}`, 14, finalY);
    doc.text(`Total Billed: ${formatForPDF(totalOut)}`, 14, finalY + 7);

    // Tax Logic
    const tax = (totalOut * parseFloat(taxRate)) / 100;
    doc.text(`Tax (${taxRate}%): ${formatForPDF(tax)}`, 14, finalY + 14);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Net Due: ${formatForPDF(Math.abs(balance) + tax)}`, 14, finalY + 25);

    doc.save(`Invoice_${party.name}.pdf`);
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
              <p className="text-sm text-slate-500 mt-1 px-4">Download a detailed list of all your income and expenses.</p>
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

        {/* New Invoice Generator */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors"></div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 w-full">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Receipt size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tax Invoice</h3>
              <p className="text-sm text-slate-500 mt-1">Generate a formal invoice for a specific party.</p>
            </div>

            <div className="w-full space-y-2 mt-2">
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Party</option>
                {parties?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">VAT %</span>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={generateInvoice}
              disabled={!selectedPartyId}
              className="w-full mt-2 bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center justify-center space-x-2">
              <Printer size={18} />
              <span>Generate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
