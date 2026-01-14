"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getCurrentLanguage, setLanguage as setLangUtil, getTranslation, TranslationKey } from './i18n';
import { useAuthStore } from '@/store/useAuthStore';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ar');
    const { initialize } = useAuthStore();

    useEffect(() => {
        setLanguageState(getCurrentLanguage());
        initialize();
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setLangUtil(lang);
    };

    const t = (key: TranslationKey) => getTranslation(key, language);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
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