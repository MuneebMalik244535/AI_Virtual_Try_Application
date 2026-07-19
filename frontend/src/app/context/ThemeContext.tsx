import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName =
    | 'midnight-luxe'
    | 'blanc-couture'
    | 'royal-burgundy'
    | 'emerald-atelier'
    | 'neon-cyber';

export interface Theme {
    name: ThemeName;
    label: string;
    emoji: string;
    wheelColor: string;    // color shown on the spin wheel slice
    description: string;
}

export const THEMES: Theme[] = [
    {
        name: 'midnight-luxe',
        label: 'Midnight Luxe',
        emoji: '🖤',
        wheelColor: '#1a1a1a',
        description: 'Dark obsidian with liquid gold',
    },
    {
        name: 'blanc-couture',
        label: 'Blanc Couture',
        emoji: '🤍',
        wheelColor: '#f0ece4',
        description: 'Ivory white with soft rose',
    },
    {
        name: 'royal-burgundy',
        label: 'Royal Burgundy',
        emoji: '🌹',
        wheelColor: '#6b0f1a',
        description: 'Deep wine & antique cream',
    },
    {
        name: 'emerald-atelier',
        label: 'Emerald Atelier',
        emoji: '🌿',
        wheelColor: '#0d3b27',
        description: 'Lush forest green & gold',
    },
    {
        name: 'neon-cyber',
        label: 'Neon Cyber',
        emoji: '👾',
        wheelColor: '#05051a',
        description: 'Electric cyan & hot pink',
    },
];

interface ThemeContextValue {
    currentTheme: Theme;
    setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(() => {
        const saved = localStorage.getItem('luxe-theme');
        return (saved as ThemeName) || 'midnight-luxe';
    });

    const currentTheme = THEMES.find((t) => t.name === currentThemeName) || THEMES[0];

    const setTheme = (name: ThemeName) => {
        setCurrentThemeName(name);
        localStorage.setItem('luxe-theme', name);
    };

    // Apply theme class to <html> element
    useEffect(() => {
        const html = document.documentElement;
        // Remove all theme classes
        THEMES.forEach((t) => html.classList.remove(`theme-${t.name}`));
        // Add current theme class
        html.classList.add(`theme-${currentThemeName}`);
        // Smooth transition
        html.style.transition = 'background-color 0.6s ease, color 0.6s ease';
    }, [currentThemeName]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
