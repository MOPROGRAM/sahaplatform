"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getCurrentLanguage, setLanguage as setLangUtil, getTranslation, TranslationKey } from './i18n';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from 'next-themes';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    country: string;
    setCountry: (country: string) => void;
    currency: string;
    setCurrency: (currency: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme, setTheme: setNextTheme } = useTheme();
    const { initialize } = useAuthStore();
    
    const [mounted, setMounted] = useState(false);
    const [language, setLanguageState] = useState<Language>('ar');
    const [country, setCountryState] = useState<string>('sa');
    const [currency, setCurrencyState] = useState<string>('sar');

    const theme = (resolvedTheme || 'dark') as 'light' | 'dark';

    useEffect(() => {
        // Init Language from localStorage
        const savedLang = (localStorage.getItem('language') as Language) || 'ar';
        setLanguageState(savedLang);
        setLangUtil(savedLang);
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

        // Init Regional
        const savedCountry = localStorage.getItem('country') || 'sa';
        const savedCurrency = localStorage.getItem('currency') || 'sar';
        setCountryState(savedCountry);
        setCurrencyState(savedCurrency);

        initialize();
        setMounted(true);
    }, [initialize]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setLangUtil(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    };

    const setCountry = (c: string) => {
        setCountryState(c);
        localStorage.setItem('country', c);
    };

    const setCurrency = (curr: string) => {
        setCurrencyState(curr);
        localStorage.setItem('currency', curr);
    };

    const toggleTheme = () => {
        setNextTheme(theme === 'light' ? 'dark' : 'light');
    };

    const t = (key: TranslationKey) => getTranslation(key, language);

    // To prevent flickering (shaking) and language flash:
    // We return a matching shell during hydration until client-side state is synchronized.
    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]" dir="rtl" lang="ar" />
        );
    }

    return (
        <LanguageContext.Provider value={{
            language, setLanguage, t, theme, toggleTheme,
            country, setCountry, currency, setCurrency
        }}>
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language} className="min-h-screen">
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
