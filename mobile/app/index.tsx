import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { isSignedIn, isLoaded } = useAuth();

    // Show loading while auth state is loading
    if (!isLoaded) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    // Redirect based on auth state
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)" />;
}
