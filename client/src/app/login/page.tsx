"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguage } from '@/lib/language-context';
import { supabase } from '@/lib/supabase';
import { User, Mail, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import DepthInput from '@/components/ui/DepthInput';
import { Logo } from '@/components/Logo';

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

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) console.error(error);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-bg via-primary/5 to-primary/10 transition-colors duration-300">
            <div className="w-full max-w-[420px] space-y-4">
                {/* Branding Accent */}
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="flex flex-col group items-center w-fit mx-auto">
                        <span className="text-4xl font-black tracking-tighter text-primary italic transition-transform group-hover:scale-105 leading-none whitespace-nowrap">{t('siteName')}</span>
                        <Logo 
                            className="w-[90%] h-8 text-primary transition-transform group-hover:scale-110 -mt-3 overflow-visible" 
                            preserveAspectRatio="none" 
                            viewBox="20 0 60 80"
                            vectorEffect="non-scaling-stroke"
                            strokeWidth="3.5"
                        />
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bento-card !p-10 shadow-premium bg-white border-none">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">{isLogin ? t('login') : t('register')}</h2>
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

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black tracking-widest uppercase">
                                <span className="px-2 bg-white text-text-muted">
                                    {language === 'ar' ? 'أو' : 'OR'}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 text-[15px] rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            {isLogin 
                                ? (language === 'ar' ? 'دخول عبر Google' : 'Login with Google') 
                                : (language === 'ar' ? 'تسجيل عبر Google' : 'Register with Google')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2"
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
