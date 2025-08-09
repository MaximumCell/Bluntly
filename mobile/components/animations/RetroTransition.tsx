import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface RetroTransitionProps {
    children: React.ReactNode;
    type?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'typewriter' | 'glitch';
    duration?: number;
    delay?: number;
    onComplete?: () => void;
}

const RetroTransition: React.FC<RetroTransitionProps> = ({
    children,
    type = 'fadeIn',
    duration = 800,
    delay = 0,
    onComplete,
}) => {
    const { currentTheme, animationLevel } = useEnhancedTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const glitchX = useRef(new Animated.Value(0)).current;
    const { width } = Dimensions.get('window');

    useEffect(() => {
        if (animationLevel === 'none') {
            animatedValue.setValue(1);
            translateY.setValue(0);
            scale.setValue(1);
            onComplete?.();
            return;
        }

        const reducedDuration = animationLevel === 'reduced' ? duration * 0.5 : duration;

        const startAnimation = () => {
            switch (type) {
                case 'slideUp':
                    Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: reducedDuration,
                            useNativeDriver: true,
                        }),
                        Animated.spring(translateY, {
                            toValue: 0,
                            tension: 50,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                    ]).start(onComplete);
                    break;

                case 'scaleIn':
                    Animated.parallel([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: reducedDuration,
                            useNativeDriver: true,
                        }),
                        Animated.spring(scale, {
                            toValue: 1,
                            tension: 100,
                            friction: 8,
                            useNativeDriver: true,
                        }),
                    ]).start(onComplete);
                    break;

                case 'glitch':
                    if (animationLevel === 'full') {
                        const glitchSequence = Animated.loop(
                            Animated.sequence([
                                Animated.timing(glitchX, {
                                    toValue: 5,
                                    duration: 50,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(glitchX, {
                                    toValue: -5,
                                    duration: 50,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(glitchX, {
                                    toValue: 0,
                                    duration: 50,
                                    useNativeDriver: true,
                                }),
                                Animated.delay(1000),
                            ]),
                            { iterations: 3 }
                        );

                        Animated.parallel([
                            Animated.timing(animatedValue, {
                                toValue: 1,
                                duration: reducedDuration,
                                useNativeDriver: true,
                            }),
                            glitchSequence,
                        ]).start(onComplete);
                    } else {
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: reducedDuration,
                            useNativeDriver: true,
                        }).start(onComplete);
                    }
                    break;

                case 'typewriter':
                    // For typewriter effect, we'll just use a simple fade
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: reducedDuration * 2,
                        useNativeDriver: true,
                    }).start(onComplete);
                    break;

                case 'fadeIn':
                default:
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: reducedDuration,
                        useNativeDriver: true,
                    }).start(onComplete);
                    break;
            }
        };

        if (delay > 0) {
            setTimeout(startAnimation, delay);
        } else {
            startAnimation();
        }
    }, [type, duration, delay, animationLevel]);

    const getAnimatedStyle = () => {
        const baseStyle = {
            opacity: animatedValue,
        };

        switch (type) {
            case 'slideUp':
                return {
                    ...baseStyle,
                    transform: [{ translateY }],
                };

            case 'scaleIn':
                return {
                    ...baseStyle,
                    transform: [{ scale }],
                };

            case 'glitch':
                return {
                    ...baseStyle,
                    transform: [{ translateX: glitchX }],
                };

            default:
                return baseStyle;
        }
    };

    const renderWrapper = () => {
        if (type === 'glitch' && animationLevel === 'full') {
            return (
                <View style={{ position: 'relative' }}>
                    {/* Original content */}
                    <Animated.View style={getAnimatedStyle()}>
                        {children}
                    </Animated.View>

                    {/* Glitch layers */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.1],
                            }),
                            transform: [
                                {
                                    translateX: glitchX.interpolate({
                                        inputRange: [-5, 5],
                                        outputRange: [-3, 3],
                                    })
                                }
                            ],
                        }}
                    >
                        <View style={{ opacity: 0.5, backgroundColor: currentTheme.colors.primary + '20' }}>
                            {children}
                        </View>
                    </Animated.View>
                </View>
            );
        }

        return (
            <Animated.View style={getAnimatedStyle()}>
                {children}
            </Animated.View>
        );
    };

    return renderWrapper();
};

export default RetroTransition;
