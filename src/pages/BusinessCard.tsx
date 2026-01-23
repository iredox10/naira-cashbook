import { useRef, useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { db } from '../db/db';
import { ArrowLeft, Save, Share2, Wallet, MapPin, Phone, Mail, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

export function BusinessCard() {
    const { currentBusiness, updateBusiness } = useBusiness();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [email, setEmail] = useState('');
    const [tagline, setTagline] = useState('');
    const [logo, setLogo] = useState<string | null>(null);

    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        if (currentBusiness) {
            setName(currentBusiness.name);
            setPhone(currentBusiness.phone || '');
            setAddress(currentBusiness.address || '');
            setEmail(currentBusiness.email || '');
            setTagline(currentBusiness.tagline || '');
            setLogo(currentBusiness.logo || null);
        }
    }, [currentBusiness]);

    const handleSave = async () => {
        if (!currentBusiness?.id) return;
        await db.businesses.update(currentBusiness.id, {
            name,
            phone,
            address,
            email,
            tagline,
            logo: logo || undefined
        });
        alert("Business Profile Updated!");
    };

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                // Using null to capture transparent corners if any, but our card has bg
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], `business_card_${currentBusiness?.id}.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `${name} - Business Card`,
                        text: `Check out our business!`
                    });
                } else {
                    const link = document.createElement('a');
                    link.download = `business_card_${currentBusiness?.id}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                }
                setIsSharing(false);
            });
        } catch (e) {
            console.error(e);
            setIsSharing(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Editor */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full"><ArrowLeft /></button>
                        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Business Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tagline / Slogan</label>
                            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-slate-700 border-none outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Best Service in Town" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</label>
                                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-slate-700 border-none outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="+234..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-slate-700 border-none outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="hello@..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Address</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-slate-700 border-none outline-none focus:ring-2 focus:ring-blue-500/20" rows={2} placeholder="Shop 1, Main Market..." />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Logo</label>
                            <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
                                <span className="text-slate-400 text-sm flex items-center"><Upload size={16} className="mr-2" /> Upload Logo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-4">
                        <button onClick={handleSave} className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center space-x-2">
                            <Save size={18} /> <span>Save Changes</span>
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Live Preview</h2>

                    {/* The Card */}
                    <div ref={cardRef} className="w-full max-w-md aspect-[1.7/1] rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between text-[#ffffff]" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)' }}>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl" style={{ backgroundColor: '#3b82f6', opacity: 0.1 }}></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full -ml-10 -mb-10 blur-2xl" style={{ backgroundColor: '#10b981', opacity: 0.1 }}></div>

                        {/* Header */}
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-[#ffffff]">{name || 'Your Business'}</h1>
                                <p className="text-[#94a3b8] font-medium mt-1">{tagline || 'Your Tagline Goes Here'}</p>
                            </div>
                            {logo ? (
                                <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl object-cover" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                            ) : (
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                                    <Wallet size={24} />
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="relative z-10 space-y-2 text-sm">
                            {phone && (
                                <div className="flex items-center space-x-3 text-[#e2e8f0]">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><Phone size={14} /></div>
                                    <span className="font-semibold">{phone}</span>
                                </div>
                            )}
                            {email && (
                                <div className="flex items-center space-x-3 text-[#e2e8f0]">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><Mail size={14} /></div>
                                    <span>{email}</span>
                                </div>
                            )}
                            {address && (
                                <div className="flex items-center space-x-3 text-[#e2e8f0]">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><MapPin size={14} /></div>
                                    <span className="opacity-80 line-clamp-2">{address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center space-x-2"
                    >
                        {isSharing ? <Loader2 className="animate-spin" /> : <Share2 />}
                        <span>Share Business Card</span>
                    </button>

                    <p className="text-xs text-slate-400 max-w-xs text-center">
                        Share this professional card with your customers on WhatsApp or Social Media.
                    </p>
                </div>
            </div>
        </div>
    );
}
