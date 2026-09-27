import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function readStoredTheme() {
    try {
        const stored = localStorage.getItem('agrisphere_theme');
        if (stored === 'light' || stored === 'dark') return stored;
    } catch {
        // ignore storage errors (private browsing, etc.)
    }

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);

        try {
            localStorage.setItem('agrisphere_theme', theme);
        } catch {
            // ignore storage errors
        }
    }, [theme]);

    const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
