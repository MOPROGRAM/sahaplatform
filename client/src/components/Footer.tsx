"use client";

import { useLanguage } from "@/lib/language-context";

export default function Footer() {
    const { t, language } = useLanguage();

    return (
        <footer className="mt-auto border-t border-border-color py-3 px-4 relative min-h-[40px]">
            <div className="max-w-7xl mx-auto flex justify-center items-center relative z-10">
                <span className="font-[1000] text-text-main tracking-tighter text-sm">
                    {language === 'ar' ? 'ساحة 2026' : 'saha 2026'}
                </span>
            </div>
        </footer>
    );
}
