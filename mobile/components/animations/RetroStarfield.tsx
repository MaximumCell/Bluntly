import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface RetroStarfieldProps {
    children: React.ReactNode;
    intensity?: number; // 0-1
    showStars?: boolean;
    showMovingStars?: boolean;
    showShootingStars?: boolean;
    showRetroObjects?: boolean;
    showEarthSurface?: boolean;
    showBackground?: boolean;
    speed?: 'slow' | 'medium' | 'fast';
}

const RetroStarfield: React.FC<RetroStarfieldProps> = ({
    children,
    intensity = 0.8,
    showStars = true,
    showMovingStars = true,
    showShootingStars = true,
    showRetroObjects = true,
    showEarthSurface = false,
    showBackground = true,
    speed = 'medium',
}) => {
    const { currentTheme, settings } = useTheme();
    const { width, height } = Dimensions.get('window');

    // Get current time period
    const getCurrentTimePeriod = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    const timePeriod = getCurrentTimePeriod();

    // Dynamic configuration based on time
    const getTimeBasedConfig = () => {
        switch (timePeriod) {
            case 'morning':
                return {
                    staticStarCount: 15,
                    movingStarCount: 3,
                    shootingStarCount: 1,
                    starOpacity: 0.4,
                    starColors: ['#FFD700', '#FFA500', '#87CEEB'],
                    starSize: 1.5,
                    backgroundColors: ['#87CEEB', '#B0E0E6', '#E6F3FF'],
                    surfaceColor: '#228B22', // Forest green
                    surfaceGlow: '#FFD700',
                    retroObjects: [],
                };
            case 'afternoon':
                return {
                    staticStarCount: 8,
                    movingStarCount: 2,
                    shootingStarCount: 1,
                    starOpacity: 0.3,
                    starColors: ['#87CEEB', '#ADD8E6'],
                    starSize: 1,
                    backgroundColors: ['#E0F6FF', '#B0E0E6', '#87CEEB'],
                    surfaceColor: '#32CD32', // Lime green
                    surfaceGlow: '#87CEEB',
                    retroObjects: [],
                };
            case 'evening':
                return {
                    staticStarCount: 25,
                    movingStarCount: 4,
                    shootingStarCount: 2,
                    starOpacity: 0.7,
                    starColors: ['#FF6B35', '#FF8C69', '#FFD700'],
                    starSize: 2,
                    backgroundColors: ['#FF4500', '#FF6B35', '#1a1a2e'],
                    surfaceColor: '#8B4513', // Saddle brown
                    surfaceGlow: '#FF4500',
                    retroObjects: ['satellite'],
                };
            case 'night':
            default:
                return {
                    staticStarCount: 45,
                    movingStarCount: 5,
                    shootingStarCount: 3,
                    starOpacity: 0.9,
                    starColors: ['#FFFFFF', '#C0C0C0', currentTheme.primary, currentTheme.accent],
                    starSize: 2.5,
                    backgroundColors: ['#000000', '#1a1a1a', '#2d2d2d'],
                    surfaceColor: '#2F4F4F', // Dark slate gray
                    surfaceGlow: currentTheme.primary,
                    retroObjects: ['plane', 'ufo', 'satellite'],
                };
        }
    };

    const timeConfig = getTimeBasedConfig();

    // Static twinkling stars (most stars)
    const staticStarValues = useRef(
        Array.from({ length: timeConfig.staticStarCount }, (_, index) => ({
            x: Math.random() * width,
            y: Math.random() * height * 0.7, // Keep stars in upper 70% of screen
            opacity: new Animated.Value(Math.random() * timeConfig.starOpacity + 0.3),
            scale: new Animated.Value(Math.random() * 0.5 + 0.5),
            colorIndex: index % timeConfig.starColors.length,
        }))
    ).current;

    // Moving stars (just a few)
    const movingStarValues = useRef(
        Array.from({ length: timeConfig.movingStarCount }, (_, index) => ({
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(Math.random() * height * 0.7),
            opacity: new Animated.Value(Math.random() * timeConfig.starOpacity + 0.4),
            scale: new Animated.Value(Math.random() * 0.3 + 0.7),
            colorIndex: index % timeConfig.starColors.length,
        }))
    ).current;

    // Shooting stars
    const shootingStarValues = useRef(
        Array.from({ length: timeConfig.shootingStarCount }, (_, index) => ({
            x: new Animated.Value(-50),
            y: new Animated.Value(Math.random() * height * 0.4),
            opacity: new Animated.Value(0),
            length: new Animated.Value(0),
        }))
    ).current;

    // Retro objects (planes, UFOs, satellites)
    const retroObjectValues = useRef(
        timeConfig.retroObjects.map((type, index) => ({
            type,
            x: new Animated.Value(-100 - index * 300),
            y: new Animated.Value(Math.random() * height * 0.3 + 50),
            opacity: new Animated.Value(0.8),
            rotation: new Animated.Value(0),
        }))
    ).current;

    const getSpeed = () => {
        switch (speed) {
            case 'slow': return {
                twinkle: 3000,
                movingStar: 20000,
                shootingStar: 2500,
                retroObject: 30000
            };
            case 'fast': return {
                twinkle: 1000,
                movingStar: 8000,
                shootingStar: 1000,
                retroObject: 15000
            };
            default: return {
                twinkle: 2000,
                movingStar: 15000,
                shootingStar: 1500,
                retroObject: 25000
            };
        }
    };

    useEffect(() => {
        if (settings.animationLevel === 'none') return;

        const speedConfig = getSpeed();
        const animations: Animated.CompositeAnimation[] = [];

        // Static star twinkling animations
        if (showStars) {
            staticStarValues.forEach((star, index) => {
                const twinkleAnimation = Animated.loop(
                    Animated.sequence([
                        Animated.timing(star.opacity, {
                            toValue: 0.1,
                            duration: speedConfig.twinkle + index * 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(star.opacity, {
                            toValue: timeConfig.starOpacity,
                            duration: speedConfig.twinkle + index * 100,
                            useNativeDriver: true,
                        }),
                    ])
                );
                animations.push(twinkleAnimation);
            });
        }

        // Moving star animations (gentle floating)
        if (showMovingStars && settings.animationLevel === 'full') {
            movingStarValues.forEach((star, index) => {
                const moveAnimation = Animated.loop(
                    Animated.parallel([
                        // Gentle horizontal movement
                        Animated.sequence([
                            Animated.timing(star.x, {
                                toValue: width + 50,
                                duration: speedConfig.movingStar + index * 2000,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.x, {
                                toValue: -50,
                                duration: 0,
                                useNativeDriver: true,
                            }),
                        ]),
                        // Gentle twinkling
                        Animated.sequence([
                            Animated.timing(star.opacity, {
                                toValue: 0.3,
                                duration: speedConfig.twinkle,
                                useNativeDriver: true,
                            }),
                            Animated.timing(star.opacity, {
                                toValue: 0.9,
                                duration: speedConfig.twinkle,
                                useNativeDriver: true,
                            }),
                        ]),
                    ])
                );
                animations.push(moveAnimation);
            });
        }

        // Shooting star animations
        if (showShootingStars && settings.animationLevel === 'full') {
            shootingStarValues.forEach((shootingStar, index) => {
                const shootingAnimation = Animated.loop(
                    Animated.sequence([
                        Animated.delay(index * 5000 + Math.random() * 10000),
                        Animated.parallel([
                            Animated.timing(shootingStar.x, {
                                toValue: width + 100,
                                duration: speedConfig.shootingStar,
                                useNativeDriver: true,
                            }),
                            Animated.sequence([
                                Animated.timing(shootingStar.opacity, {
                                    toValue: 1,
                                    duration: speedConfig.shootingStar * 0.1,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(shootingStar.opacity, {
                                    toValue: 0,
                                    duration: speedConfig.shootingStar * 0.9,
                                    useNativeDriver: true,
                                }),
                            ]),
                            Animated.sequence([
                                Animated.timing(shootingStar.length, {
                                    toValue: 40,
                                    duration: speedConfig.shootingStar * 0.3,
                                    useNativeDriver: false,
                                }),
                                Animated.timing(shootingStar.length, {
                                    toValue: 0,
                                    duration: speedConfig.shootingStar * 0.7,
                                    useNativeDriver: false,
                                }),
                            ]),
                        ]),
                        Animated.timing(shootingStar.x, {
                            toValue: -50,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ])
                );
                animations.push(shootingAnimation);
            });
        }

        // Retro object animations
        if (showRetroObjects && settings.animationLevel === 'full') {
            retroObjectValues.forEach((obj, index) => {
                const objectAnimation = Animated.loop(
                    Animated.parallel([
                        Animated.sequence([
                            Animated.timing(obj.x, {
                                toValue: width + 150,
                                duration: speedConfig.retroObject + index * 3000,
                                useNativeDriver: true,
                            }),
                            Animated.timing(obj.x, {
                                toValue: -150,
                                duration: 0,
                                useNativeDriver: true,
                            }),
                        ]),
                        // Gentle rotation for satellites/UFOs
                        obj.type !== 'plane' ? Animated.timing(obj.rotation, {
                            toValue: 360,
                            duration: speedConfig.retroObject,
                            useNativeDriver: true,
                        }) : Animated.timing(obj.rotation, { toValue: 0, duration: 0, useNativeDriver: true }),
                    ])
                );
                animations.push(objectAnimation);
            });
        }

        // Start animations
        if (settings.animationLevel === 'full') {
            animations.forEach(animation => animation.start());
        } else if (settings.animationLevel === 'reduced' && showStars) {
            // Only twinkling in reduced mode
            staticStarValues.forEach((star, index) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(star.opacity, {
                            toValue: 0.2,
                            duration: 3000 + index * 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(star.opacity, {
                            toValue: 0.8,
                            duration: 3000 + index * 200,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            });
        }

        return () => {
            animations.forEach(animation => animation.stop());
        };
    }, [settings.animationLevel, showStars, showMovingStars, showShootingStars, showRetroObjects, speed]);

    // Render retro objects (plane, UFO, satellite)
    const renderRetroObject = (type: string, x: Animated.Value, y: Animated.Value, rotation: Animated.Value, opacity: Animated.Value) => {
        const AnimatedSvg = Animated.createAnimatedComponent(Svg);

        switch (type) {
            case 'plane':
                return (
                    <AnimatedSvg
                        key={`retro-${type}-${Math.random()}`}
                        width="40"
                        height="20"
                        viewBox="0 0 40 20"
                        style={{
                            position: 'absolute',
                            transform: [
                                { translateX: x },
                                { translateY: y },
                            ],
                            opacity,
                        }}
                    >
                        <Path
                            d="M0 10 L8 8 L25 9 L40 7 L38 10 L40 13 L25 11 L8 12 Z M25 9 L30 4 L32 4 L28 9 M25 11 L30 16 L32 16 L28 11"
                            fill={timeConfig.starColors[0]}
                            stroke={timeConfig.surfaceGlow}
                            strokeWidth="1"
                        />
                    </AnimatedSvg>
                );
            case 'ufo':
                return (
                    <AnimatedSvg
                        key={`retro-${type}-${Math.random()}`}
                        width="30"
                        height="15"
                        viewBox="0 0 30 15"
                        style={{
                            position: 'absolute',
                            transform: [
                                { translateX: x },
                                { translateY: y },
                                {
                                    rotate: rotation.interpolate({
                                        inputRange: [0, 360],
                                        outputRange: ['0deg', '360deg'],
                                    })
                                },
                            ],
                            opacity,
                        }}
                    >
                        <Circle cx="15" cy="10" r="8" fill={currentTheme.primary} opacity="0.6" />
                        <Path
                            d="M5 10 Q15 5 25 10 Q15 12 5 10"
                            fill={timeConfig.surfaceGlow}
                        />
                        <Circle cx="10" cy="10" r="1" fill="#FFFFFF" />
                        <Circle cx="15" cy="8" r="1" fill="#FFFFFF" />
                        <Circle cx="20" cy="10" r="1" fill="#FFFFFF" />
                    </AnimatedSvg>
                );
            case 'satellite':
                return (
                    <AnimatedSvg
                        key={`retro-${type}-${Math.random()}`}
                        width="25"
                        height="25"
                        viewBox="0 0 25 25"
                        style={{
                            position: 'absolute',
                            transform: [
                                { translateX: x },
                                { translateY: y },
                                {
                                    rotate: rotation.interpolate({
                                        inputRange: [0, 360],
                                        outputRange: ['0deg', '360deg'],
                                    })
                                },
                            ],
                            opacity,
                        }}
                    >
                        <Polygon
                            points="12,5 17,10 12,15 7,10"
                            fill={currentTheme.accent}
                        />
                        <Path
                            d="M5 12 L7 12 M18 12 L20 12 M12 3 L12 5 M12 20 L12 22"
                            stroke={timeConfig.starColors[1] || '#FFFFFF'}
                            strokeWidth="2"
                        />
                    </AnimatedSvg>
                );
            default:
                return null;
        }
    };

    // Render earth surface with moon
    const renderEarthSurface = () => {
        return (
            <Svg
                width={width}
                height="120"
                style={{ position: 'absolute', bottom: 0 }}
                viewBox={`0 0 ${width} 120`}
            >
                {/* Simple flat earth surface */}
                <Path
                    d={`M0 90 L${width} 90 L${width} 120 L0 120 Z`}
                    fill={timeConfig.surfaceColor}
                />

                {/* Moon */}
                <G>
                    <Circle
                        cx={width * 0.8}
                        cy="20"
                        r="28"
                        fill={timePeriod === 'night' ? '#F5F5DC' : '#E6E6FA'}
                        opacity={timePeriod === 'night' ? 0.95 : 0.7}
                    />
                    {/* Moon craters */}
                    <Circle
                        cx={width * 0.8 - 8}
                        cy="15"
                        r="3"
                        fill={timePeriod === 'night' ? '#D3D3D3' : '#C0C0C0'}
                        opacity="0.7"
                    />
                    <Circle
                        cx={width * 0.8 + 6}
                        cy="22"
                        r="2"
                        fill={timePeriod === 'night' ? '#D3D3D3' : '#C0C0C0'}
                        opacity="0.6"
                    />
                    <Circle
                        cx={width * 0.8 + 2}
                        cy="10"
                        r="1.5"
                        fill={timePeriod === 'night' ? '#D3D3D3' : '#C0C0C0'}
                        opacity="0.5"
                    />
                    {/* Enhanced moon glow effect */}
                    <Circle
                        cx={width * 0.8}
                        cy="20"
                        r="40"
                        fill="none"
                        stroke={timePeriod === 'night' ? '#F5F5DC' : '#E6E6FA'}
                        strokeWidth="1.5"
                        opacity={timePeriod === 'night' ? 0.4 : 0.3}
                    />
                    <Circle
                        cx={width * 0.8}
                        cy="20"
                        r="50"
                        fill="none"
                        stroke={timePeriod === 'night' ? '#F5F5DC' : '#E6E6FA'}
                        strokeWidth="1"
                        opacity={timePeriod === 'night' ? 0.2 : 0.15}
                    />
                </G>
            </Svg>
        );
    };

    return (
        <View style={styles.container}>
            {/* Background Layer (deepest) */}
            {showBackground && (
                <View style={[styles.layer, { opacity: intensity }]}>
                    <LinearGradient
                        colors={timeConfig.backgroundColors as [string, string, ...string[]]}
                        style={styles.background}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />
                </View>
            )}

            {/* Static Stars Layer */}
            {showStars && settings.animationLevel !== 'none' && (
                <View style={[styles.layer, { opacity: intensity * (timePeriod === 'night' ? 0.9 : 0.6) }]}>
                    {staticStarValues.map((star, index) => {
                        const color = timeConfig.starColors[star.colorIndex];
                        const starSize = timeConfig.starSize;

                        return (
                            <Animated.View
                                key={`static-star-${index}`}
                                style={[
                                    styles.star,
                                    {
                                        left: star.x,
                                        top: star.y,
                                        width: starSize,
                                        height: starSize,
                                        backgroundColor: color,
                                        opacity: star.opacity,
                                        transform: [{ scale: star.scale }],
                                        shadowColor: color,
                                        shadowOpacity: timePeriod === 'night' ? 1 : 0.8,
                                        shadowRadius: timePeriod === 'night' ? 8 : 5,
                                        elevation: timePeriod === 'night' ? 10 : 6,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            )}

            {/* Moving Stars Layer */}
            {showMovingStars && settings.animationLevel === 'full' && (
                <View style={[styles.layer, { opacity: intensity * 0.7 }]}>
                    {movingStarValues.map((star, index) => {
                        const color = timeConfig.starColors[star.colorIndex];
                        const starSize = timeConfig.starSize * 1.2;

                        return (
                            <Animated.View
                                key={`moving-star-${index}`}
                                style={[
                                    styles.star,
                                    {
                                        width: starSize,
                                        height: starSize,
                                        backgroundColor: color,
                                        transform: [
                                            { translateX: star.x },
                                            { translateY: star.y },
                                            { scale: star.scale },
                                        ],
                                        opacity: star.opacity,
                                        shadowColor: color,
                                        shadowOpacity: 1,
                                        shadowRadius: 8,
                                        elevation: 12,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            )}

            {/* Shooting Stars Layer */}
            {showShootingStars && settings.animationLevel === 'full' && (
                <View style={[styles.layer, { opacity: intensity * 0.8 }]}>
                    {shootingStarValues.map((shootingStar, index) => (
                        <Animated.View
                            key={`shooting-star-${index}`}
                            style={[
                                styles.shootingStar,
                                {
                                    transform: [
                                        { translateX: shootingStar.x },
                                        { translateY: shootingStar.y },
                                    ],
                                    opacity: shootingStar.opacity,
                                },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.shootingStarTrail,
                                    {
                                        width: shootingStar.length,
                                        backgroundColor: timeConfig.starColors[0],
                                    },
                                ]}
                            />
                        </Animated.View>
                    ))}
                </View>
            )}

            {/* Retro Objects Layer */}
            {showRetroObjects && settings.animationLevel === 'full' && (
                <View style={[styles.layer, { opacity: intensity * 0.8 }]}>
                    {retroObjectValues.map((obj, index) =>
                        renderRetroObject(obj.type, obj.x, obj.y, obj.rotation, obj.opacity)
                    )}
                </View>
            )}

            {/* Earth Surface Layer */}
            {showEarthSurface && (
                <View style={[styles.layer, { opacity: intensity * 0.9 }]}>
                    {renderEarthSurface()}
                </View>
            )}

            {/* Content Layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    layer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    background: {
        flex: 1,
    },
    star: {
        position: 'absolute',
        borderRadius: 1,
    },
    shootingStar: {
        position: 'absolute',
        width: 2,
        height: 2,
    },
    shootingStarTrail: {
        height: 2,
        borderRadius: 1,
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default RetroStarfield;