// src/hooks/use-language.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import enDict from '@/dictionaries/en.json';
import esDict from '@/dictionaries/es.json';

const dictionaries = {
  en: enDict,
  es: esDict,
};

type LanguageContextType = {
  language: 'en' | 'es';
  setLanguage: (language: 'en' | 'es') => void;
  dict: typeof enDict; // Assuming both dictionaries have the same shape
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const dict = dictionaries[language];

  useEffect(() => {
    // This effect runs once on the client to set the initial language
    // based on browser settings, but only if it hasn't been set by the user before.
    if (!useAppStore.persist.hasHydrated()) return;

    const storedState = useAppStore.getState();
    const hasSetLanguage = 'language' in (JSON.parse(localStorage.getItem('moir-ai-storage-v2') || '{}').state || {});
    
    if (!hasSetLanguage) {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'es') {
        setLanguage('es');
      } else {
        setLanguage('en');
      }
    }
    setIsInitialized(true);
  }, [setLanguage]);

  useEffect(() => {
    // This effect updates the document language and metadata whenever the language changes.
    if (typeof window !== 'undefined' && isInitialized) {
        document.documentElement.lang = language;
        document.title = dict.metadata.title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        if(descriptionTag) {
            descriptionTag.setAttribute('content', dict.metadata.description);
        }
    }
  }, [language, dict, isInitialized]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, dict }}>
        <html lang={language} suppressHydrationWarning>
            {children}
        </html>
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
