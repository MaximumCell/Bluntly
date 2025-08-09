import React, { useEffect, useRef } from 'react';
import { View, Animated, Text } from 'react-native';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface RetroLoaderProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
    style?: 'cassette' | 'neon' | 'pixelated' | 'wave' | 'rocketAtom' | 'philosophy';
}

const RetroLoader: React.FC<RetroLoaderProps> = ({
    size = 'medium',
    text = 'Loading...',
    style = 'rocketAtom'
}) => {
    const { currentTheme } = useEnhancedTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const waveValue = useRef(new Animated.Value(0)).current;
    const orbitValue = useRef(new Animated.Value(0)).current;
    const rocketValue = useRef(new Animated.Value(0)).current;
    const philosophyValue = useRef(new Animated.Value(0)).current;
    const sequenceValue = useRef(new Animated.Value(0)).current;
    const launchValue = useRef(new Animated.Value(0)).current;

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

        // Rocket boost animation
        const rocketAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(rocketValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(rocketValue, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
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

        // Sequence animation: atom -> rocket transformation
        const sequenceAnimation = Animated.loop(
            Animated.sequence([
                // Atom phase (3 seconds)
                Animated.timing(sequenceValue, {
                    toValue: 0.5,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                // Transformation phase (0.5 seconds)
                Animated.timing(sequenceValue, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                // Rocket launch phase (2 seconds)
                Animated.timing(launchValue, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                // Reset
                Animated.timing(launchValue, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(sequenceValue, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        );

        spinAnimation.start();
        pulseAnimation.start();
        waveAnimation.start();
        orbitAnimation.start();
        rocketAnimation.start();
        philosophyAnimation.start();
        sequenceAnimation.start();

        return () => {
            spinAnimation.stop();
            pulseAnimation.stop();
            waveAnimation.stop();
            orbitAnimation.stop();
            rocketAnimation.stop();
            philosophyAnimation.stop();
            sequenceAnimation.stop();
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

    const rocketBoost = rocketValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15],
    });

    const philosophyBreath = philosophyValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const atomOpacity = sequenceValue.interpolate({
        inputRange: [0, 0.5, 0.8, 1],
        outputRange: [1, 1, 0.3, 0],
    });

    const rocketOpacity = sequenceValue.interpolate({
        inputRange: [0, 0.5, 0.8, 1],
        outputRange: [0, 0, 0.7, 1],
    });

    const rocketLaunch = launchValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -100],
    });

    const rocketScale = launchValue.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [1, 1.2, 0.3],
    });

    const renderLoader = () => {
        switch (style) {
            case 'rocketAtom':
                return (
                    <View className="items-center">
                        <View style={{ width: loaderSize * 2.5, height: loaderSize * 2.5, position: 'relative' }}>

                            {/* Atom Phase */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: atomOpacity,
                                }}
                            >
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
                                        shadowRadius: 8,
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
                                                top: -3,
                                                left: '50%',
                                                width: 6,
                                                height: 6,
                                                marginLeft: -3,
                                                backgroundColor: currentTheme.colors.accent || '#FF6B35',
                                                borderRadius: 3,
                                                shadowColor: currentTheme.colors.accent || '#FF6B35',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 1,
                                                shadowRadius: 3,
                                                elevation: 3,
                                            }}
                                        />
                                    </Animated.View>
                                ))}
                            </Animated.View>

                            {/* Rocket Phase */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: loaderSize * 0.6,
                                    height: loaderSize * 1.4,
                                    marginTop: -(loaderSize * 0.7),
                                    marginLeft: -(loaderSize * 0.3),
                                    opacity: rocketOpacity,
                                    transform: [
                                        { translateY: rocketLaunch },
                                        { scale: rocketScale }
                                    ],
                                }}
                            >
                                {/* Rocket Body */}
                                <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    {/* Main Body */}
                                    <View
                                        style={{
                                            width: '100%',
                                            height: '65%',
                                            backgroundColor: '#F0F0F0',
                                            borderRadius: 12,
                                            borderWidth: 2,
                                            borderColor: currentTheme.colors.primary,
                                            shadowColor: currentTheme.colors.primary,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                            elevation: 4,
                                        }}
                                    />

                                    {/* Rocket Nose Cone */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -8,
                                            left: '50%',
                                            width: 0,
                                            height: 0,
                                            marginLeft: -10,
                                            borderLeftWidth: 10,
                                            borderRightWidth: 10,
                                            borderBottomWidth: 18,
                                            borderLeftColor: 'transparent',
                                            borderRightColor: 'transparent',
                                            borderBottomColor: currentTheme.colors.accent || '#FF6B35',
                                        }}
                                    />

                                    {/* Side Fins */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            bottom: '5%',
                                            left: -6,
                                            width: 0,
                                            height: 0,
                                            borderTopWidth: 12,
                                            borderBottomWidth: 12,
                                            borderRightWidth: 10,
                                            borderTopColor: 'transparent',
                                            borderBottomColor: 'transparent',
                                            borderRightColor: currentTheme.colors.primary,
                                        }}
                                    />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            bottom: '5%',
                                            right: -6,
                                            width: 0,
                                            height: 0,
                                            borderTopWidth: 12,
                                            borderBottomWidth: 12,
                                            borderLeftWidth: 10,
                                            borderTopColor: 'transparent',
                                            borderBottomColor: 'transparent',
                                            borderLeftColor: currentTheme.colors.primary,
                                        }}
                                    />

                                    {/* Window */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: '20%',
                                            left: '50%',
                                            width: 12,
                                            height: 12,
                                            marginLeft: -6,
                                            backgroundColor: '#87CEEB',
                                            borderRadius: 6,
                                            borderWidth: 1,
                                            borderColor: currentTheme.colors.primary,
                                        }}
                                    />

                                    {/* Stripes */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: '40%',
                                            left: '10%',
                                            right: '10%',
                                            height: 2,
                                            backgroundColor: currentTheme.colors.primary,
                                        }}
                                    />
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '10%',
                                            right: '10%',
                                            height: 2,
                                            backgroundColor: currentTheme.colors.primary,
                                        }}
                                    />
                                </View>

                                {/* Rocket Exhaust */}
                                <Animated.View
                                    style={{
                                        position: 'absolute',
                                        bottom: -25,
                                        left: '50%',
                                        width: 16,
                                        height: 35,
                                        marginLeft: -8,
                                        opacity: launchValue.interpolate({
                                            inputRange: [0, 0.3, 1],
                                            outputRange: [0, 1, 0.8],
                                        }),
                                        transform: [{
                                            scaleY: launchValue.interpolate({
                                                inputRange: [0, 0.3, 1],
                                                outputRange: [0.5, 1.2, 1.5],
                                            })
                                        }],
                                    }}
                                >
                                    {/* Outer Flame */}
                                    <View
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: '#FF4500',
                                            borderRadius: 8,
                                        }}
                                    />
                                    {/* Middle Flame */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 3,
                                            left: '50%',
                                            width: 10,
                                            height: 25,
                                            marginLeft: -5,
                                            backgroundColor: '#FF6B35',
                                            borderRadius: 5,
                                        }}
                                    />
                                    {/* Inner Flame */}
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 6,
                                            left: '50%',
                                            width: 6,
                                            height: 15,
                                            marginLeft: -3,
                                            backgroundColor: '#FFD700',
                                            borderRadius: 3,
                                        }}
                                    />
                                </Animated.View>
                            </Animated.View>
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

            default:
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
