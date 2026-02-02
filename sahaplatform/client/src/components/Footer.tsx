"use client";

import { useLanguage } from "@/lib/language-context";
import PixelWaterBackground from "@/components/PixelWaterBackground";

export default function Footer() {
    const { t, language } = useLanguage();

    return (
        <footer className="mt-auto border-t border-border-color py-12 px-4 relative min-h-[160px]">
            <PixelWaterBackground className="absolute bottom-0 left-0 right-0 w-full h-[75%]" />
            <div className="max-w-7xl mx-auto flex justify-center items-center relative z-10 gap-2">
                <Logo className="h-4 w-auto text-primary" strokeWidth="8" />
                <span className="font-[1000] text-text-main tracking-tighter text-xs">
                    2026
                </span>
            </div>
        </footer>
    );
}