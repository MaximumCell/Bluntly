import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages } from '@/hooks/useMessages';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { User } from '@/types';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = () => {
  const { currentUser } = useCurrentUser();
  const {
    allUsers,
    onlineUsers,
    loading,
    error,
    isConnected,
    isConnecting,
    searchAllUsers,
    clearError,
    isUserOnline,
    getUserActivity,
    getUnreadCount,
    getLastMessage,
    markMessagesAsRead,
    lastMessages,
    unreadCounts,
    loadLastMessages,
  } = useMessages();

  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

  useEffect(() => {
    // Load all users on mount
    searchAllUsers();
  }, []); // Only run once on mount

  // Listen for real-time updates to last messages and unread counts
  useEffect(() => {
    // This effect will trigger whenever lastMessages or unreadCounts change
    // causing the component to re-render and show new messages automatically
    console.log('📨 Real-time update detected - messages or unread counts updated');

    // Force a re-render by updating the timestamp
    setLastUpdateTime(Date.now());

    // Update filtered users to ensure they reflect the latest data
    if (Object.keys(lastMessages).length > 0 || Object.keys(unreadCounts).length > 0) {
      // Update filtered users to ensure they reflect the latest data
      const filtered = allUsers.filter(user => {
        // Always exclude current user
        if (user._id === currentUser?._id) return false;

        if (!searchText) return true;
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return (
          fullName.includes(searchText.toLowerCase()) ||
          user.username.toLowerCase().includes(searchText.toLowerCase())
        );
      });
      setFilteredUsers(filtered);
    }
  }, [lastMessages, unreadCounts, allUsers, searchText, currentUser?._id]);

  // Auto-refresh when socket connection is established
  useEffect(() => {
    if (isConnected && !isConnecting) {
      console.log('🔌 Socket connected - refreshing users and messages');
      // Automatically refresh users and last messages when socket connects
      searchAllUsers();
      if (allUsers.length > 0) {
        loadLastMessages();
      }
    }
  }, [isConnected, isConnecting, searchAllUsers, loadLastMessages, allUsers.length]);

  useEffect(() => {
    // Filter users based on search text and exclude current user
    const filtered = allUsers.filter(user => {
      // Always exclude current user
      if (user._id === currentUser?._id) return false;

      if (!searchText) return true;
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(searchText.toLowerCase()) ||
        user.username.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
  }, [allUsers, searchText, currentUser?._id]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Refresh messages when screen comes into focus (e.g., coming back from chat)
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 Messages screen focused - refreshing last messages');
      if (allUsers.length > 0) {
        loadLastMessages();
      }
    }, [allUsers.length, loadLastMessages])
  );

  const getUserDisplayName = (user: User) => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  };

  const handleUserPress = (user: User) => {
    // Mark messages as read for this user
    markMessagesAsRead(user._id);

    // Navigate to chat screen with user data
    router.push({
      pathname: '/chat',
      params: {
        userId: user._id,
        username: user.username,
        displayName: getUserDisplayName(user),
        profilePicture: user.profilePicture || '',
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered - reloading users and messages');
      await searchAllUsers();
      // Also reload last messages when manually refreshing
      await loadLastMessages();
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Render user item
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="px-4 py-4 border-b border-gray-200 flex-row items-center bg-white active:bg-gray-50"
      onPress={() => handleUserPress(item)}
    >
      {/* Profile Picture */}
      <View className="relative mr-3">
        {item.profilePicture ? (
          <Image
            source={{ uri: item.profilePicture }}
            className="w-14 h-14 rounded-full"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
            <Text className="text-white font-bold text-lg">
              {(item.firstName?.[0] || item.username[0]).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Online Status Indicator */}
        <View
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isUserOnline(item._id) ? 'bg-green-500' : 'bg-gray-400'
            }`}
        />
      </View>

      <View className="flex-1 min-w-0">
        {/* Name and Time Row */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-gray-900 font-semibold text-base flex-1" numberOfLines={1}>
            {getUserDisplayName(item)}
          </Text>
          <View className="items-end">
            {getLastMessage(item._id) && (
              <Text className="text-gray-400 text-xs">
                {new Date(getLastMessage(item._id).createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
            {/* New messages count below time */}
            {getUnreadCount(item._id) > 0 && (
              <Text className="text-green-500 text-xs font-semibold mt-0.5">
                {getUnreadCount(item._id)} new message{getUnreadCount(item._id) > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Message and Badge Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 min-w-0 mr-2">
            {getLastMessage(item._id) ? (
              <Text
                className={`text-sm ${getUnreadCount(item._id) > 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}
                numberOfLines={1}
              >
                {getUnreadCount(item._id) > 0 && (
                  <Text className="text-green-500 font-bold">New: </Text>
                )}
                {getLastMessage(item._id).content}
              </Text>
            ) : (
              <Text className="text-blue-500 text-sm italic">
                Start a new conversation
              </Text>
            )}
          </View>

          {/* Unread Badge */}
          {getUnreadCount(item._id) > 0 && (
            <View className="bg-green-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {getUnreadCount(item._id) > 99 ? '99+' : getUnreadCount(item._id)}
              </Text>
            </View>
          )}
        </View>

        {/* Username/Handle */}
        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
          @{item.username}
        </Text>
      </View>

      {/* Chevron */}
      <View className="ml-2">
        <Feather name="chevron-right" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Messages
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 mb-4">
          <Feather name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3 px-3 text-base text-gray-900"
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} className="p-1">
              <Feather name="x" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Connection Status */}
        <View className="flex-row items-center mt-3">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${isConnecting ? 'bg-orange-500' : (isConnected ? 'bg-green-500' : 'bg-red-500')
              }`}
          />
          <Text className="text-xs text-gray-600">
            {isConnecting ? 'Connecting...' : (isConnected ? 'Connected' : 'Disconnected')} • Online Users: {onlineUsers.length}
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 mx-4 my-4 p-3 rounded-lg border-l-4 border-red-500">
          <Text className="text-red-700 text-sm">Error: {error}</Text>
        </View>
      )}

      {/* Users List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-600">Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => `${item._id}-${lastUpdateTime}`} // Include timestamp to force re-render
          renderItem={renderUserItem}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']} // Android
              tintColor="#3B82F6" // iOS
            />
          }
          ListEmptyComponent={() => (
            <View className="py-10 px-10 items-center">
              <Feather name="users" size={48} color="#9CA3AF" />
              <Text className="text-gray-600 text-center mt-4 text-base leading-6">
                {searchText
                  ? `No users found for "${searchText}"`
                  : 'No users available'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default MessagesScreen;