"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguage } from '@/lib/language-context';
import { User, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const { login, register, loading, user } = useAuthStore();
    const { language, t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/');
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const normalizedEmail = email.trim().toLowerCase();
        try {
            if (isLogin) {
                await login(normalizedEmail, password);
            } else {
                await register(normalizedEmail, password, name);
            }
            router.push('/');
        } catch (error: any) {
            alert(error.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-bg transition-colors duration-300">
            <div className="w-full max-w-[420px] space-y-4">
                {/* Branding Accent */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col group items-center">
                        <span className="text-4xl font-[1000] tracking-tighter text-black leading-none uppercase -mb-0.5">{t('siteName')}</span>
                        <div className="h-1.5 w-16 bg-primary mt-2 shadow-md group-hover:w-24 transition-all"></div>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="saha-card !p-8 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-xl font-[1000] text-black uppercase tracking-tight">{isLogin ? t('loginTitle') : t('registerTitle')}</h2>
                        <div className="h-0.5 w-10 bg-primary mt-2"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t('name')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('placeholderName')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md font-bold text-[14px] focus:bg-white transition-all shadow-inner"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t('email')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    placeholder={t('placeholderEmail')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md font-bold text-[14px] focus:bg-white transition-all shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t('password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    placeholder={t('placeholderPassword')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md font-bold text-[14px] focus:bg-white transition-all shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-saha-primary !w-full !py-4 !text-[14px] mt-4"
                        >
                            <ShieldCheck size={18} />
                            {loading ? t('processing') : isLogin ? t('btnSubmitLogin') : t('btnSubmitRegister')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-[1000] text-gray-400 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
                            <ChevronRight size={14} className={language === 'ar' ? 'rotate-180' : ''} />
                            <span className="text-secondary">{isLogin ? t('register') : t('login')}</span>
                        </button>

                        <Link href="/" className="text-[10px] font-black text-gray-300 hover:text-secondary transition-colors uppercase tracking-[0.2em]">
                            {t('backToHome')}
                        </Link>
                    </div>
                </div>

                <div className="text-center opacity-30 select-none">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t('siteName')} SYNC 2026</p>
                </div>
            </div>
        </div>
    );
}
