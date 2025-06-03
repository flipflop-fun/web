// ===========================================
// ============= Theme Context ==============

import { createContext, useContext, useEffect, useState } from "react";
import { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY_THEME } from "../config/constants";
import { useTranslation } from "react-i18next";

// ===========================================
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Get theme from localStorage
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    const prefersDark = savedTheme === 'dark' ||
      (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Initialize with HTML class and state
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', DARK_THEME);
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', LIGHT_THEME);
    }
    return prefersDark;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    const root = document.documentElement;
    const newTheme = isDarkMode ? DARK_THEME : LIGHT_THEME;

    // Update DOM
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', newTheme);

    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  const {t} = useTranslation();
  if (context === undefined) {
    throw new Error(t('auth.themeProviderError'));
  }
  return context;
};
