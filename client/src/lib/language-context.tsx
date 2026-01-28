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
    
    // Initialize language from cookie/localStorage if possible, otherwise default to 'ar'
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            // Check cookie first (synced with server)
            const cookieLang = document.cookie
                .split('; ')
                .find(row => row.startsWith('language='))
                ?.split('=')[1] as Language;
            
            if (cookieLang && (cookieLang === 'ar' || cookieLang === 'en')) return cookieLang;
            
            return (localStorage.getItem('language') as Language) || 'ar';
        }
        return 'ar';
    });

    const [country, setCountryState] = useState<string>('sa');
    const [currency, setCurrencyState] = useState<string>('sar');

    const theme = (resolvedTheme || 'dark') as 'light' | 'dark';

    useEffect(() => {
        // Synchronize on mount
        const savedLang = (localStorage.getItem('language') as Language) || language;
        setLanguageState(savedLang);
        setLangUtil(savedLang);
        
        // Ensure document attributes match
        document.documentElement.lang = savedLang;
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

        // Init Regional
        const savedCountry = localStorage.getItem('country') || 'sa';
        const savedCurrency = localStorage.getItem('currency') || 'sar';
        setCountryState(savedCountry);
        setCurrencyState(savedCurrency);

        initialize();
        setMounted(true);
    }, [initialize, language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        setLangUtil(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        // Cookie is already set in i18n.ts setLanguage helper which calls window.location.reload()
        // but if we call this directly, we should ensure cookie is set.
        document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
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

    // Hydration guard removed to prevent white flash. 
    // Initial state is now synced with server via initialLanguage prop.

    return (
        <LanguageContext.Provider value={{
            language, setLanguage, t, theme, toggleTheme,
            country, setCountry, currency, setCurrency
        }}>
             {/* Removed nested dir/lang attributes to avoid conflict with html tag */}
            <div className="min-h-screen">
                {children}
            </div>
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        // Return default values to prevent crash
        return {
            language: 'ar' as Language,
            setLanguage: () => {},
            t: (key: TranslationKey) => key,
            theme: 'dark',
            toggleTheme: () => {},
            country: 'sa',
            setCountry: () => {},
            currency: 'sar',
            setCurrency: () => {}
        };
    }
    return context;
}
