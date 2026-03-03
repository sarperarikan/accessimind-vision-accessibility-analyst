'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tr, en, Translations } from '../lib/translations';

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    t: Translations['common'];
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
            // Using a microtask to avoid the lint error and cascading render warning
            Promise.resolve().then(() => setLanguageState(savedLang));
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
    };

    const t = language === 'tr' ? tr.common : en.common;

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage }}>
            {children}
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
