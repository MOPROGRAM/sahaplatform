"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const { login, register, loading, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
            router.push('/');
        } catch (error: any) {
            alert(error.message || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md mx-4">
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-[900] text-primary tracking-tighter italic">
                        ساحة
                    </Link>
                    <p className="text-gray-600 mt-2">بوابة الخليج العقارية والمهنية</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${isLogin ? 'bg-white shadow-md text-primary' : 'text-gray-500'
                                }`}
                        >
                            تسجيل الدخول
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${!isLogin ? 'bg-white shadow-md text-primary' : 'text-gray-500'
                                }`}
                        >
                            إنشاء حساب
                        </button>
                    </div>

                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="الاسم الكامل"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white/50"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="البريد الإلكتروني"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white/50"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white/50"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e65c00] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'جارٍ المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-primary hover:underline text-sm">
                        العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
}