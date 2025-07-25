import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useMessages } from '@/hooks/useMessages';
import { useUsers, User } from '@/hooks/useUsers';
import { Message } from '@/types';

const MessagesScreen = () => {
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const {
    messages,
    onlineUsers,
    loading: messagesLoading,
    error: messagesError,
    isConnected,
    fetchMessages,
    sendMessage,
    updateActivity,
    clearError,
    isUserOnline,
    getUserActivity,
  } = useMessages();

  const {
    users,
    loading: usersLoading,
    error: usersError,
    fetchUsers,
  } = useUsers();

  // Filter users based on search text and exclude current user
  useEffect(() => {
    const filtered = users.filter(user => {
      if (user.id === userId) return false; // Exclude current user
      if (!searchText) return true;

      return (
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.username.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredUsers(filtered);
  }, [users, searchText, userId]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (messagesError) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [messagesError, clearError]);

  const deleteUser = (user: User) => {
    Alert.alert('Remove User', `Are you sure you want to remove ${user.name} from your messages?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          // In a real app, you might want to delete the conversation history
          console.log(`Removed user: ${user.username}`);
        },
      },
    ]);
  };

  const openConversation = (user: User) => {
    setSelectedUser(user);
    setIsChatOpen(true);
    // Fetch real messages for this user
    fetchMessages(user.username);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedUser(null);
    setMessageInput('');
    setIsTyping(false);
    updateActivity('Idle');
  };

  // Handle typing activity
  const handleInputChange = (text: string) => {
    setMessageInput(text);

    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      updateActivity('Typing');
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      updateActivity('Idle');
    }
  };

  // Send real-time message
  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (!isConnected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    if (!selectedUser) {
      Alert.alert('Error', 'No user selected');
      return;
    }

    // Send message via socket
    sendMessage(selectedUser.username, messageInput.trim());

    setMessageInput('');
    setIsTyping(false);
    updateActivity('Idle');
  };  // Render real-time message
  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === userId;

    return (
      <View
        className={`mb-3 flex-row ${isMyMessage ? 'justify-end' : ''}`}
      >
        {!isMyMessage && selectedUser && (
          <Image
            source={{ uri: selectedUser.avatar }}
            className="size-8 rounded-full mr-2"
          />
        )}
        <View className={`flex-1 ${isMyMessage ? 'items-end' : ''}`}>
          <View
            className={`rounded-2xl px-4 py-3 max-w-xs ${isMyMessage ? 'bg-blue-500' : 'bg-gray-100'
              }`}
          >
            <Text className={isMyMessage ? 'text-white' : 'text-gray-900'}>
              {item.content}
            </Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <View className="flex-row items-center">
          {/* Connection Status */}
          <View className="flex-row items-center mr-3">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <Text className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          <TouchableOpacity>
            <Feather name="edit" size={24} color="#1DA1F2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {(messagesError || usersError) && (
        <View className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-600 text-sm">
            Error: {messagesError || usersError}
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search for people and groups"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* USERS LIST */}
      {usersLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text className="mt-4 text-gray-500">Loading users...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        >
          {filteredUsers.length === 0 ? (
            <View className="flex-1 justify-center items-center p-8">
              <Feather name="users" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-4">
                {searchText ? 'No users found matching your search' : 'No users available to chat with'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => {
              const isOnline = isUserOnline(user.username);
              const userActivity = getUserActivity(user.username);

              return (
                <TouchableOpacity
                  key={user.id}
                  className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                  onPress={() => openConversation(user)}
                  onLongPress={() => deleteUser(user)}
                >
                  <View className="relative">
                    <Image
                      source={{ uri: user.avatar }}
                      className="size-12 rounded-full mr-3"
                    />
                    {/* Online Status Indicator */}
                    <View
                      className={`absolute -bottom-0 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center gap-1">
                        <Text className="font-semibold text-gray-900">{user.name}</Text>
                        {user.verified && (
                          <Feather name="check-circle" size={16} color="#1DA1F2" className="ml-1" />
                        )}
                        <Text className="text-gray-500 text-sm ml-1">@{user.username}</Text>
                      </View>
                      {isOnline && (
                        <Text className="text-xs text-green-500">Online</Text>
                      )}
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-500 flex-1" numberOfLines={1}>
                        {user.bio || 'Start a conversation'}
                      </Text>
                      {/* Activity Status */}
                      {isOnline && userActivity && userActivity !== 'Idle' && (
                        <Text className="text-xs text-blue-500 ml-2">{userActivity}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open • Long press to delete • Online users: {onlineUsers.length}
        </Text>
      </View>
      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedUser && (
          <SafeAreaView className="flex-1">
            {/* Chat Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
              <TouchableOpacity onPress={closeChatModal} className="mr-3">
                <Feather name="arrow-left" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <Image
                source={{ uri: selectedUser.avatar }}
                className="size-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-gray-900 mr-1">
                    {selectedUser.name}
                  </Text>
                  {selectedUser.verified && (
                    <Feather name="check-circle" size={16} color="#1DA1F2" />
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm">@{selectedUser.username}</Text>
                  {isConnected && (
                    <>
                      <Text className="text-gray-400 text-sm mx-1">•</Text>
                      <Text className={`text-sm ${isUserOnline(selectedUser.username) ? 'text-green-500' : 'text-gray-400'}`}>
                        {isUserOnline(selectedUser.username) ? 'Online' : 'Offline'}
                      </Text>
                      {getUserActivity(selectedUser.username) && getUserActivity(selectedUser.username) !== 'Idle' && (
                        <>
                          <Text className="text-gray-400 text-sm mx-1">•</Text>
                          <Text className="text-blue-500 text-sm">{getUserActivity(selectedUser.username)}</Text>
                        </>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Chat Messages Area */}
            {messagesLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1DA1F2" />
                <Text className="mt-4 text-gray-500">Loading messages...</Text>
              </View>
            ) : (
              <FlatList
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessage}
                className="flex-1 px-4"
                contentContainerStyle={{ paddingVertical: 16 }}
                showsVerticalScrollIndicator={false}
                inverted={false}
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-center text-gray-400 text-sm">
                      This is the beginning of your conversation with {selectedUser.name}
                    </Text>
                  </View>
                }
              />
            )}

            {/* Message Input */}
            <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
              <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                <TextInput
                  className="flex-1 text-base"
                  placeholder="Start a message..."
                  placeholderTextColor="#657786"
                  value={messageInput}
                  onChangeText={handleInputChange}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity
                onPress={handleSendMessage}
                className={`size-10 rounded-full items-center justify-center ${messageInput.trim() && isConnected ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                disabled={!messageInput.trim() || !isConnected}
              >
                <Feather name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Typing Indicator */}
            {isTyping && (
              <View className="px-4 pb-2">
                <Text className="text-xs text-gray-500">You are typing...</Text>
              </View>
            )}
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default MessagesScreen;