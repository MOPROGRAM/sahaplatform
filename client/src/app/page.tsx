"use client";

import { useEffect } from 'react';

export default function HomePage() {
    useEffect(() => {
        // Initialize the live-preview functionality
        if (typeof window !== 'undefined') {
            initLivePreview();
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] selection:bg-primary/20 flex flex-col overflow-hidden" dir="rtl">
            <style jsx global>{`
                :root {
                    --primary: #ff6700;
                    --secondary: #1c1e21;
                }

                body {
                    font-family: -apple-system, "SF Pro Arabic", "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
                    background: #f8fafc;
                    color: #1c1e21;
                    -webkit-font-smoothing: antialiased;
                    font-size: 13px;
                    overflow: hidden;
                    height: 100vh;
                }

                .mesh-bg {
                    background-color: #f8fafc;
                    background-image:
                        radial-gradient(at 0% 0%, rgba(255, 103, 0, 0.04) 0, transparent 40%),
                        radial-gradient(at 100% 0%, rgba(28, 30, 33, 0.02) 0, transparent 40%);
                    background-attachment: fixed;
                }

                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                }

                @keyframes marquee-slow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-marquee-slow {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee-slow 120s linear infinite;
                }

                @keyframes slide-up-soft {
                    0% {
                        opacity: 0;
                        transform: translateY(15px) scale(0.96);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .animate-card-switch {
                    animation: slide-up-soft 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                ::-webkit-scrollbar {
                    width: 3px;
                    height: 3px;
                }

                ::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                }
            `}</style>

            {/* 1. COMPRESSED MARKETING TICKER */}
            <div className="glass border-b border-gray-200/50 py-1 overflow-hidden shrink-0 z-50">
                <div className="animate-marquee-slow flex gap-32 items-center">
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-yellow-400/90 text-black px-1.5 rounded-sm text-[8px] font-black italic">إعلان ممول</span>
                        استأجر مكتبك بـ 500 ريال فقط في قلب العاصمة - احجز عبر ساحة | <a href="#" className="underline text-secondary">التفاصيل</a>
                    </p>
                    <p className="text-[10px] font-bold flex items-center gap-2 text-gray-400">
                        <span className="bg-primary text-white px-1.5 rounded-sm text-[8px] font-black italic">ساحة بيزنس</span>
                        باقات مخصصة للمنشآت الصغيرة والمتوسطة بخصم 40% | <a href="#" className="underline text-primary">اشترك هنا</a>
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
                        <span className="flex items-center gap-1.5">
                            <svg className="w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            الرياض
                        </span>
                        <span className="text-secondary font-black cursor-pointer hover:text-primary transition-all">دخول العميل</span>
                    </div>
                </div>
            </div>

            <main className="w-full h-full flex flex-col overflow-hidden px-2 pb-2">
                {/* Header with Search */}
                <header className="flex justify-between items-center glass p-2 px-4 rounded-xl mb-2 shadow-xl shadow-black/[0.02] shrink-0 gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-baseline gap-1.5 group cursor-pointer">
                            <h1 className="text-3xl font-[900] text-primary tracking-tighter italic transition-all group-hover:scale-[1.02]">
                                ساحة
                            </h1>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="flex-1 max-w-2xl relative group">
                        <input
                            type="text"
                            placeholder="ابحث عن وظائف، عقارات، سيارات..."
                            className="w-full bg-gray-100 border-none rounded-xl py-2.5 pr-10 pl-4 text-[11px] font-bold text-secondary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400 group-hover:bg-white group-hover:shadow-md outline-none"
                        />
                        <svg className="w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="bg-primary text-white px-5 py-2 font-black text-[10px] rounded-lg shadow-lg shadow-primary/20 hover:bg-[#e65c00] transition-all flex items-center gap-2 whitespace-nowrap">
                            <svg className="w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            أضف إعلانك
                        </button>
                    </div>
                </header>

                {/* PORTAL LAYOUT: 2-8-2 Balanced */}
                <div className="grid grid-cols-12 gap-2 h-full overflow-hidden pb-1">

                    {/* RIGHT SIDEBAR (2 COLUMNS) - بوابة الأقسام */}
                    <aside className="col-span-12 md:col-span-2 space-y-2 h-full overflow-y-auto pr-1">
                        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-secondary p-1.5 text-white text-[9px] font-extrabold text-center uppercase tracking-[0.1em] leading-none">
                                بوابة الأقسام
                            </div>
                            <div id="side-nav" className="flex flex-col">
                                {/* Categories will be populated by JavaScript */}
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md border border-white p-2.5 rounded-xl shadow-sm">
                            <h3 className="text-[10px] font-[900] border-r-3 border-primary pr-2 mb-2 leading-none text-secondary">
                                تصفية ذكية
                            </h3>
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" />
                                    موثوق
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer group hover:text-primary transition-colors">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary" />
                                    عاجل
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* CENTER FEED (8 COLUMNS) - الأحدث العروض الحصرية */}
                    <section className="col-span-12 md:col-span-8 flex flex-col gap-2 h-full overflow-y-auto scrollbar-hide px-1">
                        <div className="flex items-center gap-2 px-1 leading-none shrink-0 py-1">
                            <svg className="w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <h2 className="text-[12px] font-[900] text-secondary border-r-3 border-primary pr-2 italic">
                                أحدث العروض الحصرية
                            </h2>
                        </div>
                        <div id="cat-6-grid" className="grid grid-cols-2 lg:grid-cols-3 gap-2 pb-14">
                            {/* Cards will be populated by JavaScript */}
                        </div>
                    </section>

                    {/* LEFT SIDEBAR (2 COLUMNS) - مختارة */}
                    <aside className="col-span-12 md:col-span-2 space-y-2 h-full overflow-y-auto pl-1">
                        <div className="bg-white/60 backdrop-blur-md border border-white rounded-xl p-2.5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-[900] flex items-center gap-1.5 text-secondary leading-none">
                                    <svg className="w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    مختارة
                                </h3>
                                <span className="text-[7px] font-black bg-primary text-white px-1 py-0.5 rounded-sm">VIP</span>
                            </div>
                            <div id="featured-ads" className="space-y-1">
                                {/* Featured ads will be populated by JavaScript */}
                            </div>
                        </div>

                        {/* ساحة BIZ Widget */}
                        <div className="bg-gradient-to-br from-[#1c1e21] via-[#2a2d32] to-black p-3 rounded-xl text-white relative overflow-hidden group shadow-md transition-all hover:scale-[1.01] h-[100px] flex flex-col justify-center">
                            <div className="relative z-10 flex flex-col gap-1">
                                <h4 className="font-black text-lg italic tracking-tighter leading-none text-primary">
                                    ساحة BIZ
                                </h4>
                                <p className="text-[8px] font-bold opacity-70 leading-relaxed">
                                    حلول أعمال متكاملة.
                                </p>
                                <button className="mt-1.5 bg-primary w-fit px-3 py-1 text-[8px] font-black rounded hover:bg-white hover:text-black transition-all">
                                    اشترك
                                </button>
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

// Live preview initialization function
function initLivePreview() {
    if (typeof window === 'undefined') return;

    const cats = [
        { n: "وظائف", i: "briefcase" },
        { n: "عقارات", i: "home" },
        { n: "سيارات", i: "car" },
        { n: "سلع", i: "shopping-bag" },
        { n: "خدمات", i: "wrench" },
        { n: "اخرى", i: "layers" }
    ];

    function getAdsFor(cat: string) {
        return [
            { t: `مطلوب ${cat} عاجل جداً`, p: "للتفاوض" },
            { t: `فرصة ${cat} مميزة`, p: "500 ر.س" },
            { t: `خدمات ${cat} شاملة`, p: "120 ر.س" },
            { t: `عرض ${cat} حصري`, p: "2500 ر.س" },
            { t: `شقة فاخرة للإيجار`, p: "50000 ر.س" }
        ];
    }

    function init() {
        const sideNav = document.getElementById('side-nav');
        const grid = document.getElementById('cat-6-grid');
        const feat = document.getElementById('featured-ads');

        if (!sideNav || !grid || !feat) return;

        cats.forEach((c, idx) => {
            // Add to sidebar navigation
            const navItem = document.createElement('div');
            navItem.className = "px-3 py-2 border-b border-white/50 last:border-0 hover:bg-gray-100/50 cursor-pointer flex justify-between items-center group transition-colors";
            navItem.innerHTML = `
                <span class="text-[11px] font-[700] text-secondary/80 group-hover:text-primary">${c.n}</span>
                <svg class="w-3 text-gray-300 group-hover:text-primary transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            `;
            sideNav.appendChild(navItem);

            // Create category card
            let adItems = '';
            for (let i = 1; i <= 3; i++) {
                adItems += `
                    <div class="py-2 px-2 border-b border-white/60 last:border-0 hover:bg-white/60 cursor-pointer flex flex-col gap-0.5 leading-tight group transition-all">
                        <h4 class="text-[10px] font-bold text-secondary/90 line-clamp-1 group-hover:text-primary transition-colors">${c.n} جديد # ${i}</h4>
                        <div class="flex justify-between items-center text-[8px] text-gray-400 font-medium select-none">
                            <span class="flex items-center gap-1">
                                <svg class="w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12,6 12,12 16,14" />
                                </svg>
                                10د
                            </span>
                            <span class="text-primary font-black bg-primary/5 px-1 rounded">1,200 ر.س</span>
                        </div>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = "bg-white/40 backdrop-blur-md border border-white rounded-xl overflow-hidden shadow-xl shadow-black/[0.01] card-hover flex flex-col group/card hover:border-primary/30 transition-colors h-[240px]";
            card.innerHTML = `
                <div class="bg-white/60 p-1.5 text-secondary text-[11px] font-[900] border-b border-white flex items-center justify-between shrink-0">
                    <span class="flex items-center gap-1.5">
                        <svg class="w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${getIconPath(c.i)}
                        </svg>
                        ${c.n}
                    </span>
                </div>
                <div class="divide-y divide-gray-50/50 overflow-hidden flex-1">${adItems}</div>
                <div class="bg-gradient-to-br from-primary/5 to-transparent border-t border-b border-gray-100 group/spotlight relative h-[85px] overflow-hidden shrink-0" id="ad-container-${idx}"></div>
                <div class="py-1 bg-white/30 text-center border-t border-white/50 shrink-0">
                    <a href="#" class="text-[8px] font-extrabold text-gray-400 hover:text-primary uppercase tracking-widest transition-all">عرض الكل</a>
                </div>
            `;
            grid.appendChild(card);
            startTicker(idx, c.n);
        });

        // Featured Ads
        for (let i = 0; i < 3; i++) {
            const featAd = document.createElement('div');
            featAd.className = "flex gap-2 items-center group cursor-pointer border-b border-white/50 last:border-0 pb-1.5 mb-1.5 last:pb-0 last:mb-0 hover:bg-white rounded-lg transition-all";
            featAd.innerHTML = `
                <div class="w-10 h-10 bg-gray-50 rounded-md shrink-0 border border-white flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                    <svg class="w-3.5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <div class="flex flex-col leading-tight">
                    <h4 class="text-[9px] font-bold group-hover:text-primary transition-colors line-clamp-1">فرصة استثنائية</h4>
                    <span class="text-[9px] text-primary font-black mt-0.5">2.5M <span class="text-[7px] opacity-60">ر.س</span></span>
                </div>
            `;
            feat.appendChild(featAd);
        }
    }

    function getIconPath(iconName: string) {
        const icons = {
            briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2V6m8 0H8",
            home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            car: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            "shopping-bag": "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
            wrench: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
            layers: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        };
        return icons[iconName] || icons.layers;
    }

    function startTicker(idx: number, catName: string) {
        const container = document.getElementById(`ad-container-${idx}`);
        const ads = getAdsFor(catName);
        let adIdx = 0;

        function update() {
            if (!container) return;

            const item = ads[adIdx];
            container.innerHTML = `
                <div class="absolute inset-0 p-2 flex gap-2 animate-card-switch group cursor-pointer hover:bg-white/40 transition-colors">
                    <div class="w-[65px] h-full bg-white rounded-md shrink-0 flex items-center justify-center relative overflow-hidden border border-white shadow-sm">
                        <svg class="w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div class="absolute top-0 right-0 bg-primary/90 text-white text-[7px] font-black px-1 py-0 rounded-bl-md shadow-sm">مميز</div>
                    </div>
                    <div class="flex-1 flex flex-col justify-between py-0.5">
                        <div class="flex flex-col gap-0.5">
                            <h4 class="text-[10px] font-[900] text-secondary line-clamp-2 leading-[1.2] group-hover/spotlight:text-primary transition-colors">${item.t}</h4>
                            <div class="flex items-center gap-2 text-[8px] text-gray-400 font-medium select-none">
                                <span class="flex items-center gap-0.5">
                                    <svg class="w-2.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    الرياض
                                </span>
                            </div>
                        </div>
                        <div class="flex justify-between items-end">
                            <span class="text-[10px] font-black text-primary">${item.p}</span>
                            <span class="text-[8px] font-bold bg-white border border-gray-100 px-1.5 py-0 rounded shadow-sm hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">التفاصيل</span>
                        </div>
                    </div>
                </div>
            `;
            adIdx = (adIdx + 1) % ads.length;
        }

        update();
        setInterval(update, 5000);
    }

    init();
}
