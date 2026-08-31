import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeOption {
  id: string;
  label: string;
  swatch: string; // primary color for the picker UI
}

export const THEMES: ThemeOption[] = [
  { id: 'violet', label: 'Neon Violet', swatch: '#8b5cf6' },
  { id: 'cyan', label: 'Cyber Cyan', swatch: '#22d3ee' },
  { id: 'lime', label: 'Toxic Lime', swatch: '#a3e635' },
  { id: 'crimson', label: 'Crimson Ops', swatch: '#f43f5e' },
  { id: 'gold', label: 'Gold Rush', swatch: '#eab308' },
  { id: 'glass', label: 'Glass', swatch: '#7dd3fc' },
  { id: 'elegant', label: 'Elegant', swatch: '#d4a574' },
  { id: 'sunset', label: 'Sunset', swatch: '#fb923c' },
  { id: 'ocean', label: 'Ocean', swatch: '#2dd4bf' },
  { id: 'royal', label: 'Royal', swatch: '#818cf8' }
];

const STORAGE_KEY = 'swiftsell-theme';

interface ThemeContextType {
  themeId: string;
  setThemeId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'violet';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.id === stored) ? stored! : 'violet';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    window.localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const setThemeId = (id: string) => {
    if (THEMES.some((t) => t.id === id)) setThemeIdState(id);
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
