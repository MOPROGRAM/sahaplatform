"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguage } from '@/lib/language-context';
import { User, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import DepthInput from '@/components/ui/DepthInput';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [userType, setUserType] = useState('SEEKER');
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
                await register(normalizedEmail, password, name, userType);
            }
            router.push('/');
        } catch (error: any) {
            alert(error.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-bg via-primary/5 to-primary/10 transition-colors duration-300">
            <div className="w-full max-w-[420px] space-y-4">
                {/* Branding Accent */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col group items-center">
                        <span className="text-4xl font-[1000] tracking-tighter text-primary italic transition-transform group-hover:scale-105">{t('siteName')}</span>
                        <div className="h-1 w-12 bg-primary mt-2 shadow-md group-hover:w-20 transition-all"></div>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bento-card !p-10 shadow-premium bg-white border-none">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-[1000] text-text-main uppercase tracking-tighter">{isLogin ? (language === 'ar' ? 'تسجيل الدخول' : 'Login') : (language === 'ar' ? 'تسجيل حساب' : 'Register')}</h2>
                        <div className="h-1 w-12 bg-primary mt-3 mx-auto rounded-full"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">{t('name')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-text-muted group-focus-within:text-primary transition-colors z-10">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('placeholderName')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bento-input pl-12"
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">{t('email')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-text-muted group-focus-within:text-primary transition-colors z-10">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    placeholder={t('placeholderEmail')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bento-input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-text-muted px-1">{t('password')}</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center text-text-muted group-focus-within:text-primary transition-colors z-10">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    placeholder={t('placeholderPassword')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bento-input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-saha-primary !w-full !py-4 !text-[15px] !rounded-2xl shadow-lg hover:shadow-xl mt-6 transition-all active:scale-[0.98]"
                        >
                            <ShieldCheck size={20} />
                            {loading ? t('processing') : isLogin ? t('btnSubmitLogin') : t('btnSubmitRegister')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-[1000] text-text-muted hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2"
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
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">{t('siteName')} SYNC 2026</p>
                </div>
            </div>
        </div>
    );
}
