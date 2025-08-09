import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import EnhancedRetroBackground from '@/components/animations/EnhancedRetroBackground';

const ExampleApp: React.FC = () => {
    const {
        currentPeriod,
        currentTheme,
        isTransitioning,
        weatherCondition,
        setWeatherCondition,
        forceTimePeriod,
        animationLevel,
        setAnimationLevel
    } = useEnhancedTheme();

    const timePeriods = ['morning', 'afternoon', 'evening', 'night'] as const;
    const weatherConditions = ['clear', 'cloudy', 'rainy', 'foggy'] as const;
    const animationLevels = ['none', 'reduced', 'full'] as const;

    return (
        <EnhancedRetroBackground intensity={0.9}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.title, { color: currentTheme.colors.text }]}>
                        Enhanced Retro Theme Demo
                    </Text>
                    <Text style={[styles.subtitle, { color: currentTheme.colors.text }]}>
                        Current: {currentPeriod} • {weatherCondition} • {animationLevel}
                        {isTransitioning && <Text> (Transitioning...)</Text>}
                    </Text>
                </View>

                {/* Theme Controls */}
                <View style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                        Time Period Controls
                    </Text>
                    <View style={styles.buttonGrid}>
                        <TouchableOpacity
                            style={[styles.autoButton, { backgroundColor: currentTheme.colors.primary }]}
                            onPress={() => forceTimePeriod(null)}
                        >
                            <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
                                Auto
                            </Text>
                        </TouchableOpacity>
                        {timePeriods.map((period) => (
                            <TouchableOpacity
                                key={period}
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: currentPeriod === period
                                            ? currentTheme.colors.accent
                                            : currentTheme.colors.secondary,
                                        borderColor: currentTheme.colors.border,
                                    }
                                ]}
                                onPress={() => forceTimePeriod(period)}
                            >
                                <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
                                    {period.charAt(0).toUpperCase() + period.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Weather Controls */}
                <View style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                        Weather Conditions
                    </Text>
                    <View style={styles.buttonGrid}>
                        {weatherConditions.map((weather) => (
                            <TouchableOpacity
                                key={weather}
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: weatherCondition === weather
                                            ? currentTheme.colors.accent
                                            : currentTheme.colors.secondary,
                                        borderColor: currentTheme.colors.border,
                                    }
                                ]}
                                onPress={() => setWeatherCondition(weather)}
                            >
                                <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
                                    {weather.charAt(0).toUpperCase() + weather.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Animation Controls */}
                <View style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                        Animation Level
                    </Text>
                    <View style={styles.buttonGrid}>
                        {animationLevels.map((level) => (
                            <TouchableOpacity
                                key={level}
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: animationLevel === level
                                            ? currentTheme.colors.accent
                                            : currentTheme.colors.secondary,
                                        borderColor: currentTheme.colors.border,
                                    }
                                ]}
                                onPress={() => setAnimationLevel(level)}
                            >
                                <Text style={[styles.buttonText, { color: currentTheme.colors.text }]}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Theme Info */}
                <View style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                        Current Theme Details
                    </Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.colorSwatch}>
                            <View style={[styles.colorBox, { backgroundColor: currentTheme.colors.primary }]} />
                            <Text style={[styles.colorLabel, { color: currentTheme.colors.text }]}>Primary</Text>
                        </View>
                        <View style={styles.colorSwatch}>
                            <View style={[styles.colorBox, { backgroundColor: currentTheme.colors.secondary }]} />
                            <Text style={[styles.colorLabel, { color: currentTheme.colors.text }]}>Secondary</Text>
                        </View>
                        <View style={styles.colorSwatch}>
                            <View style={[styles.colorBox, { backgroundColor: currentTheme.colors.accent }]} />
                            <Text style={[styles.colorLabel, { color: currentTheme.colors.text }]}>Accent</Text>
                        </View>
                    </View>
                </View>

                {/* Usage Stats */}
                <View style={[styles.section, { backgroundColor: currentTheme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
                        Active Elements
                    </Text>
                    <Text style={[styles.infoText, { color: currentTheme.colors.text }]}>
                        Objects: {currentTheme.retroObjects.length} •
                        Particles: {currentTheme.particles.count} •
                        Atmosphere: {currentTheme.atmosphere.glow ? 'On' : 'Off'}
                    </Text>
                </View>
            </SafeAreaView>
        </EnhancedRetroBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.8,
    },
    section: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    autoButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    colorSwatch: {
        alignItems: 'center',
    },
    colorBox: {
        width: 30,
        height: 30,
        borderRadius: 6,
        marginBottom: 4,
    },
    colorLabel: {
        fontSize: 12,
    },
    infoText: {
        fontSize: 14,
        opacity: 0.8,
    },
});

export default ExampleApp;
