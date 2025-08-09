import React, { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface RetroLoaderProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    style?: 'cassette' | 'neon' | 'pixelated' | 'wave' | 'atom' | 'philosophy';
}

const RetroLoader: React.FC<RetroLoaderProps> = ({
    size = 'medium',
    text = 'Loading...',
    style = 'atom'
}) => {
    const { currentTheme } = useEnhancedTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const waveValue = useRef(new Animated.Value(0)).current;
    const orbitValue = useRef(new Animated.Value(0)).current;
    const philosophyValue = useRef(new Animated.Value(0)).current;

    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60
    };

    const loaderSize = sizeMap[size];

    useEffect(() => {
        // Spinning animation
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        );

        // Pulse animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        // Wave animation
        const waveAnimation = Animated.loop(
            Animated.timing(waveValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );

        // Orbit animation for atoms
        const orbitAnimation = Animated.loop(
            Animated.timing(orbitValue, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        );

        // Philosophy animation (breathing effect)
        const philosophyAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(philosophyValue, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(philosophyValue, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );

        spinAnimation.start();
        pulseAnimation.start();
        waveAnimation.start();
        orbitAnimation.start();
        philosophyAnimation.start();

        return () => {
            spinAnimation.stop();
            pulseAnimation.stop();
            waveAnimation.stop();
            orbitAnimation.stop();
            philosophyAnimation.stop();
        };
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const wave = waveValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const orbit = orbitValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const philosophyBreath = philosophyValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const renderLoader = () => {
        switch (style) {
            case 'cassette':
                return (
                    <View className="items-center">
                        <View
                            style={{
                                width: loaderSize * 1.5,
                                height: loaderSize,
                                backgroundColor: currentTheme.colors.surface,
                                borderRadius: 4,
                                borderWidth: 2,
                                borderColor: currentTheme.colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View className="flex-row space-x-2">
                                <Animated.View
                                    style={{
                                        width: loaderSize * 0.3,
                                        height: loaderSize * 0.3,
                                        borderRadius: loaderSize * 0.15,
                                        borderWidth: 2,
                                        borderColor: currentTheme.colors.primary,
                                        transform: [{ rotate: spin }],
                                    }}
                                />
                                <Animated.View
                                    style={{
                                        width: loaderSize * 0.3,
                                        height: loaderSize * 0.3,
                                        borderRadius: loaderSize * 0.15,
                                        borderWidth: 2,
                                        borderColor: currentTheme.colors.primary,
                                        transform: [{ rotate: spin }],
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                );

            case 'neon':
                return (
                    <View className="items-center">
                        <Animated.View
                            style={{
                                width: loaderSize,
                                height: loaderSize,
                                borderRadius: loaderSize / 2,
                                borderWidth: 3,
                                borderColor: currentTheme.colors.primary,
                                borderTopColor: 'transparent',
                                transform: [{ rotate: spin }, { scale: pulseValue }],
                                shadowColor: currentTheme.colors.primary,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8,
                                shadowRadius: 10,
                                elevation: 10,
                            }}
                        />
                        <View
                            style={{
                                position: 'absolute',
                                width: loaderSize * 0.6,
                                height: loaderSize * 0.6,
                                borderRadius: (loaderSize * 0.6) / 2,
                                backgroundColor: currentTheme.colors.primary,
                                opacity: 0.3,
                                top: loaderSize * 0.2,
                            }}
                        />
                    </View>
                );

            case 'pixelated':
                return (
                    <View className="items-center">
                        <View className="flex-row space-x-1">
                            {[0, 1, 2, 3, 4].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={{
                                        width: 4,
                                        height: loaderSize,
                                        backgroundColor: currentTheme.colors.primary,
                                        opacity: wave,
                                        transform: [{
                                            scaleY: waveValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.3, 1],
                                                extrapolate: 'clamp',
                                            })
                                        }],
                                    }}
                                    className="rounded-sm"
                                />
                            ))}
                        </View>
                    </View>
                );

            case 'atom':
                return (
                    <View className="items-center">
                        <View style={{ width: loaderSize * 2.5, height: loaderSize * 2.5, position: 'relative' }}>
                            {/* Central Nucleus */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: loaderSize * 0.4,
                                    height: loaderSize * 0.4,
                                    marginTop: -(loaderSize * 0.2),
                                    marginLeft: -(loaderSize * 0.2),
                                    backgroundColor: currentTheme.colors.primary,
                                    borderRadius: loaderSize * 0.2,
                                    transform: [{ scale: pulseValue }],
                                    shadowColor: currentTheme.colors.primary,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}
                            />

                            {/* Electron Orbits */}
                            {[0, 1, 2].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: loaderSize * (1 + index * 0.4),
                                        height: loaderSize * (1 + index * 0.4),
                                        marginTop: -(loaderSize * (0.5 + index * 0.2)),
                                        marginLeft: -(loaderSize * (0.5 + index * 0.2)),
                                        borderWidth: 1,
                                        borderColor: currentTheme.colors.primary + '40',
                                        borderRadius: loaderSize * (0.5 + index * 0.2),
                                        transform: [{
                                            rotate: orbitValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [`${index * 120}deg`, `${360 + index * 120}deg`],
                                            })
                                        }],
                                    }}
                                >
                                    {/* Electron */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            left: '50%',
                                            width: 8,
                                            height: 8,
                                            marginLeft: -4,
                                            backgroundColor: currentTheme.colors.accent || '#FF6B35',
                                            borderRadius: 4,
                                            shadowColor: currentTheme.colors.accent || '#FF6B35',
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 1,
                                            shadowRadius: 6,
                                            elevation: 6,
                                        }}
                                    />
                                </Animated.View>
                            ))}

                            {/* Energy Particles */}
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <Animated.View
                                    key={`particle-${index}`}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: 3,
                                        height: 3,
                                        marginTop: -1.5,
                                        marginLeft: -1.5,
                                        backgroundColor: currentTheme.colors.primary + '80',
                                        borderRadius: 1.5,
                                        transform: [
                                            {
                                                translateX: orbitValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [
                                                        Math.cos((index * 60) * Math.PI / 180) * loaderSize * 0.8,
                                                        Math.cos(((index * 60) + 360) * Math.PI / 180) * loaderSize * 0.8
                                                    ],
                                                })
                                            },
                                            {
                                                translateY: orbitValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [
                                                        Math.sin((index * 60) * Math.PI / 180) * loaderSize * 0.8,
                                                        Math.sin(((index * 60) + 360) * Math.PI / 180) * loaderSize * 0.8
                                                    ],
                                                })
                                            },
                                            { scale: pulseValue }
                                        ],
                                        opacity: 0.7,
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                );

            case 'philosophy':
                return (
                    <View className="items-center">
                        <View style={{ width: loaderSize * 2, height: loaderSize * 2, position: 'relative' }}>
                            {/* Central Mind */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: loaderSize * 0.8,
                                    height: loaderSize * 0.8,
                                    marginTop: -(loaderSize * 0.4),
                                    marginLeft: -(loaderSize * 0.4),
                                    backgroundColor: currentTheme.colors.surface,
                                    borderWidth: 2,
                                    borderColor: currentTheme.colors.primary,
                                    borderRadius: loaderSize * 0.4,
                                    transform: [{ scale: philosophyBreath }],
                                    shadowColor: currentTheme.colors.primary,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}
                            >
                                {/* Thought Symbol */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: loaderSize * 0.4,
                                        height: loaderSize * 0.4,
                                        marginTop: -(loaderSize * 0.2),
                                        marginLeft: -(loaderSize * 0.2),
                                        backgroundColor: currentTheme.colors.primary,
                                        borderRadius: loaderSize * 0.2,
                                    }}
                                />
                            </Animated.View>

                            {/* Floating Thought Bubbles */}
                            {[0, 1, 2, 3, 4].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        width: 8 + index * 2,
                                        height: 8 + index * 2,
                                        borderRadius: 4 + index,
                                        backgroundColor: currentTheme.colors.primary + '80',
                                        top: `${20 + index * 15}%`,
                                        left: `${20 + index * 15}%`,
                                        transform: [
                                            {
                                                translateY: philosophyValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -20 - index * 5],
                                                })
                                            },
                                            {
                                                scale: philosophyValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 1],
                                                })
                                            }
                                        ],
                                        opacity: philosophyValue.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [1, 0.3, 0],
                                        }),
                                    }}
                                />
                            ))}

                            {/* Wisdom Rays */}
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                                <Animated.View
                                    key={`ray-${index}`}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: 2,
                                        height: loaderSize * 0.6,
                                        marginTop: -(loaderSize * 0.3),
                                        marginLeft: -1,
                                        backgroundColor: currentTheme.colors.primary + '60',
                                        transformOrigin: '50% 100%',
                                        transform: [
                                            { rotate: `${index * 45}deg` },
                                            {
                                                scaleY: philosophyValue.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.3, 1],
                                                })
                                            }
                                        ],
                                        opacity: philosophyValue.interpolate({
                                            inputRange: [0, 0.5, 1],
                                            outputRange: [0.2, 0.8, 0.2],
                                        }),
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                );

            case 'wave':
            default:
                return (
                    <View className="items-center">
                        <View className="flex-row space-x-1">
                            {[0, 1, 2, 3, 4].map((index) => (
                                <Animated.View
                                    key={index}
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: currentTheme.colors.primary,
                                        transform: [{
                                            translateY: waveValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -10],
                                                extrapolate: 'clamp',
                                            })
                                        }],
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                );
        }
    };

    return (
        <View className="items-center space-y-4">
            {renderLoader()}
            {text && (
                <Animated.Text
                    style={{
                        color: currentTheme.colors.text,
                        fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
                        fontWeight: '600',
                        opacity: pulseValue,
                        textShadowColor: currentTheme.colors.primary,
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 5,
                        fontFamily: 'monospace',
                    }}
                >
                    {text}
                </Animated.Text>
            )}
        </View>
    );
};

export default RetroLoader;
