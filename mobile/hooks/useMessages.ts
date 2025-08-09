import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentUser } from './useCurrentUser'
import socketService from '../utils/socketService';
import { MessageAPIService } from '../utils/messageAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
    _id: string;
    senderId: string | User;
    receiverId: string | User;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
}

export const useMessages = () => {
    const { currentUser } = useCurrentUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [userActivities, setUserActivities] = useState<Record<string, string>>({});
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
    const [readMessages, setReadMessages] = useState<Set<string>>(new Set());
    const [isReadMessagesLoaded, setIsReadMessagesLoaded] = useState(false);

    // Refs to avoid dependency loops
    const usersRef = useRef<User[]>([]);
    const allUsersRef = useRef<User[]>([]);
    const readMessagesRef = useRef<Set<string>>(new Set());

    // Update refs when state changes
    useEffect(() => {
        usersRef.current = users;
    }, [users]);

    useEffect(() => {
        allUsersRef.current = allUsers;
    }, [allUsers]);

    useEffect(() => {
        readMessagesRef.current = readMessages;
    }, [readMessages]);

    // Load read messages from AsyncStorage on app start
    useEffect(() => {
        const loadReadMessages = async () => {
            if (!currentUser?._id) return;

            try {
                const key = `readMessages_${currentUser._id}`;
                const stored = await AsyncStorage.getItem(key);
                if (stored) {
                    const readMessageIds = JSON.parse(stored);
                    setReadMessages(new Set(readMessageIds));
                    console.log('📚 Loaded read messages from storage:', readMessageIds.length);
                }
            } catch (error) {
                console.error('❌ Error loading read messages:', error);
            } finally {
                setIsReadMessagesLoaded(true);
            }
        };

        loadReadMessages();
    }, [currentUser?._id]);

    // Save read messages to AsyncStorage whenever they change
    useEffect(() => {
        const saveReadMessages = async () => {
            if (!currentUser?._id || !isReadMessagesLoaded) return;

            try {
                const key = `readMessages_${currentUser._id}`;
                const readMessageIds = Array.from(readMessages);
                await AsyncStorage.setItem(key, JSON.stringify(readMessageIds));
                console.log('💾 Saved read messages to storage:', readMessageIds.length);
            } catch (error) {
                console.error('❌ Error saving read messages:', error);
            }
        };

        saveReadMessages();
    }, [readMessages, currentUser?._id, isReadMessagesLoaded]);

    // Initialize socket connection
    useEffect(() => {
        console.log('🔍 Current user check:', currentUser);

        if (currentUser?._id) {
            console.log('✅ Current user available, connecting socket...');
            setIsConnecting(true);

            // Clean up any existing listeners before setting up new ones
            socketService.removeAllListeners('receive_message');
            socketService.removeAllListeners('message_sent');
            socketService.removeAllListeners('message_error');
            socketService.removeAllListeners('users_online');
            socketService.removeAllListeners('activity_updated');

            socketService.connect(currentUser._id, currentUser.username || 'Anonymous');

            // Setup message listeners
            setupMessageListeners();

            // Check initial connection status
            setIsConnected(socketService.getConnectionStatus());

            // Listen for connection status changes
            socketService.onConnectionStatusChange((connected: boolean) => {
                console.log('🔌 Connection status changed:', connected);
                setIsConnected(connected);
                setIsConnecting(false);
            });

            return () => {
                console.log('🧹 Cleaning up socket listeners and connection...');
                // Clean up listeners
                socketService.removeAllListeners('receive_message');
                socketService.removeAllListeners('message_sent');
                socketService.removeAllListeners('message_error');
                socketService.removeAllListeners('users_online');
                socketService.removeAllListeners('activity_updated');

                socketService.disconnect();
                setIsConnecting(false);
            };
        } else {
            console.log('❌ Current user not available, cannot connect socket');
            setIsConnecting(false);
        }
    }, [currentUser?._id]);

    // Setup socket event listeners
    const setupMessageListeners = useCallback(() => {
        console.log('🔧 Setting up message listeners...');

        // Listen for incoming messages
        socketService.onMessageReceived((message: Message) => {
            console.log('📨 Message received:', message);
            setMessages(prev => [...prev, message]);

            // Update last message and unread count
            const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
            if (senderId !== currentUser?._id) {
                console.log('📨 Updating last message and unread count for:', senderId);
                setLastMessages(prev => ({
                    ...prev,
                    [senderId]: message
                }));

                // Only increment unread count if message hasn't been read
                if (!readMessagesRef.current.has(message._id)) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [senderId]: (prev[senderId] || 0) + 1
                    }));
                }
            }
        });

        // Listen for message sent confirmation
        socketService.onMessageSent((message: Message) => {
            console.log('✅ Message sent confirmation:', message);
            setMessages(prev => [...prev, message]);

            // Update last message for sent messages
            const receiverId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
            setLastMessages(prev => ({
                ...prev,
                [receiverId]: message
            }));
        });

        // Listen for message errors
        socketService.onMessageError((error: string) => {
            console.error('❌ Message error:', error);
            setError(error);
        });

        // Listen for online users updates
        socketService.onUsersOnlineUpdate((userIds: string[]) => {
            console.log('👥 Online users updated:', userIds);
            setOnlineUsers(userIds);
        });

        // Listen for activity updates
        socketService.onActivityUpdate(({ userId, activity }: { userId: string, activity: string }) => {
            console.log(`📊 Activity update: ${userId} - ${activity}`);
            setUserActivities(prev => ({
                ...prev,
                [userId]: activity,
            }));
        });
    }, [currentUser?._id]); // Add currentUser._id as dependency

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        if (!currentUser?._id) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.getAllUsers(currentUser._id);
            if (result.success) {
                // Filter out current user from the results
                const filteredUsers = result.users.filter((user: any) => user._id !== currentUser._id);
                setUsers(filteredUsers);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id]);

    // Load last messages for all users
    const loadLastMessages = useCallback(async () => {
        if (!currentUser?._id) return;

        try {
            // Get current users and allUsers from refs to avoid dependency issues
            const usersToCheck = [...usersRef.current, ...allUsersRef.current];
            const uniqueUsers = usersToCheck.filter((user, index, self) =>
                index === self.findIndex(u => u._id === user._id)
            );

            for (const user of uniqueUsers) {
                try {
                    const result = await MessageAPIService.getMessages(currentUser._id, user._id);
                    if (result.success && result.messages && result.messages.length > 0) {
                        const lastMsg = result.messages[result.messages.length - 1];
                        setLastMessages(prev => ({
                            ...prev,
                            [user._id]: lastMsg
                        }));

                        // Count unread messages from this user
                        const unreadMessages = result.messages.filter((msg: Message) => {
                            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                            return senderId === user._id && !readMessagesRef.current.has(msg._id);
                        });

                        setUnreadCounts(prev => ({
                            ...prev,
                            [user._id]: unreadMessages.length
                        }));
                    }
                } catch (err) {
                    console.error(`Failed to load messages for user ${user._id}:`, err);
                }
            }
        } catch (err) {
            console.error('Failed to load last messages:', err);
        }
    }, [currentUser?._id]);

    // Load last messages when users are loaded and read messages are loaded
    useEffect(() => {
        if ((allUsers.length > 0 || users.length > 0) && isReadMessagesLoaded) {
            loadLastMessages();
        }
    }, [allUsers.length, users.length, isReadMessagesLoaded, loadLastMessages]);

    // Initialize unread counts when component mounts
    useEffect(() => {
        if (currentUser?._id) {
            // Reset unread counts on app start
            setUnreadCounts({});
        }
    }, [currentUser?._id]);

    // Search all users (for finding new people to message)
    const searchAllUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.searchUsers();
            if (result.success) {
                // Filter out current user from the results
                const filteredUsers = result.users.filter((user: any) => user._id !== currentUser?._id);
                setAllUsers(filteredUsers);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to search users');
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id]);

    // Initialize unread counts for a user (called when fetching messages)
    const initializeUnreadCount = useCallback((userId: string, messages: Message[]) => {
        if (!currentUser?._id || messages.length === 0) return;

        // Count unread messages from the other user that haven't been marked as read
        const unreadMessages = messages.filter((msg: Message) => {
            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
            return senderId === userId && !readMessagesRef.current.has(msg._id);
        });

        setUnreadCounts(prev => ({
            ...prev,
            [userId]: unreadMessages.length
        }));
    }, [currentUser?._id]);

    // Fetch messages with specific user
    const fetchMessages = useCallback(async (userId: string) => {
        if (!currentUser?._id) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.getMessages(currentUser._id, userId);
            if (result.success) {
                setMessages(result.messages);

                // Update last message if messages exist
                if (result.messages && result.messages.length > 0) {
                    const lastMsg = result.messages[result.messages.length - 1];
                    setLastMessages(prev => ({
                        ...prev,
                        [userId]: lastMsg
                    }));
                }

                // Initialize unread count
                initializeUnreadCount(userId, result.messages || []);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id, initializeUnreadCount]);

    // Send message via socket (real-time)
    const sendMessage = useCallback((receiverId: string, content: string) => {
        if (!content.trim()) {
            setError('Message content cannot be empty');
            return;
        }

        socketService.sendMessage(receiverId, content.trim());
    }, []);

    // Send message via HTTP API (fallback)
    const sendMessageHTTP = useCallback(async (receiverId: string, content: string) => {
        if (!currentUser?._id) {
            setError('User not authenticated');
            return { success: false };
        }

        if (!content.trim()) {
            setError('Message content cannot be empty');
            return { success: false };
        }

        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.sendMessage(currentUser._id, receiverId, content.trim());
            if (result.success && result.message) {
                setMessages(prev => [...prev, result.message]);
            } else {
                setError(result.error);
            }
            return result;
        } catch (err) {
            setError('Failed to send message');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [currentUser?._id]);

    // Update user activity
    const updateActivity = useCallback((activity: string) => {
        socketService.updateActivity(activity);
    }, []);

    // Clear messages
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Check if user is online
    const isUserOnline = useCallback((userId: string) => {
        return onlineUsers.includes(userId);
    }, [onlineUsers]);

    // Get user activity
    const getUserActivity = useCallback((userId: string) => {
        return userActivities[userId] || 'Offline';
    }, [userActivities]);

    // Mark messages as read for a specific user
    const markMessagesAsRead = useCallback(async (userId: string) => {
        try {
            // Fetch messages for this user to get all message IDs
            if (currentUser?._id) {
                const result = await MessageAPIService.getMessages(currentUser._id, userId);
                if (result.success && result.messages) {
                    // Mark all messages from this user as read
                    const messageIds = result.messages
                        .filter((msg: Message) => {
                            const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
                            return senderId === userId;
                        })
                        .map((msg: Message) => msg._id);

                    setReadMessages(prev => {
                        const newReadMessages = new Set(prev);
                        messageIds.forEach((id: string) => newReadMessages.add(id));
                        return newReadMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }

        // Reset unread count for this user
        setUnreadCounts(prev => ({
            ...prev,
            [userId]: 0
        }));
    }, [currentUser?._id]);

    // Get unread count for a user
    const getUnreadCount = useCallback((userId: string) => {
        return unreadCounts[userId] || 0;
    }, [unreadCounts]);

    // Get last message for a user
    const getLastMessage = useCallback((userId: string) => {
        return lastMessages[userId];
    }, [lastMessages]);

    return {
        // Data
        messages,
        users,
        allUsers,
        onlineUsers,
        userActivities,
        unreadCounts,
        lastMessages,

        // State
        loading,
        error,
        isConnected,
        isConnecting,
        isReadMessagesLoaded,

        // Actions
        fetchUsers,
        searchAllUsers,
        fetchMessages,
        sendMessage,
        sendMessageHTTP,
        updateActivity,
        clearMessages,
        clearError,
        markMessagesAsRead,
        loadLastMessages,

        // Utilities
        isUserOnline,
        getUserActivity,
        getUnreadCount,
        getLastMessage,
    };
};

export default useMessages;
