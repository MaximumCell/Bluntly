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
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { EnhancedRetroBackground, RetroTransition } from '@/components/animations';
import { User } from '@/types';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = () => {
  const { currentUser } = useCurrentUser();
  const { currentTheme, currentPeriod } = useEnhancedTheme();
  const {
    allUsers,
    onlineUsers,
    loading,
    error,
    isConnected,
    isConnecting,
    isReadMessagesLoaded,
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
    // Load all users on mount, but only after read messages are loaded
    if (isReadMessagesLoaded) {
      searchAllUsers();
    }
  }, [isReadMessagesLoaded]); // Only run when read messages are loaded

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
    if (isConnected && !isConnecting && isReadMessagesLoaded) {
      console.log('🔌 Socket connected - refreshing users and messages');
      // Automatically refresh users and last messages when socket connects
      searchAllUsers();
      if (allUsers.length > 0) {
        loadLastMessages();
      }
    }
  }, [isConnected, isConnecting, isReadMessagesLoaded, searchAllUsers, loadLastMessages, allUsers.length]);

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

      // Reload last messages to get the most current state, but only if read messages are loaded
      if (allUsers.length > 0 && isReadMessagesLoaded) {
        loadLastMessages();
      }

      // Force a re-render to ensure UI updates
      setLastUpdateTime(Date.now());
    }, [allUsers.length, loadLastMessages, isReadMessagesLoaded])
  ); const getUserDisplayName = (user: User) => {
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
  const renderUserItem = ({ item, index }: { item: User; index: number }) => (
    <RetroTransition type="slideUp" delay={index * 50}>
      <TouchableOpacity
        style={{
          marginHorizontal: 16,
          marginVertical: 6,
          borderRadius: 16,
          backgroundColor: currentTheme.colors.surface + '30',
          borderWidth: 1,
          borderColor: currentTheme.colors.primary + '40',
          shadowColor: currentTheme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
          overflow: 'hidden',
        }}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.8}
      >
        {/* Retro glow effect */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: currentTheme.colors.accent,
            opacity: 0.7,
          }}
        />

        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          {/* Profile Picture with retro border */}
          <View style={{ position: 'relative', marginRight: 16 }}>
            {item.profilePicture ? (
              <Image
                source={{ uri: item.profilePicture }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 3,
                  borderColor: isUserOnline(item._id)
                    ? currentTheme.colors.accent + 'AA'
                    : currentTheme.colors.primary + '60',
                }}
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: currentTheme.colors.primary + '80',
                  borderWidth: 3,
                  borderColor: isUserOnline(item._id)
                    ? currentTheme.colors.accent + 'AA'
                    : currentTheme.colors.primary + '60',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: currentTheme.colors.text,
                  fontWeight: 'bold',
                  fontSize: 20,
                  textShadowColor: currentTheme.colors.primary + '80',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {(item.firstName?.[0] || item.username[0]).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Enhanced online status with glow */}
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: isUserOnline(item._id) ? currentTheme.colors.accent : currentTheme.colors.text + '60',
                borderWidth: 3,
                borderColor: currentTheme.colors.surface,
                shadowColor: isUserOnline(item._id) ? currentTheme.colors.accent : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 3,
              }}
            />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            {/* Name and Time Row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text
                style={{
                  color: currentTheme.colors.text,
                  fontWeight: '600',
                  fontSize: 16,
                  textShadowColor: currentTheme.colors.primary + '40',
                  textShadowOffset: { width: 0.5, height: 0.5 },
                  textShadowRadius: 1,
                }}
                numberOfLines={1}
              >
                {getUserDisplayName(item)}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                {getLastMessage(item._id) && (
                  <Text style={{
                    color: currentTheme.colors.text + 'CC',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}>
                    {new Date(getLastMessage(item._id).createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                )}
                {getUnreadCount(item._id) > 0 && (
                  <Text style={{
                    color: currentTheme.colors.accent,
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                    textShadowColor: currentTheme.colors.accent + '80',
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 3,
                  }}>
                    {getUnreadCount(item._id)} new
                  </Text>
                )}
              </View>
            </View>

            {/* Message Preview */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                {getLastMessage(item._id) ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: getUnreadCount(item._id) > 0
                        ? currentTheme.colors.accent
                        : currentTheme.colors.text + 'DD',
                      fontWeight: getUnreadCount(item._id) > 0 ? '500' : '400',
                    }}
                    numberOfLines={1}
                  >
                    {getUnreadCount(item._id) > 0 && (
                      <Text style={{ color: currentTheme.colors.accent, fontWeight: '600' }}>
                        ● </Text>
                    )}
                    {getLastMessage(item._id).content}
                  </Text>
                ) : (
                  <Text style={{
                    color: currentTheme.colors.secondary,
                    fontSize: 14,
                    fontStyle: 'italic',
                    opacity: 0.8,
                  }}>
                    Start conversation
                  </Text>
                )}
              </View>

              {/* Unread Badge with retro glow */}
              {getUnreadCount(item._id) > 0 && (
                <View
                  style={{
                    backgroundColor: currentTheme.colors.accent,
                    borderRadius: 12,
                    minWidth: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                    shadowColor: currentTheme.colors.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text style={{
                    color: currentTheme.colors.surface,
                    fontSize: 11,
                    fontWeight: 'bold',
                    textShadowColor: currentTheme.colors.primary,
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1,
                  }}>
                    {getUnreadCount(item._id) > 99 ? '99+' : getUnreadCount(item._id)}
                  </Text>
                </View>
              )}
            </View>

            {/* Username */}
            <Text
              style={{
                color: currentTheme.colors.text + '80',
                fontSize: 12,
                fontFamily: 'monospace',
                opacity: 0.8,
              }}
              numberOfLines={1}
            >
              @{item.username}
            </Text>
          </View>

          {/* Retro chevron */}
          <View style={{ marginLeft: 8 }}>
            <Feather
              name="chevron-right"
              size={20}
              color={currentTheme.colors.primary}
              style={{ opacity: 0.6 }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </RetroTransition>
  );

  return (
    <View style={{ flex: 1 }}>
      <EnhancedRetroBackground
        intensity={1.5}
        showParticles={true}
        showObjects={true}
        showAtmosphere={true}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          {/* Header */}
          <RetroTransition type="slideUp" delay={0}>
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: currentTheme.colors.surface + 'CC',
              borderBottomWidth: 2,
              borderBottomColor: currentTheme.colors.primary + '30',
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: currentTheme.colors.text,
                marginBottom: 16,
                textShadowColor: currentTheme.colors.primary + '60',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
                textAlign: 'center',
              }}>
                Messages
              </Text>

              {/* Retro Search Bar */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: currentTheme.colors.surface + '60',
                borderRadius: 20,
                paddingHorizontal: 16,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: currentTheme.colors.primary + '40',
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }}>
                <Feather name="search" size={20} color={currentTheme.colors.primary} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: currentTheme.colors.text,
                    fontFamily: 'monospace',
                  }}
                  placeholder="Search users..."
                  placeholderTextColor={currentTheme.colors.text + '80'}
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchText('')}
                    style={{
                      padding: 4,
                      borderRadius: 12,
                      backgroundColor: currentTheme.colors.primary + '20',
                    }}
                  >
                    <Feather name="x" size={16} color={currentTheme.colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Enhanced Connection Status */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: currentTheme.colors.surface + '30',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: currentTheme.colors.primary + '30',
              }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginRight: 8,
                    backgroundColor: isConnecting
                      ? currentTheme.colors.accent + 'CC'
                      : (isConnected ? currentTheme.colors.accent : currentTheme.colors.text + '60'),
                    shadowColor: isConnected ? currentTheme.colors.accent : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                />
                <Text style={{
                  fontSize: 12,
                  color: currentTheme.colors.text + 'DD',
                  fontFamily: 'monospace',
                }}>
                  {isConnecting ? 'Connecting...' : (isConnected ? 'Connected' : 'Disconnected')} •
                  <Text style={{ color: currentTheme.colors.accent, fontWeight: '600' }}>
                    {' '}{onlineUsers.length} online
                  </Text>
                </Text>
              </View>
            </View>
          </RetroTransition>

          {/* Error Message */}
          {error && (
            <RetroTransition type="slideUp" delay={100}>
              <View style={{
                backgroundColor: currentTheme.colors.accent + '20',
                marginHorizontal: 16,
                marginVertical: 8,
                padding: 16,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: currentTheme.colors.accent,
                shadowColor: currentTheme.colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
              }}>
                <Text style={{
                  color: currentTheme.colors.text,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  Error: {error}
                </Text>
              </View>
            </RetroTransition>
          )}

          {/* Users List */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <RetroTransition type="scaleIn" delay={200}>
                <View style={{
                  backgroundColor: currentTheme.colors.surface + '40',
                  padding: 24,
                  borderRadius: 20,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: currentTheme.colors.primary + '40',
                  shadowColor: currentTheme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 6,
                }}>
                  <ActivityIndicator size="large" color={currentTheme.colors.primary} />
                  <Text style={{
                    marginTop: 16,
                    color: currentTheme.colors.text,
                    fontSize: 16,
                    fontWeight: '500',
                    textShadowColor: currentTheme.colors.primary + '40',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 2,
                  }}>
                    Loading users...
                  </Text>
                </View>
              </RetroTransition>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => `${item._id}-${lastUpdateTime}`}
              renderItem={renderUserItem}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[currentTheme.colors.primary]}
                  tintColor={currentTheme.colors.primary}
                  progressBackgroundColor={currentTheme.colors.surface}
                />
              }
              ListEmptyComponent={() => (
                <RetroTransition type="fadeIn" delay={300}>
                  <View style={{
                    paddingVertical: 40,
                    paddingHorizontal: 32,
                    alignItems: 'center',
                    backgroundColor: currentTheme.colors.surface + '30',
                    marginHorizontal: 16,
                    marginTop: 20,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: currentTheme.colors.primary + '30',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 4,
                  }}>
                    <View style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: currentTheme.colors.primary + '20',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: currentTheme.colors.primary + '40',
                    }}>
                      <Feather name="users" size={32} color={currentTheme.colors.primary} />
                    </View>
                    <Text style={{
                      color: currentTheme.colors.text,
                      textAlign: 'center',
                      fontSize: 16,
                      lineHeight: 24,
                      fontWeight: '500',
                      textShadowColor: currentTheme.colors.primary + '30',
                      textShadowOffset: { width: 0.5, height: 0.5 },
                      textShadowRadius: 2,
                    }}>
                      {searchText
                        ? `No users found for "${searchText}"`
                        : 'No users available'}
                    </Text>
                  </View>
                </RetroTransition>
              )}
            />
          )}
        </SafeAreaView>
      </EnhancedRetroBackground>
    </View>
  );
};

export default MessagesScreen;