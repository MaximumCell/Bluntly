import NoNotificationsFound from '@/components/NoNotificationsFound';
import NotificationCard from '@/components/NotificationCard';
import ThemeSettingsModal from '@/components/ThemeSettingsModal';
import { EnhancedRetroBackground, RetroTransition, RetroLoader } from '@/components/animations';
import { useNotification } from '@/hooks/useNotification';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { Notification } from '@/types';
import Feather from '@expo/vector-icons/build/Feather';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';


const NotificationScreen = () => {
  // ALL hooks must be called first
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } = useNotification();
  const { currentTheme, currentPeriod, animationLevel } = useEnhancedTheme();
  const insets = useSafeAreaInsets();
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // Early returns come AFTER all hooks
  if (error) {
    return (
      <EnhancedRetroBackground intensity={0.6}>
        <View className="flex-1 items-center justify-center p-8">
          <RetroTransition type="fadeIn">
            <Text className="text-gray-500 mb-4">Failed to load notifications</Text>
            <TouchableOpacity
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: currentTheme.colors.primary }}
              onPress={() => refetch()}
            >
              <Text style={{ color: currentTheme.colors.text }} className="font-semibold">Retry</Text>
            </TouchableOpacity>
          </RetroTransition>
        </View>
      </EnhancedRetroBackground>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <EnhancedRetroBackground
        intensity={0.8}
        showParticles={true}
        showObjects={true}
        showAtmosphere={true}
      >
        <SafeAreaView className='flex-1' edges={["top"]}>
          {/* Header */}
          <RetroTransition type="slideUp" delay={0}>
            <View
              className="flex-row items-center justify-between px-4 py-3 border-b"
              style={{
                borderBottomColor: currentTheme.colors.border,
                backgroundColor: currentTheme.colors.surface
              }}
            >
              <Text
                className="text-xl font-bold"
                style={{ color: currentTheme.colors.text }}
              >
                Notifications
              </Text>
              <TouchableOpacity onPress={() => setShowThemeSettings(true)}>
                <Feather name="settings" size={24} color={currentTheme.colors.primary} />
              </TouchableOpacity>
            </View>
          </RetroTransition>

          {/* Enhanced Theme Info Bar */}
          <RetroTransition type="slideUp" delay={100}>
            <View
              className="px-4 py-2 border-b"
              style={{
                backgroundColor: currentTheme.colors.surface,
                borderBottomColor: currentTheme.colors.border
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                />
                <Text className="text-sm" style={{ color: currentTheme.colors.text }}>
                  Current theme: <Text className="font-medium capitalize">
                    {currentPeriod}
                  </Text> • Animation: {animationLevel} • Hour: {new Date().getHours()}
                </Text>
              </View>
              {/* Color swatches */}
              <View className="flex-row items-center mt-2 space-x-2">
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: currentTheme.colors.secondary }}
                />
                <View
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                />
                <Text className="text-xs ml-2" style={{ color: currentTheme.colors.text }}>
                  Objects: {currentTheme.retroObjects?.length || 0} • Particles: {currentTheme.particles?.count || 0}
                </Text>
              </View>
            </View>
          </RetroTransition>

          {/* Notifications List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={currentTheme.colors.primary} />
            }
          >
            {isLoading ? (
              <View className="flex-1 items-center justify-center p-8">
                <RetroLoader size="large" text="Loading notifications..." style="neon" />
              </View>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification: Notification, index: number) => (
                <RetroTransition key={notification._id} type="slideUp" delay={index * 50}>
                  <NotificationCard
                    notification={notification}
                    onDelete={deleteNotification}
                  />
                </RetroTransition>
              ))
            ) : (
              <RetroTransition type="scaleIn" delay={300}>
                <NoNotificationsFound />
              </RetroTransition>
            )}
          </ScrollView>

          {/* Enhanced Theme Settings Modal */}
          <ThemeSettingsModal
            visible={showThemeSettings}
            onClose={() => setShowThemeSettings(false)}
          />
        </SafeAreaView>
      </EnhancedRetroBackground>
    </View>
  )
}

export default NotificationScreen