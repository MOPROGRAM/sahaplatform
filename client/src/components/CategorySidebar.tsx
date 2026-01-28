"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import {
    Home,
    Car,
    Building,
    Briefcase,
    ShoppingBag,
    Wrench,
} from "lucide-react";

export default function CategorySidebar() {
    const { language, t } = useLanguage();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const categories = [
        { key: 'all', label: t('allAds'), icon: <Home size={16} />, path: '/ads' },
        { key: 'realestate', label: t('realestate'), icon: <Building size={16} />, path: '/ads?category=realestate' },
        { key: 'cars', label: t('cars'), icon: <Car size={16} />, path: '/ads?category=cars' },
        { key: 'jobs', label: t('jobs'), icon: <Briefcase size={16} />, path: '/ads?category=jobs' },
        { key: 'electronics', label: t('electronics'), icon: <ShoppingBag size={16} />, path: '/ads?category=electronics' },
        { key: 'services', label: t('services'), icon: <Wrench size={16} />, path: '/ads?category=services' },
    ];

    return (
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-black text-secondary uppercase tracking-tight">
                    {t('categories')}
                </h2>
            </div>
            <nav className="p-2">
                {categories.map((category) => {
                    const isActive = pathname === category.path ||
                        (pathname.startsWith('/ads') && category.key !== 'all' &&
                            searchParams.get('category') === category.key);

                    return (
                        <Link
                            key={category.key}
                            href={category.path}
                            prefetch={false}
                            className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all ${isActive
                                ? 'bg-primary text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                }`}
                        >
                            {category.icon}
                            <span>{category.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}