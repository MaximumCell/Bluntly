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
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import EnhancedRetroBackground from '../components/animations/EnhancedRetroBackground';
import RetroTransition from '../components/animations/RetroTransition';
import RetroLoader from '../components/animations/RetroLoader';
import { Message } from '@/types';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ChatScreen = () => {
    const navigation = useNavigation();
    const { currentTheme, currentPeriod } = useEnhancedTheme();
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
            // Use multiple attempts to ensure scrolling works
            const timer1 = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);

            const timer2 = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                setShouldScrollToEnd(false); // Reset flag after scrolling
            }, 300);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [messages, shouldScrollToEnd]);

    // Auto-scroll to new messages when they arrive (improved)
    useEffect(() => {
        if (messages.length > 0) {
            // Immediate scroll without animation for instant feedback
            flatListRef.current?.scrollToEnd({ animated: false });

            // Follow up with animated scroll for smooth user experience
            const timer = setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 50);

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

        // Force immediate scroll to bottom after sending message
        flatListRef.current?.scrollToEnd({ animated: false });

        // Follow up with animated scroll
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Final scroll attempt to ensure it works
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 500);
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
    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isOwn = isMyMessage(item);

        return (
            <RetroTransition type="slideUp" delay={index * 30}>
                <View
                    style={{
                        padding: 16,
                        marginVertical: 6,
                        marginHorizontal: 16,
                        backgroundColor: isOwn
                            ? currentTheme.colors.primary + 'E6'
                            : currentTheme.colors.surface + 'CC',
                        borderRadius: 20,
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        borderWidth: 2,
                        borderColor: isOwn
                            ? currentTheme.colors.primary + '80'
                            : currentTheme.colors.primary + '40',
                        shadowColor: currentTheme.colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    {!isOwn && (
                        <Text
                            style={{
                                color: currentTheme.colors.text + 'CC',
                                fontSize: 12,
                                marginBottom: 6,
                                fontWeight: '600',
                                textShadowColor: currentTheme.colors.primary + '40',
                                textShadowOffset: { width: 0.5, height: 0.5 },
                                textShadowRadius: 1,
                                fontFamily: 'monospace',
                            }}
                        >
                            {getMessageSenderName(item) || 'Unknown'}
                        </Text>
                    )}

                    <Text
                        style={{
                            color: isOwn ? currentTheme.colors.surface : currentTheme.colors.text,
                            fontSize: 16,
                            lineHeight: 22,
                            fontWeight: '500',
                            textShadowColor: isOwn
                                ? currentTheme.colors.primary + '60'
                                : currentTheme.colors.primary + '20',
                            textShadowOffset: { width: 0.5, height: 0.5 },
                            textShadowRadius: 1,
                        }}
                    >
                        {item.content || ''}
                    </Text>

                    <Text
                        style={{
                            color: isOwn
                                ? currentTheme.colors.surface + 'CC'
                                : currentTheme.colors.text + '80',
                            fontSize: 11,
                            marginTop: 6,
                            fontFamily: 'monospace',
                            textAlign: isOwn ? 'right' : 'left',
                        }}
                    >
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : ''}
                    </Text>
                </View>
            </RetroTransition>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <EnhancedRetroBackground
                intensity={0.6}
                showParticles={true}
                showObjects={true}
                showAtmosphere={true}
            >
                <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                    {/* Header */}
                    <RetroTransition type="slideUp" delay={0}>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                backgroundColor: currentTheme.colors.surface + '90',
                                borderBottomWidth: 2,
                                borderBottomColor: currentTheme.colors.primary + '40',
                                shadowColor: currentTheme.colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={{
                                    marginRight: 16,
                                    padding: 8,
                                    borderRadius: 12,
                                    backgroundColor: currentTheme.colors.primary + '20',
                                }}
                            >
                                <Feather name="arrow-left" size={24} color={currentTheme.colors.primary} />
                            </TouchableOpacity>

                            {/* Enhanced Profile Picture */}
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/userProfile',
                                    params: { username: username }
                                })}
                                style={{ marginRight: 16 }}
                            >
                                {profilePicture ? (
                                    <Image
                                        source={{ uri: profilePicture }}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            borderWidth: 3,
                                            borderColor: isUserOnline(userId || '')
                                                ? currentTheme.colors.accent
                                                : currentTheme.colors.primary + '60',
                                            shadowColor: currentTheme.colors.primary,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 24,
                                            backgroundColor: currentTheme.colors.primary + 'DD',
                                            borderWidth: 3,
                                            borderColor: isUserOnline(userId || '')
                                                ? currentTheme.colors.accent
                                                : currentTheme.colors.primary + '60',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: currentTheme.colors.primary,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }}
                                    >
                                        <Text style={{
                                            color: currentTheme.colors.surface,
                                            fontWeight: 'bold',
                                            fontSize: 18,
                                            textShadowColor: currentTheme.colors.primary,
                                            textShadowOffset: { width: 1, height: 1 },
                                            textShadowRadius: 2,
                                        }}>
                                            {(displayName?.[0] || username?.[0] || '?').toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                {/* Enhanced online status */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        bottom: -2,
                                        right: -2,
                                        width: 16,
                                        height: 16,
                                        borderRadius: 8,
                                        backgroundColor: isUserOnline(userId || '')
                                            ? currentTheme.colors.accent
                                            : currentTheme.colors.text + '60',
                                        borderWidth: 2,
                                        borderColor: currentTheme.colors.surface,
                                        shadowColor: isUserOnline(userId || '') ? currentTheme.colors.accent : 'transparent',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    }}
                                />
                            </TouchableOpacity>

                            <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/userProfile',
                                        params: { username: username }
                                    })}
                                >
                                    <Text style={{
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        color: currentTheme.colors.text,
                                        textShadowColor: currentTheme.colors.primary + '40',
                                        textShadowOffset: { width: 0.5, height: 0.5 },
                                        textShadowRadius: 2,
                                    }}>
                                        {displayName || username || 'Unknown User'}
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <View
                                        style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            marginRight: 6,
                                            backgroundColor: isUserOnline(userId || '')
                                                ? currentTheme.colors.accent
                                                : currentTheme.colors.text + '60',
                                        }}
                                    />
                                    <Text style={{
                                        fontSize: 13,
                                        color: currentTheme.colors.text + 'CC',
                                        fontFamily: 'monospace',
                                    }}>
                                        {isUserOnline(userId || '') ? 'Online' : 'Offline'}
                                        {userId && getUserActivity(userId) && getUserActivity(userId) !== 'Idle' && getUserActivity(userId) !== 'Offline' && (
                                            <Text style={{ color: currentTheme.colors.accent }}>
                                                {` • ${getUserActivity(userId) || ''}`}
                                            </Text>
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </RetroTransition>

                    {/* Error Message */}
                    {error && (
                        <RetroTransition type="slideUp" delay={100}>
                            <View
                                style={{
                                    backgroundColor: '#FF444420',
                                    borderColor: '#FF444460',
                                    borderWidth: 2,
                                    padding: 12,
                                    margin: 16,
                                    borderRadius: 12,
                                    borderLeftWidth: 4,
                                    borderLeftColor: '#FF4444',
                                    shadowColor: '#FF4444',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 3,
                                }}
                            >
                                <Text style={{
                                    color: '#FF4444',
                                    fontSize: 14,
                                    fontWeight: '600',
                                }}>
                                    Error: {error}
                                </Text>
                            </View>
                        </RetroTransition>
                    )}

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                    >
                        {/* Messages List */}
                        {loading ? (
                            <RetroTransition type="scaleIn" delay={200}>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <RetroLoader style="neon" size="large" />
                                    <Text style={{
                                        marginTop: 16,
                                        color: currentTheme.colors.text + 'CC',
                                        fontSize: 16,
                                        fontFamily: 'monospace',
                                        textShadowColor: currentTheme.colors.primary + '40',
                                        textShadowOffset: { width: 0.5, height: 0.5 },
                                        textShadowRadius: 2,
                                    }}>
                                        Loading messages...
                                    </Text>
                                </View>
                            </RetroTransition>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item._id}
                                renderItem={renderMessage}
                                style={{ flex: 1 }}
                                contentContainerStyle={{
                                    paddingVertical: 16,
                                    flexGrow: messages.length === 0 ? 1 : 0
                                }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                removeClippedSubviews={false}
                                initialNumToRender={50}
                                maxToRenderPerBatch={50}
                                windowSize={50}
                                getItemLayout={undefined}
                                onContentSizeChange={(contentWidth, contentHeight) => {
                                    if (shouldScrollToEnd && messages.length > 0) {
                                        flatListRef.current?.scrollToEnd({ animated: false });
                                        setTimeout(() => {
                                            flatListRef.current?.scrollToEnd({ animated: true });
                                        }, 50);
                                    }
                                }}
                                onLayout={() => {
                                    if (shouldScrollToEnd && messages.length > 0) {
                                        flatListRef.current?.scrollToEnd({ animated: false });
                                        setTimeout(() => {
                                            flatListRef.current?.scrollToEnd({ animated: true });
                                        }, 100);
                                    }
                                }}
                                ListEmptyComponent={() => (
                                    <RetroTransition type="fadeIn" delay={300}>
                                        <View style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 40,
                                            minHeight: 200
                                        }}>
                                            <View style={{
                                                padding: 20,
                                                borderRadius: 50,
                                                backgroundColor: currentTheme.colors.primary + '20',
                                                borderWidth: 2,
                                                borderColor: currentTheme.colors.primary + '40',
                                                shadowColor: currentTheme.colors.primary,
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}>
                                                <Feather
                                                    name="message-circle"
                                                    size={48}
                                                    color={currentTheme.colors.primary}
                                                />
                                            </View>
                                            <Text style={{
                                                color: currentTheme.colors.text + 'DD',
                                                textAlign: 'center',
                                                marginTop: 20,
                                                fontSize: 18,
                                                fontWeight: '600',
                                                textShadowColor: currentTheme.colors.primary + '30',
                                                textShadowOffset: { width: 0.5, height: 0.5 },
                                                textShadowRadius: 2,
                                            }}>
                                                No messages yet.{'\n'}Start the conversation!
                                            </Text>
                                        </View>
                                    </RetroTransition>
                                )}
                            />
                        )}

                        {/* Enhanced Message Input */}
                        <RetroTransition type="slideUp" delay={400}>
                            <View
                                style={{
                                    padding: 16,
                                    backgroundColor: currentTheme.colors.surface + 'F0',
                                    borderTopWidth: 2,
                                    borderTopColor: currentTheme.colors.primary + '30',
                                    shadowColor: currentTheme.colors.primary,
                                    shadowOffset: { width: 0, height: -2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 6,
                                    elevation: 6,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: currentTheme.colors.primary + '40',
                                            backgroundColor: currentTheme.colors.background + 'F0',
                                            borderRadius: 25,
                                            paddingHorizontal: 20,
                                            paddingVertical: 14,
                                            fontSize: 16,
                                            marginRight: 12,
                                            maxHeight: 120,
                                            minHeight: 50,
                                            color: currentTheme.colors.text,
                                            shadowColor: currentTheme.colors.primary,
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                        }}
                                        placeholder="Type a message..."
                                        placeholderTextColor={currentTheme.colors.text + '80'}
                                        value={messageInput}
                                        onChangeText={handleInputChange}
                                        onFocus={() => {
                                            // Force scroll to bottom when keyboard appears
                                            flatListRef.current?.scrollToEnd({ animated: false });
                                            setTimeout(() => {
                                                flatListRef.current?.scrollToEnd({ animated: true });
                                            }, 150);
                                            setTimeout(() => {
                                                flatListRef.current?.scrollToEnd({ animated: true });
                                            }, 500);
                                        }}
                                        multiline
                                        maxLength={500}
                                        textAlignVertical="center"
                                    />
                                    <TouchableOpacity
                                        onPress={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        style={{
                                            backgroundColor: messageInput.trim()
                                                ? currentTheme.colors.primary
                                                : currentTheme.colors.text + '40',
                                            padding: 14,
                                            borderRadius: 25,
                                            width: 50,
                                            height: 50,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 2,
                                            borderColor: messageInput.trim()
                                                ? currentTheme.colors.primary + '60'
                                                : currentTheme.colors.text + '20',
                                            shadowColor: messageInput.trim()
                                                ? currentTheme.colors.primary
                                                : 'transparent',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 4,
                                            elevation: messageInput.trim() ? 3 : 1,
                                        }}
                                    >
                                        <Feather
                                            name="send"
                                            size={22}
                                            color={messageInput.trim()
                                                ? currentTheme.colors.surface
                                                : currentTheme.colors.text + '80'
                                            }
                                        />
                                    </TouchableOpacity>
                                </View>

                                {isTyping && (
                                    <RetroTransition type="fadeIn" delay={0}>
                                        <Text style={{
                                            fontSize: 12,
                                            color: currentTheme.colors.primary,
                                            marginTop: 8,
                                            marginLeft: 20,
                                            fontStyle: 'italic',
                                            fontFamily: 'monospace',
                                        }}>
                                            You are typing...
                                        </Text>
                                    </RetroTransition>
                                )}
                            </View>
                        </RetroTransition>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </EnhancedRetroBackground>
        </View>
    );
};

export default ChatScreen;
