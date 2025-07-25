import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useMessages } from '../hooks/useMessages';
import { Message } from '../types';

interface MessagesScreenProps {
    receiverId?: string;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
    receiverId = 'test_user_123' // Default test user ID
}) => {
    const {
        messages,
        users,
        onlineUsers,
        loading,
        error,
        isConnected,
        fetchMessages,
        sendMessage,
        updateActivity,
        clearError,
        isUserOnline,
        getUserActivity,
    } = useMessages();

    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Fetch messages when component mounts
        if (receiverId) {
            fetchMessages(receiverId);
        }
    }, [receiverId, fetchMessages]);

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
    const handleSendMessage = () => {
        if (!messageInput.trim()) {
            Alert.alert('Error', 'Please enter a message');
            return;
        }

        if (!isConnected) {
            Alert.alert('Error', 'Not connected to server');
            return;
        }

        sendMessage(receiverId, messageInput.trim());
        setMessageInput('');
        setIsTyping(false);
        updateActivity('Idle');
    };

    // Render message item
    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId !== receiverId;

        return (
            <View
                style={{
                    padding: 12,
                    marginVertical: 4,
                    marginHorizontal: 16,
                    backgroundColor: isMyMessage ? '#007AFF' : '#E5E5EA',
                    borderRadius: 18,
                    alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                }}
            >
                <Text
                    style={{
                        color: isMyMessage ? 'white' : 'black',
                        fontSize: 16,
                    }}
                >
                    {item.content}
                </Text>
                <Text
                    style={{
                        color: isMyMessage ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                        fontSize: 12,
                        marginTop: 4,
                    }}
                >
                    {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                    backgroundColor: '#F8F9FA',
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    Messages - Test Chat
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isConnected ? '#00C851' : '#FF4444',
                            marginRight: 8,
                        }}
                    />
                    <Text style={{ fontSize: 14, color: '#666' }}>
                        {isConnected ? 'Connected' : 'Disconnected'} •
                        User: {isUserOnline(receiverId) ? 'Online' : 'Offline'} •
                        Activity: {getUserActivity(receiverId)}
                    </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    Online Users: {onlineUsers.length}
                </Text>
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
                    <Text style={{ color: '#CC0000' }}>Error: {error}</Text>
                </View>
            )}

            {/* Messages List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 16, color: '#666' }}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    showsVerticalScrollIndicator={false}
                    inverted={false}
                />
            )}

            {/* Message Input */}
            <View
                style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#E5E5EA',
                    backgroundColor: 'white',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                        }}
                        placeholder="Type a message..."
                        value={messageInput}
                        onChangeText={handleInputChange}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        disabled={!messageInput.trim() || !isConnected}
                        style={{
                            backgroundColor: isConnected && messageInput.trim() ? '#007AFF' : '#E5E5EA',
                            padding: 12,
                            borderRadius: 20,
                            minWidth: 44,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: isConnected && messageInput.trim() ? 'white' : '#999',
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            ➤
                        </Text>
                    </TouchableOpacity>
                </View>

                {isTyping && (
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                        You are typing...
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
};

export default MessagesScreen;
