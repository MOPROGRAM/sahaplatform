"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/language-context";

export function Providers({ children, initialLanguage }: { children: React.ReactNode; initialLanguage: 'ar' | 'en' }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LanguageProvider initialLanguage={initialLanguage}>
                {children}
            </LanguageProvider>
        </ThemeProvider>
    );
}