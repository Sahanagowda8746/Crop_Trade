'use client';

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

export type UserRole = 'Farmer' | 'Buyer' | 'Transporter' | 'Admin';
export type Language = 'English' | 'Hindi' | 'Kannada' | 'Tamil' | 'Telugu' | 'Malayalam';

interface AppContextType {
  role: UserRole;
  setRole: Dispatch<SetStateAction<UserRole>>;
  pageTitle: string;
  setPageTitle: Dispatch<SetStateAction<string>>;
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('Farmer');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [language, setLanguage] = useState<Language>('English');
  
  return (
    <AppContext.Provider value={{ role, setRole, pageTitle, setPageTitle, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
}

    