"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/language-context";

export default function Footer() {
    const { t, language } = useLanguage();

    return (
        <footer className="mt-auto bg-card-bg border-t border-border-color py-6 px-4">
            <div className="max-w-7xl mx-auto flex justify-center items-center">
                <span className="font-[1000] text-text-main tracking-tighter text-sm">
                    {language === 'ar' ? 'ساحة 2026' : 'saha 2026'}
                </span>
            </div>
        </footer>
    );
}
