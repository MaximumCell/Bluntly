import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import socketService from '../utils/socketService';
import { MessageAPIService } from '../utils/messageAPI';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    _id: string;
    username: string;
}

export const useMessages = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [userActivities, setUserActivities] = useState<Record<string, string>>({});
    const [isConnected, setIsConnected] = useState(false);

    // Initialize socket connection
    useEffect(() => {
        if (user?.id) {
            // Set auth token for API calls
            // MessageAPIService.setAuthToken('your-auth-token-here');

            // Connect to socket
            socketService.connect(user.id, user.username || 'Anonymous');

            // Setup message listeners
            setupMessageListeners();

            // Check connection status
            setIsConnected(socketService.getConnectionStatus());

            return () => {
                socketService.disconnect();
            };
        }
    }, [user?.id]);

    // Setup socket event listeners
    const setupMessageListeners = useCallback(() => {
        // Listen for incoming messages
        socketService.onMessageReceived((message: Message) => {
            console.log('📨 Message received:', message);
            setMessages(prev => [...prev, message]);
        });

        // Listen for message sent confirmation
        socketService.onMessageSent((message: Message) => {
            console.log('✅ Message sent confirmation:', message);
            setMessages(prev => [...prev, message]);
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
    }, []);

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.getAllUsers();
            if (result.success) {
                setUsers(result.users);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch messages with specific user
    const fetchMessages = useCallback(async (userId: string) => {
        if (!user?.id) {
            setError('User not authenticated');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await MessageAPIService.getMessages(user.id, userId);
            if (result.success) {
                setMessages(result.messages);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

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
        if (!user?.id) {
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
            const result = await MessageAPIService.sendMessage(user.id, receiverId, content.trim());
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
    }, [user?.id]);

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

    return {
        // Data
        messages,
        users,
        onlineUsers,
        userActivities,

        // State
        loading,
        error,
        isConnected: socketService.getConnectionStatus(),

        // Actions
        fetchUsers,
        fetchMessages,
        sendMessage,
        sendMessageHTTP,
        updateActivity,
        clearMessages,
        clearError,

        // Utilities
        isUserOnline,
        getUserActivity,
    };
};

export default useMessages;
