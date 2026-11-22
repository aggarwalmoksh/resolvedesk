import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  resolvedTheme: 'light',
});

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    try {
      localStorage.removeItem('theme');
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        isDark: false,
        toggleTheme: () => {},
        setTheme: () => {},
        resolvedTheme: 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
