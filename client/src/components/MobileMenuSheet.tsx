import { 
    X, 
    User, 
    LogOut, 
    LogIn, 
    Globe, 
    Moon, 
    Sun, 
    MapPin, 
    LayoutDashboard, 
    Heart, 
    FileText,
    ChevronRight,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLanguage } from "@/lib/language-context";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MobileMenuSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenuSheet({ isOpen, onClose }: MobileMenuSheetProps) {
    const { user, logout } = useAuthStore();
    const { t, language, setLanguage, theme, toggleTheme, country, setCountry, currency, setCurrency } = useLanguage();
    const router = useRouter();
    const [showCountrySelect, setShowCountrySelect] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        onClose();
        router.push("/login");
    };

    const countries = [
        { code: 'sa', name: t('saudi'), currency: 'SAR' },
        { code: 'ae', name: t('uae'), currency: 'AED' },
        { code: 'kw', name: t('kuwait'), currency: 'KWD' },
        { code: 'qa', name: t('qatar'), currency: 'QAR' },
        { code: 'bh', name: t('bahrain'), currency: 'BHD' },
        { code: 'om', name: t('oman'), currency: 'OMR' },
        { code: 'eg', name: t('egypt'), currency: 'EGP' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] lg:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={18} />
                                </div>
                                <span>{user.name}</span>
                            </>
                        ) : (
                            t('menu')
                        )}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* User Actions */}
                <div className="grid grid-cols-2 gap-3">
                    {user ? (
                        <>
                            <Link 
                                href="/dashboard" 
                                onClick={onClose}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                                <LayoutDashboard size={24} />
                                <span className="text-xs font-medium">{t('dashboard')}</span>
                            </Link>
                            <Link 
                                href="/dashboard/my-ads" 
                                onClick={onClose}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                                <FileText size={24} />
                                <span className="text-xs font-medium">{t('myAds')}</span>
                            </Link>
                        </>
                    ) : (
                        <Link 
                            href="/login" 
                            onClick={onClose}
                            className="col-span-2 flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30"
                        >
                            <LogIn size={20} />
                            <span className="font-bold">{t('login')}</span>
                        </Link>
                    )}
                </div>

                {/* App Settings */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings')}</h3>
                    
                    {/* Theme Toggle */}
                    <button 
                        onClick={() => toggleTheme()}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? <Moon size={20} className="text-purple-500" /> : <Sun size={20} className="text-amber-500" />}
                            <span className="font-medium text-sm">{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-purple-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    {/* Language Toggle */}
                    <button 
                        onClick={() => {
                            setLanguage(language === 'ar' ? 'en' : 'ar');
                            // window.location.reload(); // Often needed for dir change
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Globe size={20} className="text-blue-500" />
                            <span className="font-medium text-sm">{language === 'ar' ? 'English' : 'العربية'}</span>
                        </div>
                        {language === 'ar' ? <ChevronLeft size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </button>

                    {/* Country Selector */}
                    {!showCountrySelect ? (
                        <button 
                            onClick={() => setShowCountrySelect(true)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin size={20} className="text-green-500" />
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-sm">{t(countries.find(c => c.code === country)?.name || 'saudi')}</span>
                                    <span className="text-[10px] text-gray-500">{currency.toUpperCase()}</span>
                                </div>
                            </div>
                            {language === 'ar' ? <ChevronLeft size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                        </button>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-200">
                            {countries.map((c) => (
                                <button
                                    key={c.code}
                                    onClick={() => {
                                        setCountry(c.code);
                                        setCurrency(c.currency.toLowerCase());
                                        setShowCountrySelect(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${country === c.code ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'hover:bg-white/50 dark:hover:bg-white/5'}`}
                                >
                                    <span className="text-sm">{c.name}</span>
                                    {country === c.code && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                {user && (
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-2"
                    >
                        <LogOut size={20} />
                        <span className="font-bold">{t('logout')}</span>
                    </button>
                )}
                
                {/* Spacer for BottomNav */}
                <div className="h-16" />
            </div>
        </div>
    );
}