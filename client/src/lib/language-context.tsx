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
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { initialize } = useAuthStore();

    useEffect(() => {
        // Init Language
        const savedLang = getCurrentLanguage();
        setLanguageState(savedLang);

        // Init Theme
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        initialize();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setLangUtil(lang);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const t = (key: TranslationKey) => getTranslation(key, language);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, theme, toggleTheme }}>
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