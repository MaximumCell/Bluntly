import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

interface AuthWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
    children,
    fallback = (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
    )
}) => {
    const { isLoaded } = useAuth();

    // Show loading until auth state is fully loaded
    if (!isLoaded) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default AuthWrapper;
