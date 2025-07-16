import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient, messagesApi } from '@/utils/api';
import { useCurrentUser } from './useCurrentUser';
import { socketService } from '@/services/socket';

export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    user: {
        _id: string;
        username: string;
        name: string;
        avatar?: string;
        verified?: boolean;
    };
    lastMessage: Message;
    unreadCount: number;
    updatedAt: string;
}

export const useMessages = (userId?: string) => {
    const api = useApiClient();
    const { currentUser } = useCurrentUser();
    const queryClient = useQueryClient();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // Initialize socket connection
    useEffect(() => {
        if (currentUser?._id) {
            setConnectionStatus('connecting');

            try {
                socketService.connect(currentUser._id);
                setConnectionStatus('connected');
            } catch (error) {
                console.error('Failed to connect to socket:', error);
                setConnectionStatus('failed');
            }

            // Set up socket event handlers
            const handleMessageReceived = (message: Message) => {
                queryClient.setQueryData(['messages', message.senderId], (oldData: any) => {
                    if (!oldData) return [message];
                    return [...oldData, message];
                });

                // Update conversations list
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            };

            const handleMessageSent = (message: Message) => {
                queryClient.setQueryData(['messages', message.receiverId], (oldData: any) => {
                    if (!oldData) return [message];
                    return [...oldData, message];
                });

                // Update conversations list
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            };

            const handleUsersOnline = (users: string[]) => {
                setOnlineUsers(users);
            };

            const handleUserConnected = (userId: string) => {
                setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
            };

            const handleUserDisconnected = (userId: string) => {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
            };

            // Register event handlers
            socketService.onMessageReceived(handleMessageReceived);
            socketService.onMessageSent(handleMessageSent);
            socketService.onUsersOnline(handleUsersOnline);
            socketService.onUserConnected(handleUserConnected);
            socketService.onUserDisconnected(handleUserDisconnected);

            return () => {
                socketService.disconnect();
                setConnectionStatus('disconnected');
            };
        }
    }, [currentUser?._id, queryClient]);

    // Get conversations
    const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await messagesApi.getConversations(api);
            return response.data;
        },
        enabled: !!currentUser,
    });

    // Get messages for specific conversation
    const { data: messages = [], isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await messagesApi.getMessages(api, userId);
            return response.data;
        },
        enabled: !!userId && !!currentUser,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
            // Send via socket for real-time
            socketService.sendMessage(receiverId, content);

            // Also send via API as backup
            return messagesApi.sendMessage(api, receiverId, content);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    // Delete conversation mutation
    const deleteConversationMutation = useMutation({
        mutationFn: (userId: string) => messagesApi.deleteConversation(api, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
    });

    return {
        conversations,
        conversationsLoading,
        messages,
        messagesLoading,
        sendMessage: sendMessageMutation.mutate,
        sendingMessage: sendMessageMutation.isPending,
        deleteConversation: deleteConversationMutation.mutate,
        deletingConversation: deleteConversationMutation.isPending,
        onlineUsers,
        connectionStatus,
    };
};
