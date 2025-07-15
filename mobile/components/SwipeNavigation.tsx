import React, { ReactNode } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
    runOnJS,
    withSpring,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface SwipeNavigationProps {
    children: ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define tab routes in order
const TAB_ROUTES = [
    '/(tabs)',
    '/(tabs)/search',
    '/(tabs)/notification',
    '/(tabs)/messages',
    '/(tabs)/profile',
];

// Map routes to display names
const ROUTE_NAMES = {
    '/(tabs)': 'index',
    '/(tabs)/search': 'search',
    '/(tabs)/notification': 'notification',
    '/(tabs)/messages': 'messages',
    '/(tabs)/profile': 'profile',
};

const SwipeNavigation: React.FC<SwipeNavigationProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const translateX = useSharedValue(0);
    const isGestureActive = useSharedValue(false);
    const currentTabIndex = useSharedValue(0);

    const getCurrentTabIndex = () => {
        // Handle the root tab route
        if (pathname === '/' || pathname === '/(tabs)') {
            return 0;
        }

        const currentRoute = pathname.startsWith('/(tabs)') ? pathname : `/(tabs)${pathname}`;
        const index = TAB_ROUTES.indexOf(currentRoute);
        return index !== -1 ? index : 0;
    };

    // Update currentTabIndex when pathname changes
    React.useEffect(() => {
        currentTabIndex.value = getCurrentTabIndex();
    }, [pathname]);

    const navigateToTab = (direction: 'left' | 'right') => {
        const currentIndex = getCurrentTabIndex();
        let newIndex: number;

        if (direction === 'right' && currentIndex < TAB_ROUTES.length - 1) {
            newIndex = currentIndex + 1;
        } else if (direction === 'left' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else {
            return; // No navigation needed
        }

        // Haptic feedback for navigation
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const newRoute = TAB_ROUTES[newIndex];
        const routeName = ROUTE_NAMES[newRoute as keyof typeof ROUTE_NAMES];

        if (routeName === 'index') {
            router.push('/(tabs)');
        } else {
            router.push(`/(tabs)/${routeName}` as any);
        }
    };

    const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
        onStart: () => {
            isGestureActive.value = true;
        },
        onActive: (event) => {
            // Only allow horizontal swipes and limit the translation
            if (Math.abs(event.velocityX) > Math.abs(event.velocityY)) {
                const maxTranslateX = SCREEN_WIDTH * 0.5; // Limit to 50% of screen width

                // Prevent swiping beyond bounds
                let newTranslateX = event.translationX;

                if (newTranslateX > 0 && currentTabIndex.value === 0) {
                    // At first tab, reduce right swipe resistance
                    newTranslateX = newTranslateX * 0.3;
                } else if (newTranslateX < 0 && currentTabIndex.value === TAB_ROUTES.length - 1) {
                    // At last tab, reduce left swipe resistance
                    newTranslateX = newTranslateX * 0.3;
                }

                translateX.value = Math.max(-maxTranslateX, Math.min(maxTranslateX, newTranslateX));
            }
        },
        onEnd: (event) => {
            isGestureActive.value = false;
            const threshold = SCREEN_WIDTH * 0.25; // 25% of screen width
            const velocity = event.velocityX;

            if (Math.abs(translateX.value) > threshold || Math.abs(velocity) > 800) {
                if ((translateX.value > 0 || velocity > 0) && currentTabIndex.value > 0) {
                    // Swipe right - go to previous tab
                    runOnJS(navigateToTab)('left');
                } else if ((translateX.value < 0 || velocity < 0) && currentTabIndex.value < TAB_ROUTES.length - 1) {
                    // Swipe left - go to next tab
                    runOnJS(navigateToTab)('right');
                }
            }

            // Reset translateX with spring animation
            translateX.value = withSpring(0, {
                damping: 20,
                stiffness: 200,
            });
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.3],
            [1, 0.95],
            Extrapolate.CLAMP
        );

        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    scale,
                },
            ],
        };
    });

    // Background overlay style for visual feedback
    const overlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.3],
            [0, 0.1],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
        };
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle]} />
            <PanGestureHandler onGestureEvent={gestureHandler}>
                <Animated.View style={[styles.gestureContainer, animatedStyle]}>
                    {children}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gestureContainer: {
        flex: 1,
    },
});

export default SwipeNavigation;
