import { View, Text, ScrollView, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignOutButton from '@/components/SignOutButton'
import { useUserSync } from '@/hooks/useUserSync'
import { Ionicons } from '@expo/vector-icons'
import PostComposer from '@/components/PostComposer'
import PostsList from '@/components/PostsList'
import { usePosts } from '@/hooks/usePosts'
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext'
import EnhancedRetroBackground from '@/components/animations/EnhancedRetroBackground'
import RetroTransition from '@/components/animations/RetroTransition'

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const { refetch: refetchPosts } = usePosts();
  const { currentTheme, currentPeriod, animationLevel } = useEnhancedTheme();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);
    await refetchPosts();
    setIsRefetching(false);
  }

  useUserSync()

  return (
    <EnhancedRetroBackground
      intensity={1.5}
      showParticles={true}
      showObjects={true}
      showAtmosphere={true}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <RetroTransition type="fadeIn" delay={0}>
          <View
            className='flex-row justify-between items-center px-4 py-3'
            style={{
              backgroundColor: `${currentTheme.colors.surface}CC`, // Semi-transparent
              borderBottomWidth: 2,
              borderBottomColor: currentTheme.colors.border,
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: currentTheme.colors.primary + '20',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: currentTheme.colors.primary + '40',
            }}>
              <Ionicons name='flash' size={20} color={currentTheme.colors.primary} />
              <Text
                style={{
                  color: currentTheme.colors.primary,
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginLeft: 4,
                  letterSpacing: 0.5,
                }}
              >
                B
              </Text>
            </View>
            <Text
              className='text-xl font-bold'
              style={{ color: currentTheme.colors.text }}
            >
              Home
            </Text>
            <SignOutButton />
          </View>
        </RetroTransition>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className='flex-1'
          contentContainerStyle={{ paddingBottom: 80 }}
          style={{ backgroundColor: 'transparent' }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handlePullToRefresh}
              tintColor={currentTheme.colors.primary}
              colors={[currentTheme.colors.primary]}
              progressBackgroundColor={currentTheme.colors.surface}
            />
          }
        >
          <RetroTransition type="fadeIn" delay={100}>
            <PostComposer />
          </RetroTransition>

          <RetroTransition type="slideUp" delay={200}>
            <PostsList />
          </RetroTransition>
        </ScrollView>
      </SafeAreaView>
    </EnhancedRetroBackground>
  )
}

export default HomeScreen