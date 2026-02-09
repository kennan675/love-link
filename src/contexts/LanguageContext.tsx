import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'sw' | 'ar' | 'pt' | 'ha' | 'yo' | 'ig' | 'am' | 'zu';

export const languageNames: Record<Language, string> = {
    en: 'English',
    fr: 'Français',
    sw: 'Kiswahili',
    ar: 'العربية',
    pt: 'Português',
    ha: 'Hausa',
    yo: 'Yorùbá',
    ig: 'Igbo',
    am: 'Amharic',
    zu: 'Zulu',
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Load saved language from localStorage or default to English
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    useEffect(() => {
        // Update HTML lang attribute for accessibility
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
