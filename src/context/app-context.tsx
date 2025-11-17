'use client';

import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

export type UserRole = 'Farmer' | 'Buyer' | 'Transporter' | 'Admin';

interface AppContextType {
  role: UserRole;
  setRole: Dispatch<SetStateAction<UserRole>>;
  pageTitle: string;
  setPageTitle: Dispatch<SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('Farmer');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  
  return (
    <AppContext.Provider value={{ role, setRole, pageTitle, setPageTitle }}>
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
