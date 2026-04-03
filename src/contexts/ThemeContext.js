'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';
import { useCoupleConfig } from './CoupleContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { config } = useCoupleConfig();
  const palette = config?.palette || 'rosa';

  useEffect(() => {
    document.documentElement.dataset.palette = palette;
    try {
      localStorage.setItem('nt_palette', palette);
    } catch {}
  }, [palette]);

  const value = useMemo(() => ({ palette }), [palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
