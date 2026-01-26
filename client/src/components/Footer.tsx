"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language-context";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="mt-auto bg-card-bg border-t border-border-color py-6 px-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6 text-[12px] font-bold text-text-muted">
                    <span className="font-[1000] italic text-text-main tracking-tighter uppercase">{t('siteName')} SYNC © 2026</span>
                    <div className="flex gap-4">
                        <Link href="/help" className="hover:text-primary cursor-pointer transition-colors uppercase tracking-widest text-[10px]">{t('help')}</Link>
                        <Link href="/advertise" className="hover:text-primary cursor-pointer transition-colors uppercase tracking-widest text-[10px]">{t('advertiseWithUs')}</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 bg-gray-bg border border-border-color rounded-md px-3 py-1.5 shadow-inner">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{t('secureProtocol')}</span>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-border-color/30 text-center">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">{t('footerNotice')}</p>
            </div>
        </footer>
    );
}
