"use client";

import Link from 'next/link';
import {
    Search,
    MapPin,
    Briefcase,
    Home,
    ShoppingBag,
    Car,
    Wrench,
    TrendingUp,
    UserCircle2,
    Bell,
    PlusSquare,
    ChevronLeft,
    ChevronRight,
    Filter,
    CheckCircle2,
    Image as ImageIcon,
    Flame
} from 'lucide-react';
import React from 'react';
import AdvancedFilter from '@/components/AdvancedFilter';

export default function HomePage() {
    const categories = [
        { name: "Jobs & Careers", nameAr: "وظائف وشغور", icon: <Briefcase size={16} />, hot: true },
        { name: "Real Estate", nameAr: "عقارات وأملاك", icon: <Home size={16} /> },
        { name: "Cars & Vehicles", nameAr: "سيارات ومحركات", icon: <Car size={16} /> },
        { name: "Electronics", nameAr: "إلكترونيات", icon: <ShoppingBag size={16} />, hot: true },
        { name: "Services", nameAr: "خدمات عامة", icon: <Wrench size={16} /> },
        { name: "Furniture", nameAr: "أثاث ومنزل", icon: <Home size={16} /> },
        { name: "Education", nameAr: "تدريب وتعليم", icon: <Wrench size={16} /> },
    ];

    const ads = Array(12).fill(null).map((_, i) => ({
        id: i,
        title: i % 2 === 0 ? "Frontend Developer - Next.js" : "3-BR Apartment with Garden",
        titleAr: i % 2 === 0 ? "مطلوب مبرمج واجهات - Next.js" : "شقة 3 غرف مع حديقة خاصة",
        category: i % 2 === 0 ? "Jobs" : "Real Estate",
        price: i % 2 === 0 ? "18,000 SAR" : "850,000 SAR",
        time: "منذ دقيقتين",
        location: "حي النخيل، الرياض",
        verified: i % 3 === 0,
        urgent: i % 4 === 0,
        image: i % 2 === 0 ? "job" : "house"
    }));

    return (
        <div className="bg-[#f2f4f7] dark:bg-slate-950 min-h-screen">
            {/* Top Thin Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 py-1.5 text-[11px] text-gray-500">
                <div className="max-w-[1240px] mx-auto px-4 flex justify-between items-center">
                    <div className="flex gap-4">
                        <Link href="/" className="hover:text-primary">مساعدة</Link>
                        <Link href="/" className="hover:text-primary">أعلن معنا</Link>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1"><MapPin size={10} /> الرياض</span>
                        <Link href="/" className="text-primary font-bold">تسجيل الدخول / إنشاء حساب</Link>
                    </div>
                </div>
            </div>

            <main className="max-w-[1240px] mx-auto w-full px-2 sm:px-4 py-4 flex flex-col gap-4">

                {/* Header Logic: Logo & Action */}
                <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col leading-none">
                            <h1 className="text-3xl font-black text-primary tracking-tighter">SAHA</h1>
                            <span className="text-xs font-bold text-secondary dark:text-gray-400 tracking-[0.2em] mt-1 pr-1">S A H A . C O M</span>
                        </div>
                        <div className="hidden lg:flex gap-6 mt-2">
                            {["العقارات", "الوظائف", "السيارات", "الخدمات"].map(nav => (
                                <Link key={nav} href="/" className="text-sm font-bold hover:text-primary transition-colors">{nav}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end text-[11px] text-gray-400 mr-2 border-r pr-4">
                            <span>مركز الاتصال</span>
                            <span className="text-secondary dark:text-gray-200 font-bold">800-123-4567</span>
                        </div>
                        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 font-bold text-sm rounded-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95">
                            <PlusSquare size={18} />
                            <span>أضف إعلانك مجاناً</span>
                        </button>
                    </div>
                </header>

                {/* The Advanced Filter System */}
                <AdvancedFilter />

                {/* Content Layout */}
                <div className="grid grid-cols-12 gap-4">

                    {/* Left: Enhanced Sidebar */}
                    <aside className="col-span-12 md:col-span-2 flex flex-col gap-3">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-sm overflow-hidden">
                            <div className="bg-primary p-2 text-white text-xs font-bold flex justify-between items-center">
                                <span>تصفح حسب الفئة</span>
                                <ChevronLeft size={14} />
                            </div>
                            {categories.map((cat, idx) => (
                                <div key={idx} className="group flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-primary group-hover:scale-110 transition-transform">
                                            {cat.icon}
                                        </span>
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{cat.nameAr}</span>
                                    </div>
                                    {cat.hot && <Flame size={12} className="text-red-500 fill-red-500 animate-pulse" />}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-3 rounded-sm">
                            <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase">آخر عمليات البحث</h4>
                            <div className="flex flex-wrap gap-1">
                                {["شقق إيجار", "وظائف مبرمجين", "تويوتا كراون"].map(s => (
                                    <span key={s} className="bg-gray-100 dark:bg-slate-800 text-[10px] px-2 py-1 rounded-sm text-gray-500 cursor-pointer hover:bg-primary/10 hover:text-primary">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Center: Feed */}
                    <section className="col-span-12 md:col-span-7 flex flex-col gap-3">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-1 flex items-center justify-between">
                            <div className="flex">
                                {["الكل", "موثوق فقط", "عاجل"].map((tab, i) => (
                                    <button key={tab} className={`px-5 py-2 text-[13px] font-bold ${i === 0 ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="hidden sm:flex items-center px-3 gap-2 text-[11px] text-gray-400">
                                <span>عرض حسب:</span>
                                <button className="p-1 border bg-gray-50 dark:bg-slate-800"><Filter size={12} /></button>
                            </div>
                        </div>

                        {/* Ads Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ads.map((ad) => (
                                <div key={ad.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-1 group hover:border-primary transition-all shadow-sm">
                                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                            {ad.image === 'job' ? <Briefcase size={40} /> : <Home size={40} />}
                                        </div>
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {ad.verified && <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1 shadow-md"><CheckCircle2 size={10} /> موثوق</span>}
                                            {ad.urgent && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold shadow-md">عاجل</span>}
                                        </div>
                                        <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] opacity-90">{ad.category}</span>
                                                <div className="flex items-center gap-1 text-[10px]"><ImageIcon size={10} /> 4</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <h3 className="text-[13px] font-bold line-clamp-1 mb-1 group-hover:text-primary transition-colors">{ad.titleAr}</h3>
                                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                                            <MapPin size={10} />
                                            <span>{ad.location}</span>
                                            <span className="text-gray-200">|</span>
                                            <span>{ad.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-2">
                                            <span className="text-sm font-black text-primary">{ad.price}</span>
                                            <button className="text-[10px] font-bold text-blue-500 hover:underline">دردشة الآن</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Right: Widgets */}
                    <aside className="col-span-12 md:col-span-3 flex flex-col gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-4 rounded-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp size={18} className="text-primary" />
                                <h3 className="text-sm font-bold">إعلانات مميزة</h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-2 group cursor-pointer border-b border-gray-50 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                                        <div className="w-16 h-12 bg-gray-50 dark:bg-slate-800 shrink-0 rounded-sm"></div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[12px] font-bold line-clamp-1 group-hover:text-primary">مطلوب مدير مشروع تقني</span>
                                            <span className="text-[11px] text-primary font-bold">25,000 ريال</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-[11px] text-gray-400 font-bold hover:text-primary py-2 border border-dashed rounded-sm">شاهد المزيد</button>
                        </div>

                        {/* Ad Space */}
                        <div className="bg-gradient-to-br from-secondary to-black p-5 rounded-sm text-white overflow-hidden relative group">
                            <h4 className="font-black text-xl leading-tight">وسّع تجارتك<br />مع "ساحة"</h4>
                            <p className="text-[11px] mt-2 opacity-70">باقات التجار تبدأ من 199 ريال/شهر</p>
                            <button className="mt-4 bg-primary px-4 py-2 text-xs font-bold rounded-sm hover:scale-105 transition-transform">اطلب الآن</button>
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                        </div>

                        {/* App Download Info */}
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center font-bold text-[10px] shrink-0 border border-gray-200">QR</div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold">حمل تطبيق ساحة</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">تجربة أسرع على آيفون وأندرويد</span>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            {/* Mobile Footer Spacing */}
            <div className="h-20 lg:hidden"></div>
        </div>
    );
}
