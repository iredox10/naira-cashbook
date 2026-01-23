import { forwardRef } from 'react';
import { formatCurrency } from '../lib/format';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

interface ReceiptProps {
    businessName: string;
    transaction: {
        amount: number;
        type: 'IN' | 'OUT';
        date: Date | string;
        remark?: string;
        paymentMode: string;
        partyName?: string;
        balance?: number;
    };
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ businessName, transaction }, ref) => {
    const isIn = transaction.type === 'IN';
    // Use HEX codes for html2canvas compatibility (it fails with oklch/modern color spaces)
    const colorClass = isIn ? 'text-[#059669]' : 'text-[#dc2626]';
    const bgClass = isIn ? 'bg-[#ecfdf5]' : 'bg-[#fef2f2]';
    const borderTopClass = isIn ? 'bg-[#059669]' : 'bg-[#dc2626]';

    return (
        <div ref={ref} className="w-[400px] bg-[#ffffff] p-8 rounded-none text-[#0f172a] font-sans relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Decorative Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-4 ${borderTopClass}`}></div>

            <div className="text-center mb-6 mt-2">
                <h2 className="text-xl font-bold text-[#1e293b] tracking-tight uppercase">{businessName}</h2>
                <p className="text-xs text-[#94a3b8] mt-1">Transaction Receipt</p>
            </div>

            <div className="flex flex-col items-center justify-center py-6 border-b-2 border-dashed border-[#f1f5f9] mb-6">
                <div className="bg-[#ffffff] p-2 rounded-full mb-2">
                    <CheckCircle2 size={32} className={colorClass} />
                </div>
                <h1 className={`text-4xl font-extrabold ${colorClass} tracking-tight`}>
                    {isIn ? '+' : '-'} {formatCurrency(transaction.amount)}
                </h1>
                <p className={`text-sm font-bold uppercase mt-2 px-3 py-1 rounded-full ${bgClass} ${colorClass}`}>
                    {isIn ? 'Payment Received' : 'Payment Paid'}
                </p>
            </div>

            <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[#f8fafc]">
                    <span className="text-[#94a3b8]">Date & Time</span>
                    <span className="font-semibold">{format(new Date(transaction.date), 'dd MMM yyyy, h:mm a')}</span>
                </div>

                {transaction.partyName && (
                    <div className="flex justify-between items-center py-2 border-b border-[#f8fafc]">
                        <span className="text-[#94a3b8]">{isIn ? 'Received From' : 'Paid To'}</span>
                        <span className="font-bold text-lg">{transaction.partyName}</span>
                    </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-[#f8fafc]">
                    <span className="text-[#94a3b8]">Payment Mode</span>
                    <span className="font-medium capitalize">{transaction.paymentMode}</span>
                </div>

                {transaction.remark && (
                    <div className="py-2 border-b border-[#f8fafc]">
                        <span className="text-[#94a3b8] block mb-1">Description</span>
                        <span className="font-medium">{transaction.remark}</span>
                    </div>
                )}

                {transaction.balance !== undefined && (
                    <div className="flex justify-between items-center py-3 mt-2 bg-[#f8fafc] px-3 rounded-lg">
                        <span className="text-[#64748b] font-medium">Party Balance</span>
                        <span className={`font-bold ${transaction.balance > 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                            {formatCurrency(Math.abs(transaction.balance))} {transaction.balance > 0 ? 'Due' : 'Adv'}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-4 border-t border-[#f1f5f9] text-center">
                <p className="text-[10px] text-[#94a3b8] italic">Recorded via CashBook PWA</p>
                <p className="text-[10px] text-[#cbd5e1]">Generated on {format(new Date(), 'dd MMM yyyy')}</p>
            </div>
        </div>
    );
});
