import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { themeConfig, TimePeriod, WeatherCondition } from '@/config/themeConfig';

interface ThemeContextType {
    currentPeriod: TimePeriod;
    currentTheme: typeof themeConfig.morning;
    transitionProgress: Animated.Value;
    isTransitioning: boolean;
    weatherCondition: WeatherCondition;
    setWeatherCondition: (condition: WeatherCondition) => void;
    forceTimePeriod: (period: TimePeriod | null) => void;
    animationLevel: 'none' | 'reduced' | 'full';
    setAnimationLevel: (level: 'none' | 'reduced' | 'full') => void;
}

const EnhancedThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useEnhancedTheme = () => {
    const context = useContext(EnhancedThemeContext);
    if (!context) {
        throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
    }
    return context;
};

interface EnhancedThemeProviderProps {
    children: React.ReactNode;
    updateInterval?: number; // in milliseconds
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({
    children,
    updateInterval = 60000, // Check every minute
}) => {
    const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>(() => getCurrentTimePeriod());
    const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [forcedPeriod, setForcedPeriod] = useState<TimePeriod | null>(null);
    const [animationLevel, setAnimationLevel] = useState<'none' | 'reduced' | 'full'>('full');

    const transitionProgress = useRef(new Animated.Value(1)).current;
    const lastPeriod = useRef<TimePeriod>(currentPeriod);

    // Get current time period based on hour
    function getCurrentTimePeriod(): TimePeriod {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    // Get current theme with weather consideration
    const getCurrentTheme = () => {
        const period = forcedPeriod || currentPeriod;
        const baseTheme = themeConfig[period];

        // Apply weather modifications
        if (weatherCondition === 'rainy') {
            return {
                ...baseTheme,
                colors: {
                    ...baseTheme.colors,
                    background: baseTheme.colors.background.map((color: string, index: number) =>
                        index === 0 ? '#2C3E50' : color
                    ) as [string, string, string, string, string],
                },
                objects: [...baseTheme.objects, 'raindrops'],
            };
        }

        if (weatherCondition === 'cloudy') {
            return {
                ...baseTheme,
                objects: [...baseTheme.objects, 'clouds'],
                animations: {
                    ...baseTheme.animations,
                    cloudDrift: { duration: 8000, enabled: true },
                },
            };
        }

        return baseTheme;
    };

    // Smooth transition between themes
    const transitionToNewTheme = (newPeriod: TimePeriod) => {
        if (newPeriod === currentPeriod && !forcedPeriod) return;

        setIsTransitioning(true);
        lastPeriod.current = currentPeriod;

        // Fade out current theme
        Animated.timing(transitionProgress, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
        }).start(() => {
            // Update to new theme
            setCurrentPeriod(newPeriod);

            // Fade in new theme
            Animated.timing(transitionProgress, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: false,
            }).start(() => {
                setIsTransitioning(false);
            });
        });
    };

    // Force a specific time period (for testing or special events)
    const forceTimePeriod = (period: TimePeriod | null) => {
        setForcedPeriod(period);
        if (period && period !== currentPeriod) {
            transitionToNewTheme(period);
        } else if (!period) {
            const naturalPeriod = getCurrentTimePeriod();
            if (naturalPeriod !== currentPeriod) {
                transitionToNewTheme(naturalPeriod);
            }
        }
    };

    // Check for time changes
    useEffect(() => {
        const checkTimeChange = () => {
            if (forcedPeriod) return; // Don't auto-update if manually forced

            const newPeriod = getCurrentTimePeriod();
            if (newPeriod !== currentPeriod) {
                transitionToNewTheme(newPeriod);
            }
        };

        const interval = setInterval(checkTimeChange, updateInterval);
        return () => clearInterval(interval);
    }, [currentPeriod, forcedPeriod, updateInterval]);

    // Initialize theme
    useEffect(() => {
        // Smooth initial load
        transitionProgress.setValue(0);
        Animated.timing(transitionProgress, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, []);

    const value: ThemeContextType = {
        currentPeriod: forcedPeriod || currentPeriod,
        currentTheme: getCurrentTheme(),
        transitionProgress,
        isTransitioning,
        weatherCondition,
        setWeatherCondition,
        forceTimePeriod,
        animationLevel,
        setAnimationLevel,
    };

    return (
        <EnhancedThemeContext.Provider value={value}>
            {children}
        </EnhancedThemeContext.Provider>
    );
};
