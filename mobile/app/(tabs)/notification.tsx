import NoNotificationsFound from '@/components/NoNotificationsFound';
import NotificationCard from '@/components/NotificationCard';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/types';
import Feather from '@expo/vector-icons/build/Feather';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';


const NotificationScreen = () => {
  // ALL hooks must be called first
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } = useNotification();
  const insets = useSafeAreaInsets();
  // console.log("Notifications:", notifications);

  // Early returns come AFTER all hooks
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500 mb-4">Failed to load notifications</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    <SafeAreaView className='flex-1 bg-white' edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Notifications</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#657786" />
        </TouchableOpacity>
      </View>
      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={"#1DA1F2"} />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color="#1DA1F2" />
            <Text className="text-gray-500 mt-4">Loading notifications...</Text>
          </View>
        ) : !notifications ? (
          <NoNotificationsFound />
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onDelete={deleteNotification}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default NotificationScreen