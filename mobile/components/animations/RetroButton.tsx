import React, { useRef } from 'react';
import { TouchableOpacity, Animated, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface RetroButtonProps {
    title: string;
    onPress: () => void;
    style?: 'neon' | 'pixelated' | 'gradient' | 'cassette';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const RetroButton: React.FC<RetroButtonProps> = ({
    title,
    onPress,
    style = 'neon',
    size = 'medium',
    disabled = false,
    icon,
    fullWidth = false,
}) => {
    const { currentTheme } = useTheme();
    const scaleValue = useRef(new Animated.Value(1)).current;
    const glowValue = useRef(new Animated.Value(0.7)).current;

    const sizeMap = {
        small: { padding: 8, fontSize: 12 },
        medium: { padding: 12, fontSize: 14 },
        large: { padding: 16, fontSize: 16 },
    };

    const buttonSize = sizeMap[size];

    const handlePressIn = () => {
        if (disabled) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(glowValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        if (disabled) return;

        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                tension: 100,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(glowValue, {
                toValue: 0.7,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const getButtonStyle = () => {
        const baseStyle: any = {
            paddingHorizontal: buttonSize.padding * 1.5,
            paddingVertical: buttonSize.padding,
            borderRadius: 8,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            flexDirection: 'row' as const,
            minHeight: 44,
            opacity: disabled ? 0.5 : 1,
        };

        if (fullWidth) {
            baseStyle.width = '100%';
        }

        switch (style) {
            case 'neon':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: currentTheme.primary,
                    shadowColor: currentTheme.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 10,
                    elevation: 10,
                };

            case 'pixelated':
                return {
                    ...baseStyle,
                    backgroundColor: currentTheme.primary,
                    borderWidth: 3,
                    borderTopColor: currentTheme.accent,
                    borderLeftColor: currentTheme.accent,
                    borderRightColor: currentTheme.secondary,
                    borderBottomColor: currentTheme.secondary,
                    borderRadius: 0,
                };

            case 'gradient':
                return {
                    ...baseStyle,
                    backgroundColor: currentTheme.primary,
                    borderRadius: 25,
                    shadowColor: currentTheme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                };

            case 'cassette':
            default:
                return {
                    ...baseStyle,
                    backgroundColor: currentTheme.surface,
                    borderWidth: 2,
                    borderColor: currentTheme.primary,
                    borderRadius: 4,
                };
        }
    };

    const getAnimatedStyle = () => {
        if (style === 'neon') {
            return {
                shadowOpacity: glowValue,
            };
        }
        return {};
    };

    const getTextStyle = () => {
        const baseTextStyle = {
            fontSize: buttonSize.fontSize,
            fontWeight: '600' as const,
            marginLeft: icon ? 8 : 0,
        };

        switch (style) {
            case 'neon':
                return {
                    ...baseTextStyle,
                    color: currentTheme.primary,
                    textShadowColor: currentTheme.primary,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 5,
                };

            case 'pixelated':
            case 'gradient':
                return {
                    ...baseTextStyle,
                    color: currentTheme.surface,
                };

            case 'cassette':
            default:
                return {
                    ...baseTextStyle,
                    color: currentTheme.primary,
                };
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.9}
        >
            <Animated.View
                style={[
                    getButtonStyle(),
                    getAnimatedStyle(),
                    {
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            >
                {icon && <View>{icon}</View>}
                <Text style={getTextStyle()}>{title}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default RetroButton;
