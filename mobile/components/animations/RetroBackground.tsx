import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface RetroBackgroundProps {
    children: React.ReactNode;
    style?: 'gradient' | 'animated' | 'particles' | 'waves' | 'cosmic' | 'retro';
    intensity?: number; // 0-1
    showGrid?: boolean;
    showVignette?: boolean;
}

const RetroBackground: React.FC<RetroBackgroundProps> = ({
    children,
    style = 'retro',
    intensity = 0.8,
    showGrid = true,
    showVignette = true,
}) => {
    const { currentTheme, settings } = useTheme();
    const { width, height } = Dimensions.get('window');
    const animatedValue = useRef(new Animated.Value(0)).current;
    const gridValue = useRef(new Animated.Value(0)).current;
    const vignetteValue = useRef(new Animated.Value(0)).current;
    const particleValues = useRef(
        Array.from({ length: 30 }, () => ({
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(Math.random() * height),
            opacity: new Animated.Value(Math.random() * 0.6 + 0.2),
            scale: new Animated.Value(Math.random() * 0.8 + 0.3),
            rotation: new Animated.Value(0),
        }))
    ).current;

    // Get current time for dynamic theming
    const getCurrentTimePeriod = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    const [timePeriod, setTimePeriod] = useState(getCurrentTimePeriod());

    // Update time period every minute
    useEffect(() => {
        const updateTimePeriod = () => {
            const newTimePeriod = getCurrentTimePeriod();
            setTimePeriod(newTimePeriod);
        };

        // Update immediately
        updateTimePeriod();

        const interval = setInterval(updateTimePeriod, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []); // Run only once on mount, then every minute

    useEffect(() => {
        if (settings.animationLevel === 'none') return;

        // Main background animation
        const backgroundAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: false,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 4000,
                    useNativeDriver: false,
                }),
            ])
        );

        // Grid animation
        const gridAnimation = Animated.loop(
            Animated.timing(gridValue, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: true,
            })
        );

        // Vignette pulse animation
        const vignetteAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(vignetteValue, {
                    toValue: 1,
                    duration: 6000,
                    useNativeDriver: true,
                }),
                Animated.timing(vignetteValue, {
                    toValue: 0,
                    duration: 6000,
                    useNativeDriver: true,
                }),
            ])
        );

        // Enhanced particle animations
        const particleAnimations = particleValues.map((particle, index) => {
            return Animated.loop(
                Animated.parallel([
                    // Vertical movement
                    Animated.sequence([
                        Animated.timing(particle.y, {
                            toValue: -50,
                            duration: 12000 + index * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.y, {
                            toValue: height + 50,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Horizontal drift
                    Animated.sequence([
                        Animated.timing(particle.x, {
                            toValue: width * 0.8,
                            duration: 6000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.x, {
                            toValue: width * 0.2,
                            duration: 6000,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Opacity pulsing
                    Animated.sequence([
                        Animated.timing(particle.opacity, {
                            toValue: 0.8,
                            duration: 3000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(particle.opacity, {
                            toValue: 0.1,
                            duration: 3000,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Rotation
                    Animated.timing(particle.rotation, {
                        toValue: 360,
                        duration: 15000 + index * 500,
                        useNativeDriver: true,
                    }),
                ])
            );
        });

        if (settings.animationLevel === 'full') {
            backgroundAnimation.start();
            gridAnimation.start();
            vignetteAnimation.start();
            particleAnimations.forEach(animation => animation.start());
        } else if (settings.animationLevel === 'reduced') {
            backgroundAnimation.start();
            vignetteAnimation.start();
        }

        return () => {
            backgroundAnimation.stop();
            gridAnimation.stop();
            vignetteAnimation.stop();
            particleAnimations.forEach(animation => animation.stop());
        };
    }, [settings.animationLevel, timePeriod]); // Added timePeriod dependency

    const getGradientColors = (): [string, string, string, string, string] => {
        // Time-based color schemes with proper alpha blending
        switch (timePeriod) {
            case 'morning':
                return [
                    '#87CEEB',
                    '#B0E0E6',
                    '#E6F3FF',
                    '#F0F8FF',
                    '#FFFFFF'
                ];
            case 'afternoon':
                return [
                    '#87CEEB',
                    '#ADD8E6',
                    '#E0F6FF',
                    '#F0F8FF',
                    '#FFFFFF'
                ];
            case 'evening':
                return [
                    '#FF4500',
                    '#FF6B35',
                    '#FF8C69',
                    '#1a1a2e',
                    '#2d2d2d'
                ];
            case 'night':
            default:
                return [
                    '#000000',
                    '#1a1a1a',
                    '#2d2d2d',
                    '#0f0f23',
                    '#16213e'
                ];
        }
    };

    const renderGrid = () => {
        if (!showGrid || settings.animationLevel === 'none') return null;

        const gridSize = 40;
        const gridLines = [];

        // Vertical lines
        for (let i = 0; i < width; i += gridSize) {
            gridLines.push(
                <Animated.View
                    key={`v-${i}`}
                    style={{
                        position: 'absolute',
                        left: i,
                        width: 1,
                        height: '100%',
                        backgroundColor: currentTheme.primary,
                        opacity: gridValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 0.3],
                        }),
                        transform: [{
                            translateY: gridValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -20],
                            })
                        }]
                    }}
                />
            );
        }

        // Horizontal lines
        for (let i = 0; i < height; i += gridSize) {
            gridLines.push(
                <Animated.View
                    key={`h-${i}`}
                    style={{
                        position: 'absolute',
                        top: i,
                        height: 1,
                        width: '100%',
                        backgroundColor: currentTheme.primary,
                        opacity: gridValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 0.3],
                        }),
                    }}
                />
            );
        }

        return (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {gridLines}
            </View>
        );
    };

    const renderVignette = () => {
        if (!showVignette) return null;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: vignetteValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 0.6],
                    }),
                }}
            >
                <LinearGradient
                    colors={[
                        'transparent',
                        'transparent',
                        `${currentTheme.background}20`,
                        `${currentTheme.background}40`,
                        `${currentTheme.background}60`
                    ]}
                    style={{ flex: 1 }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>
        );
    };

    const renderBackground = () => {
        const colors = getGradientColors();

        switch (style) {
            case 'retro':
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        {/* Main background gradient */}
                        <LinearGradient
                            colors={colors}
                            style={{ flex: 1 }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />

                        {/* Grid overlay */}
                        {renderGrid()}

                        {/* Enhanced particles */}
                        {settings.animationLevel === 'full' && particleValues.map((particle, index) => (
                            <Animated.View
                                key={index}
                                style={{
                                    position: 'absolute',
                                    width: 3,
                                    height: 3,
                                    backgroundColor: index % 2 === 0 ? currentTheme.primary : currentTheme.accent,
                                    borderRadius: 1.5,
                                    opacity: particle.opacity,
                                    transform: [
                                        { translateX: particle.x },
                                        { translateY: particle.y },
                                        { scale: particle.scale },
                                        {
                                            rotate: particle.rotation.interpolate({
                                                inputRange: [0, 360],
                                                outputRange: ['0deg', '360deg'],
                                            })
                                        },
                                    ],
                                    shadowColor: index % 2 === 0 ? currentTheme.primary : currentTheme.accent,
                                    shadowOpacity: 0.8,
                                    shadowRadius: 2,
                                    elevation: 3,
                                }}
                            />
                        ))}

                        {/* Vignette effect */}
                        {renderVignette()}

                        {/* Bottom gradient enhancement */}
                        <LinearGradient
                            colors={[
                                'transparent',
                                'transparent',
                                `${currentTheme.background}40`,
                                `${currentTheme.background}80`,
                            ]}
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: height * 0.3,
                            }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        />
                    </View>
                );

            case 'cosmic':
                const cosmicColors: [string, string, string, string] = timePeriod === 'night'
                    ? ['#0a0a0a', '#1a1a2e', '#16213e', '#0f3460']
                    : timePeriod === 'evening'
                        ? ['#1a0a0a', '#2e1a1a', '#3e1621', '#60340f']
                        : timePeriod === 'morning'
                            ? ['#0a0a1a', '#1a2e2e', '#21163e', '#0f6034']
                            : ['#0a1a1a', '#2e1a2e', '#16213e', '#34600f'];

                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <LinearGradient
                            colors={cosmicColors as [string, string, ...string[]]}
                            style={{ flex: 1 }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        {settings.animationLevel === 'full' && particleValues.slice(0, 15).map((particle, index) => (
                            <Animated.View
                                key={index}
                                style={{
                                    position: 'absolute',
                                    width: 2,
                                    height: 2,
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 1,
                                    opacity: particle.opacity,
                                    transform: [
                                        { translateX: particle.x },
                                        { translateY: particle.y },
                                        { scale: particle.scale },
                                    ],
                                    shadowColor: '#FFFFFF',
                                    shadowOpacity: 0.9,
                                    shadowRadius: 3,
                                    elevation: 5,
                                }}
                            />
                        ))}
                    </View>
                );

            case 'animated':
                return (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 0.9],
                            }),
                        }}
                    >
                        <LinearGradient
                            colors={colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                );

            case 'particles':
                return (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                        <LinearGradient
                            colors={colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                        {settings.animationLevel === 'full' && particleValues.map((particle, index) => (
                            <Animated.View
                                key={index}
                                style={{
                                    position: 'absolute',
                                    width: 4,
                                    height: 4,
                                    backgroundColor: currentTheme.accent,
                                    borderRadius: 2,
                                    opacity: particle.opacity,
                                    transform: [
                                        { translateX: particle.x },
                                        { translateY: particle.y },
                                        { scale: particle.scale },
                                    ],
                                }}
                            />
                        ))}
                    </View>
                );

            case 'waves':
                return (
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            transform: [{
                                translateY: animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 30],
                                })
                            }]
                        }}
                    >
                        <LinearGradient
                            colors={colors}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1 }}
                        />
                    </Animated.View>
                );

            case 'gradient':
            default:
                return (
                    <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                    />
                );
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {renderBackground()}
            <View style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    contentLayer: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
    particle: {
        position: 'absolute',
        borderRadius: 2,
    },
    gridContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    vignette: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    vignetteGradient: {
        flex: 1,
    },
});

export default RetroBackground;
