"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    MapPin,
    Briefcase,
    Home,
    ShoppingBag,
    Car,
    Wrench,
    TrendingUp,
    PlusSquare,
    PlusCircle,
    ChevronLeft,
    Image as ImageIcon,
    Layers,
    Clock,
    QrCode,
    Zap,
    Search
} from 'lucide-react';

const CategoryCard = ({ section }: { section: any }) => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % section.items.length);
                setFade(true);
            }, 700);
        }, 5000);
        return () => clearInterval(interval);
    }, [section.items.length]);

    const tickerItem = section.items[index];

    return (
        <div className="bg-white/40 backdrop-blur-md border border-white rounded-xl overflow-hidden shadow-xl shadow-black/[0.01] card-hover flex flex-col group/card hover:border-primary/30 transition-colors h-[240px]">
            <div className="bg-white/60 p-1.5 text-secondary text-[11px] font-[900] border-b border-white flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">{section.icon} {section.nameAr}</span>
            </div>

            <div className="divide-y divide-gray-50/50 overflow-hidden flex-1">
                {section.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="py-2 px-2 border-b border-white/60 last:border-0 hover:bg-white/60 cursor-pointer flex flex-col gap-0.5 leading-tight group transition-all">
                        <h4 className="text-[10px] font-bold text-secondary/90 line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                        </h4>
                        <div className="flex justify-between items-center text-[8px] text-gray-400 font-medium select-none">
                            <span className="flex items-center gap-1"><Clock size={8} /> 10د</span>
                            <span className="text-primary font-black bg-primary/5 px-1 rounded">{item.price}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-transparent border-t border-b border-gray-100 group/spotlight relative h-[85px] overflow-hidden shrink-0">
                <div className={`absolute inset-0 p-2 flex gap-2 animate-card-switch group cursor-pointer hover:bg-white/40 transition-colors`}>
                    <div className="w-[65px] h-full bg-white rounded-md shrink-0 flex items-center justify-center relative overflow-hidden border border-white shadow-sm">
                        <ImageIcon size={16} className="text-gray-300" />
                        <div className="absolute top-0 right-0 bg-primary/90 text-white text-[7px] font-black px-1 py-0 rounded-bl-md shadow-sm">مميز</div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex flex-col gap-0.5">
                            <h4 className="text-[10px] font-[900] text-secondary line-clamp-2 leading-[1.2] group-hover/spotlight:text-primary transition-colors">
                                {tickerItem?.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[8px] text-gray-400 font-medium select-none">
                                <span className="flex items-center gap-0.5"><MapPin size={8} /> الرياض</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-primary">{tickerItem?.price}</span>
                            <span className="text-[8px] font-bold bg-white border border-gray-100 px-1.5 py-0 rounded shadow-sm hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">التفاصيل</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-1 bg-white/30 text-center border-t border-white/50 shrink-0">
                <a href="#" className="text-[8px] font-extrabold text-gray-400 hover:text-primary uppercase tracking-widest transition-all">عرض الكل</a>
            </div>
        </div>
    );
};

export default function HomePage() {
    const categories = [
        {
            name: "وظائف", icon: <Briefcase size={14} />, items: [
                { title: "مطلوب مطور React", price: "5000 ر.س" },
                { title: "مصمم جرافيك", price: "4000 ر.س" },
                { title: "محاسب", price: "3500 ر.س" }
            ]
        },
        {
            name: "عقارات", icon: <Home size={14} />, items: [
                { title: "شقة 3 غرف للإيجار", price: "15000 ر.س" },
                { title: "فيلا للبيع", price: "1200000 ر.س" },
                { title: "مكتب تجاري", price: "80000 ر.س" }
            ]
        },
        {
            name: "سيارات", icon: <Car size={14} />, items: [
                { title: "تويوتا كامري 2020", price: "90000 ر.س" },
                { title: "هوندا سيفيك", price: "75000 ر.س" },
                { title: "مرسيدس بنز", price: "200000 ر.س" }
            ]
        },
        {
            name: "سلع", icon: <ShoppingBag size={14} />, items: [
                { title: "آيفون 15 برو", price: "4500 ر.س" },
                { title: "لابتوب ديل", price: "3500 ر.س" },
                { title: "ثلاجة سامسونج", price: "2500 ر.س" }
            ]
        },
        {
            name: "خدمات", icon: <Wrench size={14} />, items: [
                { title: "تصليح تكييف", price: "200 ر.س" },
                { title: "تنظيف منزل", price: "150 ر.س" },
                { title: "برمجة تطبيق", price: "5000 ر.س" }
            ]
        },
        {
            name: "أخرى", icon: <Layers size={14} />, items: [
                { title: "دراجة هوائية", price: "800 ر.س" },
                { title: "كتب مدرسية", price: "100 ر.س" },
                { title: "أثاث مكتبي", price: "1500 ر.س" }
            ]
        }
    ];

    return (
        <div className="mesh-bg min-h-screen text-[#1c1e21] selection:bg-primary/20 antialiased">
            {/* TOP TICKER */}
            <div className="glass border-b border-gray-200/50 py-1 overflow-hidden shrink-0 z-50">
                <div className="animate-marquee-slow whitespace-nowrap flex gap-32 items-center">
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-yellow-400/90 text-black px-1.5 rounded-sm text-[8px] font-black italic">إعلان ممول</span>
                        استأجر مكتبك بـ 500 ريال فقط في قلب العاصمة - احجز عبر ساحة | <Link href="#" className="underline text-secondary">التفاصيل</Link>
                    </p>
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-primary text-white px-1.5 py-0.5 rounded-sm text-[8px] font-black italic">ساحة بيزنس</span>
                        باقات مخصصة للمنشآت الصغيرة والمتوسطة بخصم 40% | <Link href="#" className="underline text-primary">اشترك هنا</Link>
                    </p>
                </div>
            </div>

            {/* Top Bar Navigation */}
            <div className="py-1 text-[10px] font-bold text-gray-400 shrink-0">
                <div className="w-full px-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2 text-primary"><span className="cursor-pointer">العربية</span></div>
                        <span className="text-gray-200 font-light">|</span>
                        <span className="hover:text-primary transition-colors cursor-pointer">المساعدة</span>
                        <span className="text-primary/80 italic font-black cursor-pointer hover:underline">أعلن معنا</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="flex items-center gap-1.5"><MapPin size={10} className="text-primary" /> الرياض</span>
                        <Link href="/login" className="text-secondary font-black hover:text-primary transition-all">دخول العميل</Link>
                    </div>
                </div>
            </div>

            <main className="w-full h-full flex flex-col overflow-hidden px-2 pb-2">
                {/* Header with Search */}
                <header className="flex justify-between items-center glass p-2 px-4 rounded-xl mb-2 shadow-xl shadow-black/[0.02] shrink-0 gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <h1 className="text-3xl font-[900] text-primary tracking-tighter italic transition-all group-hover:scale-[1.02]">ساحة</h1>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="flex-1 max-w-2xl relative group">
                        <input type="text" placeholder="ابحث عن وظائف، عقارات، سيارات..."
                            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pr-10 pl-4 text-[11px] font-bold text-secondary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 group-hover:bg-white group-hover:shadow-md outline-none" />
                        <Search className="w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/post-ad" className="bg-primary hover:bg-[#e65c00] text-white px-5 py-2 font-black text-[10px] rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2 whitespace-nowrap">
                            <PlusCircle size={14} /> أضف إعلانك
                        </Link>
                    </div>
                </header>

                {/* PORTAL LAYOUT */}
                <div className="grid grid-cols-12 gap-2 h-full overflow-hidden pb-1">
                    {/* RIGHT SIDEBAR */}
                    <aside className="col-span-12 md:col-span-2 space-y-2 h-full overflow-y-auto pr-1">
                        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-secondary p-1.5 text-white text-[9px] font-extrabold text-center uppercase tracking-[0.1em] leading-none">بوابة الأقسام</div>
                            <div className="flex flex-col">
                                {categories.map((cat, i) => (
                                    <Link key={i} href="#" className="px-3 py-2 border-b border-white/50 last:border-0 hover:bg-gray-100/50 cursor-pointer flex justify-between items-center group transition-colors">
                                        <span className="text-[11px] font-[700] text-secondary/80 group-hover:text-primary">{cat.name}</span>
                                        <ChevronLeft size={12} className="text-gray-300 group-hover:text-primary transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-md border border-white p-2.5 rounded-xl shadow-sm">
                            <h3 className="text-[10px] font-[900] border-r-3 border-primary pr-2 mb-2 leading-none text-secondary">تصفية ذكية</h3>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" /> موثوق
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" /> عاجل
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* CENTER FEED */}
                    <section className="col-span-12 md:col-span-8 flex flex-col gap-2 h-full overflow-y-auto scrollbar-hide px-1">
                        <div className="flex items-center gap-2 px-1 leading-none shrink-0 py-1">
                            <Zap size={12} className="text-primary" />
                            <h2 className="text-[12px] font-[900] text-secondary border-r-3 border-primary pr-2 italic">أحدث العروض الحصرية</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 pb-14">
                            {categories.map((section, idx) => (
                                <CategoryCard key={idx} section={section} />
                            ))}
                        </div>
                    </section>

                    {/* LEFT SIDEBAR */}
                    <aside className="col-span-12 md:col-span-2 space-y-2 h-full overflow-y-auto pl-1">
                        <div className="bg-white/60 backdrop-blur-md border border-white p-2.5 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-[900] flex items-center gap-1.5 text-secondary leading-none"><Zap size={12} className="text-primary" /> مختارة</h3>
                                <span className="text-[7px] font-black bg-primary text-white px-1 py-0.5 rounded-sm">VIP</span>
                            </div>
                            <div className="space-y-1">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex gap-2 items-center group cursor-pointer border-b border-white/50 last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0 hover:bg-white rounded-lg transition-all">
                                        <div className="w-10 h-10 bg-gray-50 rounded shrink-0 border border-white flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <ImageIcon size={12} className="text-gray-200" />
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <h4 className="text-[9px] font-bold group-hover:text-primary transition-colors line-clamp-1">فرصة استثنائية</h4>
                                            <span className="text-[9px] text-primary font-black mt-0.5">2.5M <span className="text-[7px] opacity-60">ر.س</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SAHA BIZ WIDGET */}
                        <div className="bg-gradient-to-br from-[#1c1e21] via-[#2a2d32] to-black p-3 rounded-xl text-white relative overflow-hidden group shadow-md transition-all hover:scale-[1.01] h-[100px] flex flex-col justify-center">
                            <div className="relative z-10 flex flex-col gap-1">
                                <h4 className="font-black text-lg italic tracking-tighter leading-none text-primary">ساحة BIZ</h4>
                                <p className="text-[8px] font-bold opacity-70 leading-relaxed">حلول أعمال متكاملة.</p>
                                <button className="mt-1.5 bg-primary w-fit px-3 py-1 text-[8px] font-black rounded hover:bg-white hover:text-black transition-all">اشترك</button>
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
                        </div>

                        {/* App Download */}
                        <div className="bg-white/60 backdrop-blur-md border border-white p-2.5 rounded-lg flex items-center justify-between shadow-sm group hover:border-primary/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded shadow-inner flex items-center justify-center shrink-0">
                                    <QrCode size={14} className="text-secondary" />
                                </div>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[11px] font-black">تطبيق ساحة</span>
                                    <span className="text-[9px] font-bold text-gray-400 mt-0.5">موبايل</span>
                                </div>
                            </div>
                            <ChevronLeft size={12} className="text-gray-200 group-hover:text-primary transition-all" />
                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Nav Spacer */}
            <div className="h-20 lg:hidden"></div>
        </div>
    );
}
