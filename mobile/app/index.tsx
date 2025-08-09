import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, SafeAreaView } from 'react-native';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { EnhancedRetroBackground } from '@/components/animations';
import { RetroLoader } from '@/components/animations';

export default function Index() {
    const { isSignedIn, isLoaded } = useAuth();
    const { currentTheme } = useEnhancedTheme();

    // Show loading while auth state is loading
    if (!isLoaded) {
        return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor: Array.isArray(currentTheme.colors.background)
                    ? currentTheme.colors.background[0]
                    : currentTheme.colors.background
            }}>
                <EnhancedRetroBackground intensity={1.5}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 24,
                    }}>
                        <RetroLoader
                            size="large"
                            text="Initializing Bluntly..."
                            style="atom"
                        />
                    </View>
                </EnhancedRetroBackground>
            </SafeAreaView>
        );
    }

    // Redirect based on auth state
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)" />;
}
