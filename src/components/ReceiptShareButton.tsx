import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Loader2 } from 'lucide-react';
import { Receipt } from './Receipt';
import { useBusiness } from '../context/BusinessContext';

interface ReceiptShareButtonProps {
    transaction: any; // Type accurately if possible
    partyName?: string;
    balance?: number;
    variant?: 'icon' | 'button';
}

export function ReceiptShareButton({ transaction, partyName, balance, variant = 'button' }: ReceiptShareButtonProps) {
    const { currentBusiness } = useBusiness();
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (!receiptRef.current) return;
        setIsSharing(true);

        try {
            // Wait for render
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], `receipt_${transaction.id}.png`, { type: 'image/png' });

                // Web Share API
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Payment Receipt',
                            text: `Here is the receipt for ${transaction.amount} from ${currentBusiness?.name}.`
                        });
                    } catch (err) {
                        console.log('Share cancelled', err);
                    }
                } else {
                    // Fallback to Download
                    const link = document.createElement('a');
                    link.download = `receipt_${transaction.id}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    alert('Receipt downloaded (Sharing not supported on this device/browser)');
                }
                setIsSharing(false);
            }, 'image/png');

        } catch (e) {
            console.error('Failed to generate receipt', e);
            setIsSharing(false);
            alert('Failed to generate receipt');
        }
    };

    return (
        <>
            {/* The Invisible Receipt Container */}
            <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div className="bg-white inline-block">
                    <Receipt
                        ref={receiptRef}
                        businessName={currentBusiness?.name || 'CashBook'}
                        transaction={{
                            ...transaction,
                            partyName: partyName || transaction.partyName,
                            balance
                        }}
                    />
                </div>
            </div>

            {/* The Trigger Button */}
            {variant === 'icon' ? (
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="p-2 hover:bg-slate-100 rounded-full text-emerald-600 transition-colors"
                    title="Share Receipt"
                >
                    {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                </button>
            ) : (
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                    <span>Share Receipt</span>
                </button>
            )}
        </>
    );
}
