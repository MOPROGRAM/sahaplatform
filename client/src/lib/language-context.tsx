"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getCurrentLanguage, setLanguage as setLangUtil, getTranslation, TranslationKey } from './i18n';
import { useAuthStore } from '@/store/useAuthStore';

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
    const [language, setLanguageState] = useState<Language>('ar');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [country, setCountryState] = useState<string>('sa');
    const [currency, setCurrencyState] = useState<string>('sar');
    const { initialize } = useAuthStore();

    useEffect(() => {
        // Init Language
        const savedLang = getCurrentLanguage();
        setLanguageState(savedLang);

        // Init Theme
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Init Regional
        const savedCountry = localStorage.getItem('country') || 'sa';
        const savedCurrency = localStorage.getItem('currency') || 'sar';
        setCountryState(savedCountry);
        setCurrencyState(savedCurrency);

        initialize();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setLangUtil(lang);
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
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const t = (key: TranslationKey) => getTranslation(key, language);

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