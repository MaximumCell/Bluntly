import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme types
export type ThemeMode = 'auto' | 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
export type AnimationLevel = 'full' | 'reduced' | 'none';

export interface CustomColorScheme {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
}

export interface ThemeSettings {
    mode: ThemeMode;
    animationLevel: AnimationLevel;
    backgroundEffects: boolean;
    retroIntensity: number; // 0-100
    customColors?: CustomColorScheme;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
    gradient: string[];
}

interface ThemeContextType {
    settings: ThemeSettings;
    currentTheme: ThemeColors;
    updateSettings: (newSettings: Partial<ThemeSettings>) => void;
    getCurrentTimeTheme: () => ThemeMode;
    resetToDefaults: () => void;
}

// Default theme settings
const DEFAULT_SETTINGS: ThemeSettings = {
    mode: 'auto',
    animationLevel: 'full',
    backgroundEffects: true,
    retroIntensity: 75,
};

// Pre-defined color schemes
const THEME_COLORS: Record<ThemeMode, ThemeColors> = {
    auto: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        accent: '#ef4444',
        gradient: ['#6366f1', '#8b5cf6'],
    },
    morning: {
        primary: '#f59e0b',
        secondary: '#f97316',
        background: '#fefce8',
        surface: '#fef3c7',
        text: '#365314',
        accent: '#ec4899',
        gradient: ['#fbbf24', '#f59e0b', '#f97316'],
    },
    afternoon: {
        primary: '#3b82f6',
        secondary: '#06b6d4',
        background: '#eff6ff',
        surface: '#dbeafe',
        text: '#1e3a8a',
        accent: '#10b981',
        gradient: ['#3b82f6', '#06b6d4', '#0891b2'],
    },
    evening: {
        primary: '#f97316',
        secondary: '#dc2626',
        background: '#fef2f2',
        surface: '#fed7aa',
        text: '#7c2d12',
        accent: '#a855f7',
        gradient: ['#f97316', '#dc2626', '#be123c'],
    },
    night: {
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        accent: '#10b981',
        gradient: ['#8b5cf6', '#06b6d4', '#10b981'],
    },
    custom: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        accent: '#ef4444',
        gradient: ['#6366f1', '#8b5cf6'],
    },
};

const STORAGE_KEY = '@bluntly_theme_settings';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
    const [currentTheme, setCurrentTheme] = useState<ThemeColors>(THEME_COLORS.auto);

    // Load settings from storage on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Update current theme when settings change
    useEffect(() => {
        updateCurrentTheme();
    }, [settings]);

    const loadSettings = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load theme settings:', error);
        }
    };

    const saveSettings = async (newSettings: ThemeSettings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save theme settings:', error);
        }
    };

    const getCurrentTimeTheme = (): ThemeMode => {
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    const updateCurrentTheme = () => {
        let themeMode: ThemeMode = settings.mode;

        // If auto mode, determine theme based on time
        if (settings.mode === 'auto') {
            themeMode = getCurrentTimeTheme();
        }

        let theme = { ...THEME_COLORS[themeMode] };

        // Apply custom colors if mode is custom
        if (settings.mode === 'custom' && settings.customColors) {
            theme = {
                ...theme,
                ...settings.customColors,
                gradient: [settings.customColors.primary, settings.customColors.secondary],
            };
        }

        // Apply retro intensity (could affect opacity, saturation, etc.)
        // For now, we'll just use the base colors

        setCurrentTheme(theme);
    };

    const updateSettings = (newSettings: Partial<ThemeSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        saveSettings(updatedSettings);
    };

    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
        saveSettings(DEFAULT_SETTINGS);
    };

    const value: ThemeContextType = {
        settings,
        currentTheme,
        updateSettings,
        getCurrentTimeTheme,
        resetToDefaults,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
