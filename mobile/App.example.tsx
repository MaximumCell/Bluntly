import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { EnhancedThemeProvider } from '@/contexts/EnhancedThemeContext';
import ExampleApp from '@/components/ExampleApp';

const App: React.FC = () => {
    return (
        <EnhancedThemeProvider updateInterval={30000}> {/* Check every 30 seconds for demo */}
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <ExampleApp />
        </EnhancedThemeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
