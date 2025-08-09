export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeatherCondition = 'clear' | 'cloudy' | 'rainy' | 'foggy';

export interface ThemeColors {
    background: [string, string, string, string, string];
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    surface: string;
    border: string;
}

export interface AnimationConfig {
    duration: number;
    enabled: boolean;
    easing?: 'ease' | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface ThemeAnimations {
    float: AnimationConfig;
    parallax: AnimationConfig;
    twinkle: AnimationConfig;
    drift: AnimationConfig;
    rotate: AnimationConfig;
    cloudDrift?: AnimationConfig;
    particleFlow?: AnimationConfig;
}

export interface RetroObject {
    type: string;
    count: number;
    animationType: 'float' | 'drift' | 'parallax' | 'twinkle' | 'rotate';
    speed: 'slow' | 'medium' | 'fast';
    layer: 'background' | 'middle' | 'foreground';
}

export interface ThemeConfig {
    colors: ThemeColors;
    objects: string[];
    retroObjects: RetroObject[];
    animations: ThemeAnimations;
    particles: {
        count: number;
        colors: string[];
        size: number;
        opacity: number;
    };
    atmosphere: {
        fog: boolean;
        haze: boolean;
        glow: boolean;
    };
}

// Enhanced theme configurations for each time period
export const themeConfig: Record<TimePeriod, ThemeConfig> = {
    morning: {
        colors: {
            background: ['#87CEEB', '#B0E0E6', '#E6F3FF', '#F0F8FF', '#FFFFFF'],
            primary: '#4A90E2',
            secondary: '#7FB3D3',
            accent: '#FFD700',
            text: '#2C3E50',
            surface: 'rgba(255, 255, 255, 0.9)',
            border: 'rgba(74, 144, 226, 0.3)',
        },
        objects: ['hotAirBalloons', 'birds', 'clouds', 'sun'],
        retroObjects: [
            {
                type: 'hotAirBalloon',
                count: 3,
                animationType: 'float',
                speed: 'slow',
                layer: 'background',
            },
            {
                type: 'bird',
                count: 5,
                animationType: 'drift',
                speed: 'medium',
                layer: 'middle',
            },
            {
                type: 'cloud',
                count: 4,
                animationType: 'drift',
                speed: 'slow',
                layer: 'background',
            },
        ],
        animations: {
            float: { duration: 4000, enabled: true, easing: 'easeInOut' },
            parallax: { duration: 6000, enabled: true, easing: 'linear' },
            twinkle: { duration: 2000, enabled: false },
            drift: { duration: 8000, enabled: true, easing: 'linear' },
            rotate: { duration: 10000, enabled: true, easing: 'linear' },
            cloudDrift: { duration: 12000, enabled: true },
        },
        particles: {
            count: 15,
            colors: ['#FFD700', '#87CEEB', '#FFFFFF'],
            size: 2,
            opacity: 0.6,
        },
        atmosphere: {
            fog: false,
            haze: true,
            glow: true,
        },
    },

    afternoon: {
        colors: {
            background: ['#87CEEB', '#ADD8E6', '#E0F6FF', '#F0F8FF', '#FFFFFF'],
            primary: '#2196F3',
            secondary: '#64B5F6',
            accent: '#FFC107',
            text: '#1976D2',
            surface: 'rgba(255, 255, 255, 0.95)',
            border: 'rgba(33, 150, 243, 0.3)',
        },
        objects: ['planes', 'clouds', 'kites', 'helicopters'],
        retroObjects: [
            {
                type: 'plane',
                count: 2,
                animationType: 'drift',
                speed: 'medium',
                layer: 'middle',
            },
            {
                type: 'helicopter',
                count: 1,
                animationType: 'float',
                speed: 'fast',
                layer: 'foreground',
            },
            {
                type: 'kite',
                count: 3,
                animationType: 'float',
                speed: 'medium',
                layer: 'middle',
            },
        ],
        animations: {
            float: { duration: 3000, enabled: true, easing: 'easeInOut' },
            parallax: { duration: 5000, enabled: true, easing: 'linear' },
            twinkle: { duration: 3000, enabled: false },
            drift: { duration: 7000, enabled: true, easing: 'linear' },
            rotate: { duration: 8000, enabled: true, easing: 'linear' },
            particleFlow: { duration: 6000, enabled: true },
        },
        particles: {
            count: 20,
            colors: ['#2196F3', '#FFC107', '#FFFFFF'],
            size: 1.5,
            opacity: 0.5,
        },
        atmosphere: {
            fog: false,
            haze: false,
            glow: true,
        },
    },

    evening: {
        colors: {
            background: ['#FF6B35', '#FF8C69', '#FFB347', '#FFA500', '#FF4500'],
            primary: '#FF5722',
            secondary: '#FF7043',
            accent: '#FFD54F',
            text: '#BF360C',
            surface: 'rgba(255, 183, 77, 0.9)',
            border: 'rgba(255, 87, 34, 0.4)',
        },
        objects: ['cityscape', 'satellites', 'stars', 'retroquets'],
        retroObjects: [
            {
                type: 'satellite',
                count: 2,
                animationType: 'drift',
                speed: 'slow',
                layer: 'background',
            },
            {
                type: 'cityscape',
                count: 1,
                animationType: 'parallax',
                speed: 'slow',
                layer: 'foreground',
            },
            {
                type: 'star',
                count: 8,
                animationType: 'twinkle',
                speed: 'slow',
                layer: 'background',
            },
        ],
        animations: {
            float: { duration: 5000, enabled: true, easing: 'easeInOut' },
            parallax: { duration: 8000, enabled: true, easing: 'linear' },
            twinkle: { duration: 2500, enabled: true, easing: 'easeInOut' },
            drift: { duration: 10000, enabled: true, easing: 'linear' },
            rotate: { duration: 12000, enabled: true, easing: 'linear' },
        },
        particles: {
            count: 25,
            colors: ['#FF5722', '#FFD54F', '#FF8C69'],
            size: 2.5,
            opacity: 0.7,
        },
        atmosphere: {
            fog: false,
            haze: true,
            glow: true,
        },
    },

    night: {
        colors: {
            background: ['#0D1B2A', '#1B263B', '#2C3E50', '#34495E', '#415A77'],
            primary: '#00BCD4',
            secondary: '#4DD0E1',
            accent: '#E91E63',
            text: '#ECEFF1',
            surface: 'rgba(52, 73, 94, 0.9)',
            border: 'rgba(0, 188, 212, 0.3)',
        },
        objects: ['moon', 'stars', 'neonSigns', 'ufos', 'galaxies'],
        retroObjects: [
            {
                type: 'moon',
                count: 1,
                animationType: 'float',
                speed: 'slow',
                layer: 'background',
            },
            {
                type: 'star',
                count: 25,
                animationType: 'twinkle',
                speed: 'slow',
                layer: 'background',
            },
            {
                type: 'ufo',
                count: 2,
                animationType: 'drift',
                speed: 'medium',
                layer: 'middle',
            },
            {
                type: 'neonSign',
                count: 3,
                animationType: 'twinkle',
                speed: 'fast',
                layer: 'foreground',
            },
        ],
        animations: {
            float: { duration: 6000, enabled: true, easing: 'easeInOut' },
            parallax: { duration: 10000, enabled: true, easing: 'linear' },
            twinkle: { duration: 1500, enabled: true, easing: 'easeInOut' },
            drift: { duration: 12000, enabled: true, easing: 'linear' },
            rotate: { duration: 15000, enabled: true, easing: 'linear' },
        },
        particles: {
            count: 35,
            colors: ['#00BCD4', '#E91E63', '#FFFFFF', '#FFD700'],
            size: 2,
            opacity: 0.8,
        },
        atmosphere: {
            fog: true,
            haze: false,
            glow: true,
        },
    },
};

// Weather-specific modifications
export const weatherEffects: Record<WeatherCondition, Partial<ThemeConfig>> = {
    clear: {},
    cloudy: {
        objects: ['clouds', 'heavyClouds'],
        particles: {
            count: 40,
            colors: ['#95A5A6', '#BDC3C7', '#FFFFFF'],
            size: 3,
            opacity: 0.6,
        },
        atmosphere: {
            fog: false,
            haze: true,
            glow: false,
        },
    },
    rainy: {
        objects: ['raindrops', 'clouds', 'lightning'],
        particles: {
            count: 60,
            colors: ['#3498DB', '#2980B9', '#85C1E9'],
            size: 1,
            opacity: 0.7,
        },
        atmosphere: {
            fog: true,
            haze: true,
            glow: false,
        },
    },
    foggy: {
        particles: {
            count: 80,
            colors: ['#BDC3C7', '#D5DBDB', '#FFFFFF'],
            size: 4,
            opacity: 0.3,
        },
        atmosphere: {
            fog: true,
            haze: true,
            glow: false,
        },
    },
};

// Animation easing functions for react-native-reanimated
export const easingFunctions = {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    linear: 'linear',
    easeIn: 'cubic-bezier(0.42, 0, 1.0, 1.0)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1.0)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1.0)',
};

// Fallback configurations
export const fallbackTheme: ThemeConfig = {
    colors: {
        background: ['#2C3E50', '#34495E', '#5D6D7E', '#85929E', '#AEB6BF'],
        primary: '#3498DB',
        secondary: '#5DADE2',
        accent: '#F39C12',
        text: '#FFFFFF',
        surface: 'rgba(52, 73, 94, 0.9)',
        border: 'rgba(52, 152, 219, 0.3)',
    },
    objects: ['stars'],
    retroObjects: [
        {
            type: 'star',
            count: 15,
            animationType: 'twinkle',
            speed: 'slow',
            layer: 'background',
        },
    ],
    animations: {
        float: { duration: 4000, enabled: true },
        parallax: { duration: 6000, enabled: true },
        twinkle: { duration: 2000, enabled: true },
        drift: { duration: 8000, enabled: true },
        rotate: { duration: 10000, enabled: true },
    },
    particles: {
        count: 20,
        colors: ['#3498DB', '#FFFFFF'],
        size: 2,
        opacity: 0.6,
    },
    atmosphere: {
        fog: false,
        haze: false,
        glow: true,
    },
};
