import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { TimePeriod, WeatherCondition } from '@/config/themeConfig';

interface ThemeSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({ visible, onClose }) => {
    const {
        currentPeriod,
        currentTheme,
        weatherCondition,
        setWeatherCondition,
        forceTimePeriod,
        animationLevel,
        setAnimationLevel
    } = useEnhancedTheme();

    const [selectedMode, setSelectedMode] = useState<TimePeriod | 'auto'>('auto');

    const themeModes: { value: TimePeriod | 'auto'; label: string; description: string; icon: string }[] = [
        { value: 'auto', label: 'Auto (Time-based)', description: 'Changes based on time of day', icon: 'clock' },
        { value: 'morning', label: 'Always Morning', description: 'Light blues with balloons and birds', icon: 'sunrise' },
        { value: 'afternoon', label: 'Always Afternoon', description: 'Bright sky with planes and helicopters', icon: 'sun' },
        { value: 'evening', label: 'Always Evening', description: 'Sunset with city skylines and satellites', icon: 'sunset' },
        { value: 'night', label: 'Always Night', description: 'Dark cosmic with stars, moon, and UFOs', icon: 'moon' },
    ];

    const weatherConditions: { value: WeatherCondition; label: string; description: string; icon: string }[] = [
        { value: 'clear', label: 'Clear Sky', description: 'Standard theme elements', icon: 'sun' },
        { value: 'cloudy', label: 'Cloudy', description: 'Additional clouds and atmospheric effects', icon: 'cloud' },
        { value: 'rainy', label: 'Rainy', description: 'Rain particles and storm elements', icon: 'cloud-rain' },
        { value: 'foggy', label: 'Foggy', description: 'Atmospheric fog and haze effects', icon: 'cloud-drizzle' },
    ];

    const animationLevels: { value: 'none' | 'reduced' | 'full'; label: string; description: string }[] = [
        { value: 'full', label: 'Full Animations', description: 'All retro effects and moving objects' },
        { value: 'reduced', label: 'Reduced Animations', description: 'Essential animations only' },
        { value: 'none', label: 'No Animations', description: 'Static interface for performance' },
    ];

    const handleSave = () => {
        if (selectedMode === 'auto') {
            forceTimePeriod(null);
        } else {
            forceTimePeriod(selectedMode);
        }
        onClose();
    };

    const handleReset = () => {
        forceTimePeriod(null);
        setWeatherCondition('clear');
        setAnimationLevel('full');
        setSelectedMode('auto');
    };

