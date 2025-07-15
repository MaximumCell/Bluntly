import React, { useState, useRef, useCallback } from 'react'
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native'
import { Redirect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import PagerView from 'react-native-pager-view'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    runOnJS,
    useAnimatedReaction
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

// Import your tab components
import HomeScreen from './index'
import SearchScreen from './search'
import NotificationScreen from './notification'
import MessagesScreen from './messages'
import ProfileScreen from './profile'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const TabLayout = () => {
    const insets = useSafeAreaInsets()
    const [currentPage, setCurrentPage] = useState(0)
    const pagerRef = useRef<PagerView>(null)
    const pageOffset = useSharedValue(0)
    const tabBarTranslateX = useSharedValue(0)

    const { isSignedIn } = useAuth()
    if (!isSignedIn) {
        return <Redirect href="/(auth)" />
    }

    const tabs = [
        { name: 'Home', icon: 'home', component: HomeScreen },
        { name: 'Search', icon: 'search', component: SearchScreen },
        { name: 'Notifications', icon: 'bell', component: NotificationScreen },
        { name: 'Messages', icon: 'mail', component: MessagesScreen },
        { name: 'Profile', icon: 'user', component: ProfileScreen },
    ]

    const triggerHaptics = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [])

    const handlePageScroll = useCallback((e: any) => {
        const { position, offset } = e.nativeEvent
        pageOffset.value = position + offset

        // Smooth tab bar indicator movement
        tabBarTranslateX.value = (position + offset) * (SCREEN_WIDTH / tabs.length)
    }, [])

    const handlePageSelected = useCallback((e: any) => {
        const newPage = e.nativeEvent.position
        if (newPage !== currentPage) {
            setCurrentPage(newPage)
            runOnJS(triggerHaptics)()
        }
    }, [currentPage, triggerHaptics])

    const navigateToTab = useCallback((index: number) => {
        if (index !== currentPage) {
            pagerRef.current?.setPage(index)
            setCurrentPage(index)
            triggerHaptics()
        }
    }, [currentPage, triggerHaptics])

    // Animate tab bar indicator
    const tabBarIndicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: tabBarTranslateX.value }],
        }
    })

    // Animate tab icons based on page position
    const getTabIconStyle = (index: number) => {
        return useAnimatedStyle(() => {
            const inputRange = [index - 1, index, index + 1]
            const scale = interpolate(
                pageOffset.value,
                inputRange,
                [0.8, 1, 0.8],
                'clamp'
            )
            const opacity = interpolate(
                pageOffset.value,
                inputRange,
                [0.6, 1, 0.6],
                'clamp'
            )

            return {
                transform: [{ scale }],
                opacity,
            }
        })
    }

    return (
        <View style={styles.container}>
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

            {/* Custom Tab Bar */}
            <View style={[styles.tabBar, { height: 50 + insets.bottom, paddingTop: 8 }]}>
                <Animated.View style={[styles.tabBarIndicator, tabBarIndicatorStyle]} />
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.tabItem}
                        onPress={() => navigateToTab(index)}
                        activeOpacity={0.7}
                    >
                        <Animated.View style={getTabIconStyle(index)}>
                            <Feather
                                name={tab.icon as any}
                                size={24}
                                color={currentPage === index ? '#1DA1F2' : '#657786'}
                            />
                        </Animated.View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E1E8ED',
        position: 'relative',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    tabBarIndicator: {
        position: 'absolute',
        top: 0,
        height: 2,
        backgroundColor: '#1DA1F2',
        width: SCREEN_WIDTH / 5, // Divide by number of tabs
        borderRadius: 1,
    },
})

export default TabLayout