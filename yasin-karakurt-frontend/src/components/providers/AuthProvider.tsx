'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useAuthStore } from '@/stores/authStore';

const AuthHydrationContext = createContext<boolean>(true);

export function useAuthHydration() {
  return useContext(AuthHydrationContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AuthHydrationContext.Provider value={isHydrated}>
      {children}
    </AuthHydrationContext.Provider>
  );
}