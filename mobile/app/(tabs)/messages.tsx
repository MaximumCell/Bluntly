import React, { useState, useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useMessages, type Conversation, type Message } from "@/hooks/useMessages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import UserSearchModal from "@/components/UserSearchModal";

const MessagesScreen = () => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useCurrentUser();
  const [searchText, setSearchText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    sendMessage,
    sendingMessage,
    deleteConversation,
    deletingConversation,
    refetchConversations,
    refetchMessages,
  } = useMessages(selectedUserId || undefined);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation: Conversation) =>
    conversation.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    conversation.user.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDeleteConversation = (userId: string, userName: string) => {
    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete your conversation with ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConversation(userId);
          },
        },
      ]
    );
  };

  const openConversation = (userId: string) => {
    setSelectedUserId(userId);
    setIsChatOpen(true);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setIsChatOpen(true);
    setIsUserSearchOpen(false);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedUserId(null);
    setNewMessage("");
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUserId) {
      sendMessage({ receiverId: selectedUserId, content: newMessage.trim() });
      setNewMessage("");

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const selectedConversation = conversations.find((conv: Conversation) => conv._id === selectedUserId);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Messages</Text>
        <TouchableOpacity onPress={() => setIsUserSearchOpen(true)}>
          <Feather name="edit" size={24} color="#1DA1F2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search conversations..."
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Feather name="x-circle" size={20} color="#657786" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONVERSATIONS LIST */}
      <View className="flex-1">
        {conversationsLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1DA1F2" />
            <Text className="text-gray-500 mt-2">Loading conversations...</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View className="flex-1 justify-center items-center px-4">
            <Feather name="message-circle" size={64} color="#e5e7eb" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              {searchText ? "No conversations found" : "No messages yet"}
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              {searchText
                ? "Try searching for a different name or username"
                : "Start a conversation with someone!"
              }
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={conversationsLoading} onRefresh={refetchConversations} />
            }
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          >
            {filteredConversations.map((conversation: Conversation) => (
              <TouchableOpacity
                key={conversation._id}
                className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                onPress={() => openConversation(conversation._id)}
                onLongPress={() => handleDeleteConversation(conversation._id, conversation.user.name)}
              >
                <Image
                  source={{
                    uri: conversation.user.avatar || 'https://via.placeholder.com/100x100?text=?'
                  }}
                  className="size-12 rounded-full mr-3"
                />

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center gap-1">
                      <Text className="font-semibold text-gray-900">{conversation.user.name}</Text>
                      {conversation.user.verified && (
                        <Feather name="check-circle" size={16} color="#1DA1F2" />
                      )}
                      <Text className="text-gray-500 text-sm">@{conversation.user.username}</Text>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {formatMessageTime(conversation.lastMessage.createdAt)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-500 flex-1 mr-2" numberOfLines={1}>
                      {conversation.lastMessage.senderId === currentUser?._id ? "You: " : ""}
                      {conversation.lastMessage.content}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View className="bg-blue-500 rounded-full px-2 py-1 min-w-[20px] items-center">
                        <Text className="text-white text-xs font-semibold">
                          {conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick Actions */}
      <View className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <Text className="text-xs text-gray-500 text-center">
          Tap to open • Long press to delete
        </Text>
      </View>

      {/* CHAT MODAL */}
      <Modal visible={isChatOpen} animationType="slide" presentationStyle="pageSheet">
        {selectedConversation && (
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <SafeAreaView className="flex-1">
              {/* Chat Header */}
              <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={closeChatModal} className="mr-3">
                  <Feather name="arrow-left" size={24} color="#1DA1F2" />
                </TouchableOpacity>
                <Image
                  source={{
                    uri: selectedConversation.user.avatar || 'https://via.placeholder.com/100x100?text=?'
                  }}
                  className="size-10 rounded-full mr-3"
                />
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-semibold text-gray-900 mr-1">
                      {selectedConversation.user.name}
                    </Text>
                    {selectedConversation.user.verified && (
                      <Feather name="check-circle" size={16} color="#1DA1F2" />
                    )}
                  </View>
                  <Text className="text-gray-500 text-sm">@{selectedConversation.user.username}</Text>
                </View>
              </View>

              {/* Chat Messages Area */}
              <View className="flex-1 bg-gray-50">
                {messagesLoading ? (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1DA1F2" />
                    <Text className="text-gray-500 mt-2">Loading messages...</Text>
                  </View>
                ) : (
                  <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl refreshing={messagesLoading} onRefresh={refetchMessages} />
                    }
                  >
                    {messages.length === 0 ? (
                      <View className="flex-1 justify-center items-center py-8">
                        <Text className="text-center text-gray-400 text-sm">
                          This is the beginning of your conversation with {selectedConversation.user.name}
                        </Text>
                      </View>
                    ) : (
                      messages.map((message: Message) => {
                        const isFromCurrentUser = message.senderId === currentUser?._id;
                        return (
                          <View
                            key={message._id}
                            className={`flex-row mb-4 ${isFromCurrentUser ? "justify-end" : ""}`}
                          >
                            {!isFromCurrentUser && (
                              <Image
                                source={{
                                  uri: selectedConversation.user.avatar || 'https://via.placeholder.com/100x100?text=?'
                                }}
                                className="size-8 rounded-full mr-2 mt-1"
                              />
                            )}
                            <View className={`flex-1 ${isFromCurrentUser ? "items-end" : ""}`}>
                              <View
                                className={`rounded-2xl px-4 py-3 max-w-xs ${isFromCurrentUser
                                    ? "bg-blue-500 rounded-br-md"
                                    : "bg-white rounded-bl-md shadow-sm"
                                  }`}
                              >
                                <Text className={isFromCurrentUser ? "text-white" : "text-gray-900"}>
                                  {message.content}
                                </Text>
                              </View>
                              <Text className="text-xs text-gray-400 mt-1">
                                {formatMessageTime(message.createdAt)}
                              </Text>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                )}
              </View>

              {/* Message Input */}
              <View className="flex-row items-end px-4 py-3 border-t border-gray-100 bg-white">
                <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-3 mr-3">
                  <TextInput
                    className="flex-1 text-base max-h-20"
                    placeholder="Type a message..."
                    placeholderTextColor="#657786"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSendMessage}
                  className={`size-12 rounded-full items-center justify-center ${newMessage.trim() && !sendingMessage ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Feather name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        )}
      </Modal>

      {/* USER SEARCH MODAL */}
      <UserSearchModal
        visible={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        onSelectUser={handleUserSelect}
      />
    </SafeAreaView>
  );
};

export default MessagesScreen;