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
            name: "وظائف", icon: <Briefcase size={16} className="text-blue-500" />,
            items: [
                { title: "مطور React Senior", price: "15000 ر.س", time: "2س", featured: true },
                { title: "مصمم UX/UI", price: "12000 ر.س", time: "4س", featured: false }
            ]
        },
        {
            name: "عقارات", icon: <Home size={16} className="text-green-500" />,
            items: [
                { title: "شقة فاخرة - 4 غرف", price: "2800000 ر.س", time: "5د", featured: true },
                { title: "فيلا مستقلة - 6 غرف", price: "5200000 ر.س", time: "1أ", featured: false }
            ]
        },
        {
            name: "سيارات", icon: <Car size={16} className="text-red-500" />,
            items: [
                { title: "تويوتا كامري 2024", price: "145000 ر.س", time: "1أ", featured: true },
                { title: "مرسيدس GLC 2023", price: "320000 ر.س", time: "2أ", featured: false }
            ]
        },
        {
            name: "سلع", icon: <ShoppingBag size={16} className="text-purple-500" />,
            items: [
                { title: "آيفون 15 برو ماكس", price: "5200 ر.س", time: "3س", featured: true },
                { title: "لابتوب ماك بوك برو", price: "8500 ر.س", time: "1أ", featured: false }
            ]
        },
        {
            name: "خدمات", icon: <Wrench size={16} className="text-orange-500" />,
            items: [
                { title: "تصميم موقع إلكتروني", price: "2500 ر.س", time: "1أ", featured: true },
                { title: "تنظيف منزل شامل", price: "150 ر.س", time: "2س", featured: false }
            ]
        },
        {
            name: "أكاديمي", icon: <Layers size={16} className="text-indigo-500" />,
            items: [
                { title: "دروس خصوصي رياضيات", price: "80 ر.س/س", time: "1أ", featured: true },
                { title: "دروس إنجليزي محادثة", price: "100 ر.س/س", time: "3أ", featured: false }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Modern Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ff6700" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                {/* Navigation Bar */}
                <nav className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        ساحة
                    </h1>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">
                            تسجيل الدخول
                        </Link>
                        <Link href="/post-ad" className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105">
                            أضف إعلانك
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="text-center">
                    <h2 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
                        ساحة
                    </h2>
                    <p className="text-2xl md:text-3xl text-gray-600 font-medium mb-12 max-w-4xl mx-auto leading-relaxed">
                        منصة الإعلانات الرائدة في الشرق الأوسط - نوفر لك تجربة فريدة في بيع وشراء كل ما تحتاجه
                    </p>

                    {/* Advanced Search Bar */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                            <div className="relative bg-white rounded-3xl shadow-2xl shadow-primary/10 border border-white/50 backdrop-blur-sm overflow-hidden">
                                <div className="flex items-center p-2">
                                    <div className="flex-1 flex items-center px-6 py-4">
                                        <Search size={24} className="text-primary ml-4" />
                                        <input
                                            type="text"
                                            placeholder="ما الذي تبحث عنه اليوم؟ (وظائف، عقارات، سيارات...)"
                                            className="flex-1 text-xl placeholder:text-gray-400 text-gray-900 bg-transparent outline-none"
                                        />
                                    </div>
                                    <button className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 mr-2">
                                        ابحث الآن
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="text-5xl font-black text-primary mb-3">500K+</div>
                            <div className="text-lg text-gray-600 font-semibold">إعلان نشط</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="text-5xl font-black text-secondary mb-3">2M+</div>
                            <div className="text-lg text-gray-600 font-semibold">مستخدم نشط</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="text-5xl font-black text-green-500 mb-3">50K+</div>
                            <div className="text-lg text-gray-600 font-semibold">صفقة يومية</div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                            <div className="text-5xl font-black text-purple-500 mb-3">99.9%</div>
                            <div className="text-lg text-gray-600 font-semibold">رضا العملاء</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Categories Section */ }
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
            <h3 className="text-5xl font-black text-gray-900 mb-6">استكشف الفئات</h3>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                نوفر لك تشكيلة واسعة من الفئات لتلبية جميع احتياجاتك في البيع والشراء
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
                <div key={index} className="group cursor-pointer">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200 hover:border-primary/30 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                                {category.icon}
                            </div>
                            <ChevronLeft size={24} className="text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                        </div>

                        <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
                            {category.name}
                        </h4>

                        <div className="space-y-4">
                            {category.items.slice(0, 2).map((item, i) => (
                                <div key={i} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 border border-gray-100 group/item">
                                    <div className="flex justify-between items-start mb-3">
                                        <h5 className="font-bold text-gray-900 group-hover/item:text-primary transition-colors line-clamp-1 text-lg">
                                            {item.title}
                                        </h5>
                                        {item.featured && (
                                            <span className="bg-gradient-to-r from-primary to-secondary text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
                                                مميز
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black text-primary">{item.price}</span>
                                        <span className="text-sm text-gray-500 font-medium">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-8 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-primary hover:to-secondary text-gray-700 hover:text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-105">
                            عرض جميع الإعلانات
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>

    {/* CTA Section */ }
    <div className="bg-gradient-to-r from-primary via-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center text-white">
                <h4 className="text-5xl font-black mb-6">ابدأ رحلتك مع ساحة اليوم!</h4>
                <p className="text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed">
                    انضم لآلاف المستخدمين الذين يثقون بنا في بيع وشراء احتياجاتهم اليومية
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/post-ad" className="bg-white text-primary px-10 py-5 rounded-3xl font-bold text-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl">
                        أضف إعلانك مجاناً
                    </Link>
                    <Link href="/login" className="border-2 border-white text-white px-10 py-5 rounded-3xl font-bold text-xl hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105 shadow-xl">
                        تسجيل الدخول
                    </Link>
                </div>
            </div>
        </div>
    </div>
        </div >
    );
}
