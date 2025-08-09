import React, { useState, useRef, useCallback } from 'react'
import { View, Dimensions, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Redirect } from 'expo-router'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import PagerView from 'react-native-pager-view'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    runOnJS,
    withTiming,
    useAnimatedReaction
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext'
import { EnhancedRetroBackground, RetroTransition } from '@/components/animations'

// Import your tab components
import HomeScreen from './index'
import SearchScreen from './search'
import NotificationScreen from './notification'
import MessagesScreen from './messages'
import ProfileScreen from './profile'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TabLayout = () => {
    const { isSignedIn, isLoaded } = useAuth()
    const { currentTheme, currentPeriod } = useEnhancedTheme()

    // Wait for auth to load before making decisions
    if (!isLoaded) {
        return null; // or a loading screen
    }

    // Check authentication BEFORE declaring other hooks
    if (!isSignedIn) {
        return <Redirect href="/(auth)" />
    }

    const insets = useSafeAreaInsets()
    const [currentPage, setCurrentPage] = useState(0)
    const pagerRef = useRef<PagerView>(null)
    const pageOffset = useSharedValue(0)
    const tabBarTranslateX = useSharedValue(0)
    const indicatorScale = useSharedValue(1)

    const tabs = [
        {
            name: 'Home',
            icon: 'home-outline',
            activeIcon: 'home',
            iconLibrary: 'Ionicons' as 'Ionicons' | 'Feather',
            component: HomeScreen
        },
        {
            name: 'Search',
            icon: 'search-outline',
            activeIcon: 'search',
            iconLibrary: 'Ionicons' as 'Ionicons' | 'Feather',
            component: SearchScreen
        },
        {
            name: 'Notifications',
            icon: 'heart-outline',
            activeIcon: 'heart',
            iconLibrary: 'Ionicons' as 'Ionicons' | 'Feather',
            component: NotificationScreen
        },
        {
            name: 'Messages',
            icon: 'chatbubble-outline',
            activeIcon: 'chatbubble',
            iconLibrary: 'Ionicons' as 'Ionicons' | 'Feather',
            component: MessagesScreen
        },
        {
            name: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            iconLibrary: 'Ionicons' as 'Ionicons' | 'Feather',
            component: ProfileScreen
        },
    ]

    const triggerHaptics = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, [])

    const handlePageScroll = useCallback((e: any) => {
        const { position, offset } = e.nativeEvent
        pageOffset.value = position + offset

        // Smooth tab bar indicator movement with enhanced spring animation
        const targetTranslateX = (position + offset) * (SCREEN_WIDTH / tabs.length)
        tabBarTranslateX.value = withSpring(targetTranslateX, {
            damping: 20,
            stiffness: 200,
            mass: 0.8,
        })

        // Pulse effect on indicator during scroll
        indicatorScale.value = withTiming(1.1, { duration: 100 })
        setTimeout(() => {
            indicatorScale.value = withTiming(1, { duration: 200 })
        }, 100)
    }, [])

    const handlePageSelected = useCallback((e: any) => {
        const newPage = e.nativeEvent.position
        if (newPage !== currentPage) {
            setCurrentPage(newPage)
            runOnJS(triggerHaptics)()

            // Enhanced indicator animation on page change
            indicatorScale.value = withSpring(1.3, {
                damping: 15,
                stiffness: 300
            }, () => {
                indicatorScale.value = withSpring(1, {
                    damping: 20,
                    stiffness: 200
                })
            })
        }
    }, [currentPage, triggerHaptics])

    const navigateToTab = useCallback((index: number) => {
        if (index !== currentPage) {
            pagerRef.current?.setPage(index)
            setCurrentPage(index)
            triggerHaptics()
        }
    }, [currentPage, triggerHaptics])

    // Enhanced tab bar indicator with retro glow
    const tabBarIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: tabBarTranslateX.value },
                { scaleY: indicatorScale.value }
            ],
        }
    })

    // Enhanced tab icons with better animations
    const getTabIconStyle = (index: number) => {
        return useAnimatedStyle(() => {
            const inputRange = [index - 1, index, index + 1]
            const scale = interpolate(
                pageOffset.value,
                inputRange,
                [0.85, 1.2, 0.85],
                'clamp'
            )
            const opacity = interpolate(
                pageOffset.value,
                inputRange,
                [0.6, 1, 0.6],
                'clamp'
            )

            const translateY = interpolate(
                pageOffset.value,
                inputRange,
                [0, -3, 0],
                'clamp'
            )

            return {
                transform: [
                    { scale },
                    { translateY }
                ],
                opacity,
            }
        })
    }

    // Render icon based on library
    const renderIcon = (tab: typeof tabs[0], index: number, isActive: boolean) => {
        const iconName = isActive ? tab.activeIcon : tab.icon
        const iconColor = isActive ? currentTheme.colors.primary : currentTheme.colors.text + '80'
        const iconSize = 28

        if (tab.iconLibrary === 'Ionicons') {
            return (
                <Ionicons
                    name={iconName as any}
                    size={iconSize}
                    color={iconColor}
                />
            )
        } else {
            return (
                <Feather
                    name={iconName as any}
                    size={iconSize}
                    color={iconColor}
                />
            )
        }
    }

    return (
        <EnhancedRetroBackground
            intensity={0.3}
            showParticles={true}
            showObjects={false}
            showAtmosphere={true}
        >
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <PagerView
                    ref={pagerRef}
                    style={styles.pagerView}
                    initialPage={0}
                    onPageScroll={handlePageScroll}
                    onPageSelected={handlePageSelected}
                    scrollEnabled={true}
                    orientation="horizontal"
                    overdrag={false}
                >
                    {tabs.map((tab, index) => (
                        <View key={index} style={styles.page}>
                            <tab.component />
                        </View>
                    ))}
                </PagerView>

                {/* Enhanced Custom Tab Bar */}
                <RetroTransition type="slideUp" delay={0}>
                    <View style={[
                        styles.tabBar,
                        {
                            height: 60 + insets.bottom,
                            paddingTop: 8,
                            paddingBottom: insets.bottom + 4,
                            backgroundColor: currentTheme.colors.surface + 'F8',
                            borderTopColor: currentTheme.colors.primary + '20',
                            shadowColor: currentTheme.colors.primary,
                        }
                    ]}>
                        {/* Minimalist Retro Indicator */}
                        <Animated.View style={[
                            styles.tabBarIndicator,
                            {
                                backgroundColor: currentTheme.colors.primary,
                                shadowColor: currentTheme.colors.primary,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 4,
                                elevation: 3,
                            },
                            tabBarIndicatorStyle
                        ]} />

                        {/* Clean Tab Buttons */}
                        {tabs.map((tab, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.tabItem}
                                onPress={() => navigateToTab(index)}
                                activeOpacity={0.7}
                            >
                                <Animated.View style={[
                                    getTabIconStyle(index),
                                    {
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                    }
                                ]}>
                                    {renderIcon(tab, index, currentPage === index)}
                                </Animated.View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </RetroTransition>
            </View>
        </EnhancedRetroBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        position: 'relative',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    tabBarIndicator: {
        position: 'absolute',
        top: 0,
        height: 2,
        width: SCREEN_WIDTH / 5,
        borderRadius: 1,
    },
})

export default TabLayout