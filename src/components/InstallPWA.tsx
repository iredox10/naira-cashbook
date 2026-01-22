import { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent standard banner
            e.preventDefault();
            // Store event
            setDeferredPrompt(e);
            // Show custom banner
            setShowInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // If already installed or browser doesn't support it, this won't fire

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        setDeferredPrompt(null);
        setShowInstall(false);
    };

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between space-x-4 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Install CashBook App</h3>
                        <p className="text-xs text-slate-400">Access your ledger faster from home screen</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleInstall}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        Install
                    </button>
                    <button
                        onClick={() => setShowInstall(false)}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