    // Get current time period for display
    const getCurrentTimePeriod = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: currentTheme.colors.background[4] }}>
                {/* Header */}
                <View
                    className="flex-row items-center justify-between px-4 py-4 border-b"
                    style={{
                        borderBottomColor: currentTheme.colors.border,
                        backgroundColor: currentTheme.colors.surface
                    }}
                >
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ color: currentTheme.colors.primary }} className="text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text
                        className="text-xl font-bold"
                        style={{ color: currentTheme.colors.text }}
                    >
                        Enhanced Theme Settings
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text
                            style={{ color: currentTheme.colors.primary }}
                            className="text-lg font-semibold"
                        >
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Current Time Theme Info */}
                    <View
                        className="p-4 rounded-xl mb-6"
                        style={{ backgroundColor: currentTheme.colors.surface }}
                    >
                        <View className="flex-row items-center mb-2">
                            <Feather name="info" size={20} color={currentTheme.colors.primary} />
                            <Text
                                className="font-semibold ml-2"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Current Status
                            </Text>
                        </View>
                        <Text style={{ color: currentTheme.colors.text }}>
                            Auto theme would be: <Text className="font-semibold capitalize">{getCurrentTimePeriod()}</Text>
                        </Text>
                        <Text style={{ color: currentTheme.colors.text }}>
                            Current: <Text className="font-semibold capitalize">{currentPeriod}</Text> •
                            Weather: {weatherCondition} • Animation: {animationLevel}
                        </Text>
                    </View>

                    {/* Theme Mode Selection */}
                    <View className="mb-8">
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Theme Mode
                        </Text>
                        {themeModes.map((mode) => (
                            <TouchableOpacity
                                key={mode.value}
                                onPress={() => setSelectedMode(mode.value)}
                                className={`flex-row items-center p-4 rounded-xl mb-3 border`}
                                style={{
                                    backgroundColor: selectedMode === mode.value
                                        ? currentTheme.colors.surface
                                        : currentTheme.colors.background[3],
                                    borderColor: selectedMode === mode.value
                                        ? currentTheme.colors.primary
                                        : currentTheme.colors.border,
                                }}
                            >
                                <View
                                    className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
                                    style={{
                                        backgroundColor: selectedMode === mode.value
                                            ? currentTheme.colors.primary + '20'
                                            : currentTheme.colors.background[2]
                                    }}
                                >
                                    <Feather
                                        name={mode.icon as any}
                                        size={24}
                                        color={selectedMode === mode.value ? currentTheme.colors.primary : currentTheme.colors.text}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text
                                        className={`font-semibold text-base`}
                                        style={{
                                            color: selectedMode === mode.value
                                                ? currentTheme.colors.primary
                                                : currentTheme.colors.text
                                        }}
                                    >
                                        {mode.label}
                                    </Text>
                                    <Text
                                        className="text-sm"
                                        style={{ color: currentTheme.colors.text + 'CC' }}
                                    >
                                        {mode.description}
                                    </Text>
                                </View>
                                {selectedMode === mode.value && (
                                    <Feather name="check-circle" size={24} color={currentTheme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Weather Conditions */}
                    <View className="mb-8">
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Weather Effects
                        </Text>
                        {weatherConditions.map((weather) => (
                            <TouchableOpacity
                                key={weather.value}
                                onPress={() => setWeatherCondition(weather.value)}
                                className={`flex-row items-center justify-between p-4 rounded-xl mb-3 border`}
                                style={{
                                    backgroundColor: weatherCondition === weather.value
                                        ? currentTheme.colors.surface
                                        : currentTheme.colors.background[3],
                                    borderColor: weatherCondition === weather.value
                                        ? currentTheme.colors.accent
                                        : currentTheme.colors.border,
                                }}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Feather
                                        name={weather.icon as any}
                                        size={20}
                                        color={weatherCondition === weather.value ? currentTheme.colors.accent : currentTheme.colors.text}
                                        style={{ marginRight: 12 }}
                                    />
                                    <View className="flex-1">
                                        <Text
                                            className={`font-semibold text-base`}
                                            style={{
                                                color: weatherCondition === weather.value
                                                    ? currentTheme.colors.accent
                                                    : currentTheme.colors.text
                                            }}
                                        >
                                            {weather.label}
                                        </Text>
                                        <Text
                                            className="text-sm"
                                            style={{ color: currentTheme.colors.text + 'CC' }}
                                        >
                                            {weather.description}
                                        </Text>
                                    </View>
                                </View>
                                {weatherCondition === weather.value && (
                                    <Feather name="check-circle" size={24} color={currentTheme.colors.accent} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Animation Level */}
                    <View className="mb-8">
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Animation Level
                        </Text>
                        {animationLevels.map((level) => (
                            <TouchableOpacity
                                key={level.value}
                                onPress={() => setAnimationLevel(level.value)}
                                className={`flex-row items-center justify-between p-4 rounded-xl mb-3 border`}
                                style={{
                                    backgroundColor: animationLevel === level.value
                                        ? currentTheme.colors.surface
                                        : currentTheme.colors.background[3],
                                    borderColor: animationLevel === level.value
                                        ? currentTheme.colors.secondary
                                        : currentTheme.colors.border,
                                }}
                            >
                                <View className="flex-1">
                                    <Text
                                        className={`font-semibold text-base`}
                                        style={{
                                            color: animationLevel === level.value
                                                ? currentTheme.colors.secondary
                                                : currentTheme.colors.text
                                        }}
                                    >
                                        {level.label}
                                    </Text>
                                    <Text
                                        className="text-sm"
                                        style={{ color: currentTheme.colors.text + 'CC' }}
                                    >
                                        {level.description}
                                    </Text>
                                </View>
                                {animationLevel === level.value && (
                                    <Feather name="check-circle" size={24} color={currentTheme.colors.secondary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Current Theme Details */}
                    <View
                        className="p-4 rounded-xl mb-8"
                        style={{ backgroundColor: currentTheme.colors.surface }}
                    >
                        <Text
                            className="text-lg font-bold mb-4"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Current Theme Details
                        </Text>

                        {/* Color Palette */}
                        <View className="mb-4">
                            <Text
                                className="font-medium mb-2"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Color Palette:
                            </Text>
                            <View className="flex-row space-x-2">
                                <View
                                    className="w-8 h-8 rounded"
                                    style={{ backgroundColor: currentTheme.colors.primary }}
                                />
                                <View
                                    className="w-8 h-8 rounded"
                                    style={{ backgroundColor: currentTheme.colors.secondary }}
                                />
                                <View
                                    className="w-8 h-8 rounded"
                                    style={{ backgroundColor: currentTheme.colors.accent }}
                                />
                            </View>
                        </View>

                        {/* Theme Stats */}
                        <View>
                            <Text
                                className="text-sm"
                                style={{ color: currentTheme.colors.text + 'CC' }}
                            >
                                Active Objects: {currentTheme.retroObjects?.length || 0} •
                                Particles: {currentTheme.particles?.count || 0} •
                                Atmosphere: {currentTheme.atmosphere?.glow ? 'On' : 'Off'}
                            </Text>
                        </View>
                    </View>

                    {/* Reset Button */}
                    <TouchableOpacity
                        onPress={handleReset}
                        className="p-4 rounded-xl mb-6 border"
                        style={{
                            backgroundColor: currentTheme.colors.background[2],
                            borderColor: currentTheme.colors.border,
                        }}
                    >
                        <View className="flex-row items-center justify-center">
                            <Feather name="refresh-cw" size={20} color={currentTheme.colors.text} />
                            <Text
                                className="font-semibold ml-2"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Reset to Defaults
                            </Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default ThemeSettingsModal;
