import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

interface Props {
    children?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Log the error with more details for hook errors
        if (error.message.includes('Rendered fewer hooks than expected')) {
            console.error('Hook ordering error detected:', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            });
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });

        // If it's a hook error, try to navigate to a safe screen
        if (this.state.error?.message.includes('Rendered fewer hooks than expected')) {
            try {
                router.replace('/(tabs)');
            } catch (navError) {
                console.error('Navigation error during reset:', navError);
            }
        }
    };

    public render() {
        if (this.state.hasError) {
            const isHookError = this.state.error?.message.includes('Rendered fewer hooks than expected');

            return (
                <View className="flex-1 justify-center items-center p-4 bg-white">
                    <Text className="text-lg font-bold text-red-500 mb-4">
                        {isHookError ? 'App State Error' : 'Something went wrong'}
                    </Text>
                    <Text className="text-gray-600 mb-4 text-center">
                        {isHookError
                            ? 'The app encountered a rendering issue. This is usually temporary.'
                            : (this.state.error?.message || 'An unexpected error occurred')
                        }
                    </Text>
                    <TouchableOpacity
                        className="bg-blue-500 px-6 py-3 rounded-lg"
                        onPress={this.handleReset}
                    >
                        <Text className="text-white font-semibold">
                            {isHookError ? 'Restart App' : 'Try Again'}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
