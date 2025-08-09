import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Polygon, G, Rect, Ellipse } from 'react-native-svg';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { RetroObject } from '@/config/themeConfig';

interface EnhancedRetroBackgroundProps {
    children: React.ReactNode;
    intensity?: number; // 0-1
    showParticles?: boolean;
    showObjects?: boolean;
    showAtmosphere?: boolean;
}

const EnhancedRetroBackground: React.FC<EnhancedRetroBackgroundProps> = ({
    children,
    intensity = 0.9,
    showParticles = true,
    showObjects = true,
    showAtmosphere = true,
}) => {
    const { currentTheme, transitionProgress, isTransitioning, animationLevel } = useEnhancedTheme();
    const { width, height } = Dimensions.get('window');


    // Animation values for different object types - INCREASED COUNT
    const floatValues = useRef(
        Array.from({ length: 25 }, (_, index) => ({
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(Math.random() * height * 0.8), // Use more vertical space
            opacity: new Animated.Value(Math.random() * 0.6 + 0.4), // Higher minimum opacity
            scale: new Animated.Value(Math.random() * 0.8 + 0.7), // Larger minimum scale
            rotation: new Animated.Value(0),
        }))
    ).current;

    const particleValues = useRef(
        Array.from({ length: Math.max(currentTheme.particles.count, 25) }, () => ({
            x: new Animated.Value(Math.random() * width),
            y: new Animated.Value(Math.random() * height),
            opacity: new Animated.Value(Math.random() * currentTheme.particles.opacity + 0.3),
            scale: new Animated.Value(Math.random() * 0.8 + 0.4),
            rotation: new Animated.Value(0),
        }))
    ).current;

    const atmosphereValue = useRef(new Animated.Value(0)).current;

    // Animation setup
    useEffect(() => {
        if (animationLevel === 'none') return;

        const animations: Animated.CompositeAnimation[] = [];

        // Object animations
        if (showObjects && (animationLevel === 'full' || animationLevel === 'reduced')) {
            currentTheme.retroObjects.forEach((objectConfig, index) => {
                if (index >= floatValues.length) return;

                const objValue = floatValues[index];
                const animConfig = currentTheme.animations[objectConfig.animationType];

                if (!animConfig || !animConfig.enabled) return;

                let animation: Animated.CompositeAnimation;

                switch (objectConfig.animationType) {
                    case 'float':
                        animation = Animated.loop(
                            Animated.sequence([
                                Animated.timing(objValue.y, {
                                    toValue: Math.random() * height * 0.2 + 30, // Float higher
                                    duration: animConfig.duration * 0.6, // Faster animation
                                    useNativeDriver: true,
                                }),
                                Animated.timing(objValue.y, {
                                    toValue: Math.random() * height * 0.7 + 50, // Float lower
                                    duration: animConfig.duration * 0.6, // Faster animation
                                    useNativeDriver: true,
                                }),
                            ])
                        );
                        break;

                    case 'drift':
                        // Reset position and start drift animation
                        objValue.x.setValue(-100);
                        animation = Animated.loop(
                            Animated.sequence([
                                Animated.timing(objValue.x, {
                                    toValue: width + 100,
                                    duration: animConfig.duration * 0.7, // Faster drift
                                    useNativeDriver: true,
                                }),
                                Animated.timing(objValue.x, {
                                    toValue: -100,
                                    duration: 0,
                                    useNativeDriver: true,
                                }),
                            ])
                        );
                        break;

                    case 'twinkle':
                        animation = Animated.loop(
                            Animated.sequence([
                                Animated.timing(objValue.opacity, {
                                    toValue: 0.3,
                                    duration: animConfig.duration * 0.5, // Faster twinkle
                                    useNativeDriver: true,
                                }),
                                Animated.timing(objValue.opacity, {
                                    toValue: 1,
                                    duration: animConfig.duration * 0.5, // Faster twinkle
                                    useNativeDriver: true,
                                }),
                            ])
                        );
                        break;

                    case 'rotate':
                        animation = Animated.loop(
                            Animated.timing(objValue.rotation, {
                                toValue: 360,
                                duration: animConfig.duration * 0.5, // Faster rotation
                                useNativeDriver: true,
                            })
                        );
                        break;

                    case 'parallax':
                        // Reset position and start parallax animation
                        objValue.x.setValue(-50);
                        animation = Animated.loop(
                            Animated.sequence([
                                Animated.parallel([
                                    Animated.timing(objValue.x, {
                                        toValue: width + 50,
                                        duration: animConfig.duration * 0.8, // Faster parallax
                                        useNativeDriver: true,
                                    }),
                                    Animated.timing(objValue.y, {
                                        toValue: Math.random() * height * 0.6,
                                        duration: animConfig.duration * 0.6, // Faster y movement
                                        useNativeDriver: true,
                                    }),
                                ]),
                                Animated.timing(objValue.x, {
                                    toValue: -50,
                                    duration: 0,
                                    useNativeDriver: true,
                                }),
                            ])
                        );
                        break;

                    default:
                        animation = Animated.loop(
                            Animated.timing(objValue.scale, {
                                toValue: 1.2,
                                duration: animConfig.duration,
                                useNativeDriver: true,
                            })
                        );
                }

                animations.push(animation);
            });
        }

        // Particle animations
        if (showParticles) {
            particleValues.slice(0, currentTheme.particles.count).forEach((particle, index) => {
                const particleAnimation = Animated.loop(
                    Animated.parallel([
                        Animated.sequence([
                            Animated.timing(particle.y, {
                                toValue: -50,
                                duration: 8000 + index * 200,
                                useNativeDriver: true,
                            }),
                            Animated.timing(particle.y, {
                                toValue: height + 50,
                                duration: 0,
                                useNativeDriver: true,
                            }),
                        ]),
                        Animated.sequence([
                            Animated.timing(particle.opacity, {
                                toValue: currentTheme.particles.opacity,
                                duration: 2000,
                                useNativeDriver: true,
                            }),
                            Animated.timing(particle.opacity, {
                                toValue: 0.1,
                                duration: 2000,
                                useNativeDriver: true,
                            }),
                        ]),
                    ])
                );
                animations.push(particleAnimation);
            });
        }

        // Atmosphere animation
        if (showAtmosphere && currentTheme.atmosphere.glow) {
            const atmosphereAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(atmosphereValue, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(atmosphereValue, {
                        toValue: 0.3,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(atmosphereAnimation);
        }

        // Start animations
        animations.forEach(animation => animation.start());

        return () => {
            animations.forEach(animation => animation.stop());
        };
    }, [currentTheme, animationLevel, showObjects, showParticles, showAtmosphere]);

    // SVG object renderer
    const renderRetroObject = (type: string, value: any, index: number) => {
        const AnimatedSvg = Animated.createAnimatedComponent(Svg);
        const colorIndex = index % currentTheme.particles.colors.length;
        const color = currentTheme.particles.colors[colorIndex];

        const commonStyle = {
            position: 'absolute' as const,
            transform: [
                { translateX: value.x },
                { translateY: value.y },
                { scale: value.scale },
                {
                    rotate: value.rotation.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                    }),
                },
            ],
            opacity: value.opacity,
        };

        switch (type) {
            case 'hotAirBalloon':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="80"
                        height="100"
                        viewBox="0 0 80 100"
                        style={commonStyle}
                    >
                        {/* Balloon */}
                        <Ellipse cx="40" cy="30" rx="32" ry="38" fill={color} opacity="0.9" />
                        <Ellipse cx="40" cy="30" rx="26" ry="32" fill={currentTheme.colors.accent} opacity="0.7" />
                        {/* Basket */}
                        <Rect x="35" y="75" width="12" height="10" fill="#8B4513" />
                        {/* Ropes */}
                        <Path d="M26 65 L35 75 M54 65 L47 75 M40 65 L40 75" stroke="#654321" strokeWidth="1.5" />
                    </AnimatedSvg>
                );

            case 'plane':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="70"
                        height="30"
                        viewBox="0 0 70 30"
                        style={commonStyle}
                    >
                        <Path
                            d="M0 15 L12 12 L42 13 L70 10 L68 15 L70 20 L42 17 L12 18 Z M42 13 L49 6 L52 6 L46 13 M42 17 L49 24 L52 24 L46 17"
                            fill={color}
                            stroke={currentTheme.colors.primary}
                            strokeWidth="1.5"
                        />
                    </AnimatedSvg>
                );

            case 'bird':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="30"
                        height="20"
                        viewBox="0 0 30 20"
                        style={commonStyle}
                    >
                        <Path d="M3 10 Q15 3 27 10 Q15 7 3 10" fill={color} opacity="0.8" />
                    </AnimatedSvg>
                );

            case 'cloud':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="80"
                        height="40"
                        viewBox="0 0 80 40"
                        style={commonStyle}
                    >
                        <Path
                            d="M20 30 Q15 20 25 20 Q30 10 40 20 Q55 15 55 25 Q65 20 60 30 Z"
                            fill="#FFFFFF"
                            opacity="0.8"
                        />
                    </AnimatedSvg>
                );

            case 'star':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        style={commonStyle}
                    >
                        <Path
                            d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z"
                            fill={color}
                            opacity="0.9"
                        />
                    </AnimatedSvg>
                );

            case 'moon':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="60"
                        height="60"
                        viewBox="0 0 60 60"
                        style={commonStyle}
                    >
                        <Circle cx="30" cy="30" r="25" fill="#F5F5DC" opacity="0.9" />
                        <Circle cx="22" cy="25" r="3" fill="#D3D3D3" opacity="0.7" />
                        <Circle cx="35" cy="35" r="2" fill="#D3D3D3" opacity="0.6" />
                        <Circle cx="32" cy="20" r="1.5" fill="#D3D3D3" opacity="0.5" />
                    </AnimatedSvg>
                );

            case 'ufo':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="60"
                        height="30"
                        viewBox="0 0 60 30"
                        style={commonStyle}
                    >
                        <Ellipse cx="30" cy="18" rx="22" ry="9" fill={currentTheme.colors.primary} opacity="0.8" />
                        <Path d="M8 18 Q30 12 52 18 Q30 21 8 18" fill={currentTheme.colors.accent} />
                        <Circle cx="18" cy="18" r="1.5" fill="#FFFFFF" />
                        <Circle cx="30" cy="15" r="1.5" fill="#FFFFFF" />
                        <Circle cx="42" cy="18" r="1.5" fill="#FFFFFF" />
                    </AnimatedSvg>
                );

            case 'satellite':
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        style={commonStyle}
                    >
                        <Rect x="12" y="12" width="6" height="6" fill={currentTheme.colors.primary} />
                        <Path d="M5 15 L12 15 M18 15 L25 15 M15 5 L15 12 M15 18 L15 25" stroke={color} strokeWidth="2" />
                    </AnimatedSvg>
                );

            default:
                return (
                    <AnimatedSvg
                        key={`${type}-${index}`}
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        style={commonStyle}
                    >
                        <Circle cx="5" cy="5" r="3" fill={color} opacity="0.8" />
                    </AnimatedSvg>
                );
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <Animated.View
                style={[
                    styles.layer,
                    {
                        opacity: transitionProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, intensity],
                        }),
                    },
                ]}
            >
                <LinearGradient
                    colors={currentTheme.colors.background as [string, string, ...string[]]}
                    style={styles.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
            </Animated.View>

            {/* Atmosphere Effects */}
            {showAtmosphere && currentTheme.atmosphere.glow && (
                <Animated.View
                    style={[
                        styles.layer,
                        {
                            opacity: atmosphereValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.1, 0.4],
                            }),
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[
                            'transparent',
                            `${currentTheme.colors.primary}20`,
                            'transparent',
                        ]}
                        style={styles.background}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />
                </Animated.View>
            )}

            {/* Retro Objects */}
            {showObjects && animationLevel !== 'none' && (
                <View style={styles.layer}>
                    {/* Render theme objects multiple times for better visibility */}
                    {currentTheme.retroObjects.map((obj, objIndex) => {
                        const totalObjects = Math.max(obj.count, 3); // Minimum 3 of each type
                        return Array.from({ length: totalObjects }, (_, instanceIndex) => {
                            const index = objIndex * totalObjects + instanceIndex;
                            if (index >= floatValues.length) return null;
                            return renderRetroObject(obj.type, floatValues[index], index);
                        });
                    }).flat()}

                    {/* Add extra stars for atmosphere */}
                    {currentTheme.retroObjects.some(obj => obj.type === 'star') &&
                        Array.from({ length: 8 }, (_, i) => {
                            const index = currentTheme.retroObjects.length * 3 + i;
                            if (index >= floatValues.length) return null;
                            return renderRetroObject('star', floatValues[index], index);
                        })
                    }

                    {/* Add extra UFOs for night theme */}
                    {currentTheme.retroObjects.some(obj => obj.type === 'ufo') &&
                        Array.from({ length: 2 }, (_, i) => {
                            const index = currentTheme.retroObjects.length * 3 + 8 + i;
                            if (index >= floatValues.length) return null;
                            return renderRetroObject('ufo', floatValues[index], index);
                        })
                    }
                </View>
            )}            {/* Particles */}
            {showParticles && animationLevel !== 'none' && (
                <View style={styles.layer}>
                    {particleValues.slice(0, Math.max(currentTheme.particles.count, 20)).map((particle, index) => {
                        const colorIndex = index % currentTheme.particles.colors.length;
                        const color = currentTheme.particles.colors[colorIndex];

                        return (
                            <Animated.View
                                key={`particle-${index}`}
                                style={[
                                    styles.particle,
                                    {
                                        width: Math.max(currentTheme.particles.size, 3),
                                        height: Math.max(currentTheme.particles.size, 3),
                                        backgroundColor: color,
                                        transform: [
                                            { translateX: particle.x },
                                            { translateY: particle.y },
                                            { scale: particle.scale },
                                        ],
                                        opacity: particle.opacity.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.4, 1],
                                        }),
                                        shadowColor: color,
                                        shadowOpacity: 0.8,
                                        shadowRadius: 4,
                                        elevation: 5,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            )}

            {/* Content */}
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
    particle: {
        position: 'absolute',
        borderRadius: 1,
    },
});

export default EnhancedRetroBackground;
