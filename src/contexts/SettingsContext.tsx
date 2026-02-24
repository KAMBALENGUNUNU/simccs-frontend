import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fr';

interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const dictionaries = { en, fr };

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [language, setLanguageState] = useState<Language>('en');

    // Load from local storage initially
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const savedLang = localStorage.getItem('language') as Language | null;

        if (savedTheme) setThemeState(savedTheme);
        if (savedLang) setLanguageState(savedLang);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const setLanguage = (newLang: Language) => {
        setLanguageState(newLang);
        localStorage.setItem('language', newLang);
    };

    // Apply theme to document element
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    // Translation function using dot notation (e.g., 'common.save')
    const t = useCallback((key: string): string => {
        const keys = key.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = dictionaries[language];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key; // Fallback to returning the key if missing
            }
        }
        return typeof value === 'string' ? value : key;
    }, [language]);

    return (
        <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
