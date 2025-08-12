import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessages } from '@/hooks/useMessages';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Message } from '@/types';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ChatScreen = () => {
    const navigation = useNavigation();
    const { userId, username, displayName, profilePicture } = useLocalSearchParams<{
        userId: string;
        username: string;
        displayName: string;
        profilePicture: string;
    }>();

    const { currentUser } = useCurrentUser();
    const {
        messages,
        loading,
        error,
        isConnected,
        fetchMessages,
        sendMessage,
        sendMessageHTTP,
        updateActivity,
        clearError,
        isUserOnline,
        getUserActivity,
        markMessagesAsRead,
    } = useMessages();

    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [shouldScrollToEnd, setShouldScrollToEnd] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchMessages(userId);
            // Mark messages as read when opening chat
            markMessagesAsRead(userId);
            // Set flag to scroll to end when messages load
            setShouldScrollToEnd(true);
        }
    }, [userId, fetchMessages, markMessagesAsRead]);

    // Scroll to bottom when messages are loaded or updated
    useEffect(() => {
        if (messages.length > 0 && shouldScrollToEnd && flatListRef.current) {
            // Use a longer timeout to ensure the FlatList has rendered
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                setShouldScrollToEnd(false); // Reset flag after scrolling
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [messages, shouldScrollToEnd]);

    // Auto-scroll to new messages when they arrive
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            // Small delay to ensure the message is rendered
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [messages.length]); // Trigger when message count changes

    // Auto-scroll when returning to chat
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (messages.length > 0 && flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 200);
            }
        });

        return unsubscribe;
    }, [navigation, messages.length]);

    useEffect(() => {
        // Clear error after 5 seconds
        if (error) {
            const timer = setTimeout(clearError, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

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

    // Send message
    const handleSendMessage = async () => {
        if (!messageInput.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'Invalid user');
            return;
        }

        if (!isConnected) {
            // Fallback to HTTP API if socket is not connected
            const result = await sendMessageHTTP(userId, messageInput.trim());
            if (result && result.success) {
                setMessageInput('');
                setIsTyping(false);
                updateActivity('Idle');

                // Scroll to bottom after sending message
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } else {
                Alert.alert('Error', 'Failed to send message. Please try again.');
            }
            return;
        }

        sendMessage(userId, messageInput.trim());
        setMessageInput('');
        setIsTyping(false);
        updateActivity('Idle');

        // Scroll to bottom after sending message
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const getMessageSenderName = (message: Message) => {
        if (typeof message.senderId === 'object') {
            const sender = message.senderId;
            return sender.firstName && sender.lastName
                ? `${sender.firstName} ${sender.lastName}`
                : sender.username;
        }
        return message.senderId === currentUser?._id ? 'You' : 'Unknown';
    };

    const isMyMessage = (message: Message) => {
        const senderId = typeof message.senderId === 'object'
            ? message.senderId._id
            : message.senderId;
        return senderId === currentUser?._id;
    };

    // Render message item
    const renderMessage = ({ item }: { item: Message }) => {
        const isOwn = isMyMessage(item);

        return (
            <View
                style={{
                    padding: 12,
                    marginVertical: 4,
                    marginHorizontal: 16,
                    backgroundColor: isOwn ? '#007AFF' : '#E5E5EA',
                    borderRadius: 18,
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                }}
            >
                {!isOwn && (
                    <Text
                        style={{
                            color: 'rgba(0,0,0,0.6)',
                            fontSize: 11,
                            marginBottom: 4,
                            fontWeight: 'bold',
                        }}
                    >
                        {getMessageSenderName(item)}
                    </Text>
                )}
                <Text
                    style={{
                        color: isOwn ? 'white' : 'black',
                        fontSize: 16,
                        lineHeight: 20,
                    }}
                >
                    {item.content}
                </Text>
                <Text
                    style={{
                        color: isOwn ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                        fontSize: 11,
                        marginTop: 4,
                    }}
                >
                    {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: 'white',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ marginRight: 12 }}
                >
                    <Feather name="arrow-left" size={24} color="#007AFF" />
                </TouchableOpacity>

                {/* Profile Picture - Clickable */}
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/userProfile',
                        params: { username: username }
                    })}
                    style={{ marginRight: 12 }}
                >
                    {profilePicture ? (
                        <Image
                            source={{ uri: profilePicture }}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                            }}
                        />
                    ) : (
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: '#007AFF',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                {displayName?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/userProfile',
                            params: { username: username }
                        })}
                    >
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                            {displayName || username}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isUserOnline(userId || '') ? '#00C851' : '#999',
                                marginRight: 6,
                            }}
                        />
                        <Text style={{ fontSize: 12, color: '#666' }}>
                            {isUserOnline(userId || '') ? 'Online' : 'Offline'}
                            {userId && getUserActivity(userId) && getUserActivity(userId) !== 'Idle' && getUserActivity(userId) !== 'Offline' && ` • ${getUserActivity(userId)}`}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Error Message */}
            {error && (
                <View
                    style={{
                        backgroundColor: '#FFE6E6',
                        padding: 12,
                        margin: 16,
                        borderRadius: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: '#FF4444',
                    }}
                >
                    <Text style={{ color: '#CC0000', fontSize: 14 }}>Error: {error}</Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                {/* Messages List */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={{ marginTop: 16, color: '#666' }}>Loading messages...</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={renderMessage}
                        style={{ flex: 1, backgroundColor: '#F8F9FA' }}
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={() => {
                            if (shouldScrollToEnd) {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                        onLayout={() => {
                            if (shouldScrollToEnd && messages.length > 0) {
                                setTimeout(() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }, 100);
                            }
                        }}
                        ListEmptyComponent={() => (
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 40,
                                minHeight: 200
                            }}>
                                <Feather name="message-circle" size={48} color="#999" />
                                <Text style={{
                                    color: '#666',
                                    textAlign: 'center',
                                    marginTop: 16,
                                    fontSize: 16
                                }}>
                                    No messages yet.{'\n'}Start the conversation!
                                </Text>
                            </View>
                        )}
                    />
                )}

                {/* Message Input */}
                <View
                    style={{
                        padding: 16,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#E5E5EA',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        <TextInput
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: '#E5E5EA',
                                borderRadius: 20,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                fontSize: 16,
                                marginRight: 12,
                                maxHeight: 100,
                                minHeight: 44,
                                color: '#000',
                            }}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            value={messageInput}
                            onChangeText={handleInputChange}
                            onFocus={() => {
                                // Scroll to bottom when keyboard appears
                                setTimeout(() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }, 300);
                            }}
                            multiline
                            maxLength={500}
                            textAlignVertical="center"
                        />
                        <TouchableOpacity
                            onPress={handleSendMessage}
                            disabled={!messageInput.trim()}
                            style={{
                                backgroundColor: messageInput.trim() ? '#007AFF' : '#E5E5EA',
                                padding: 12,
                                borderRadius: 22,
                                width: 44,
                                height: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Feather
                                name="send"
                                size={20}
                                color={messageInput.trim() ? 'white' : '#999'}
                            />
                        </TouchableOpacity>
                    </View>

                    {isTyping && (
                        <Text style={{
                            fontSize: 12,
                            color: '#999',
                            marginTop: 8,
                            marginLeft: 16
                        }}>
                            You are typing...
                        </Text>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChatScreen;
