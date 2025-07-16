import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiClient, messagesApi } from '@/utils/api';
import { Alert } from 'react-native';

export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    content: string;
    read: boolean;
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

export interface SearchUser {
    _id: string;
    username: string;
    name: string;
    avatar?: string;
    verified?: boolean;
}

export const useMessages = (userId?: string) => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');

    // Get conversations (similar to how posts are fetched)
    const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await messagesApi.getConversations(api);
            return response.data;
        },
        refetchInterval: 10000, // Refetch every 10 seconds for "real-time" updates
    });

    // Get messages for specific conversation
    const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
        queryKey: ['messages', userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await messagesApi.getMessages(api, userId);
            return response.data;
        },
        enabled: !!userId,
        refetchInterval: 2000, // Refetch every 2 seconds for active conversations
    });

    // Search users
    const { data: searchResults = [], isLoading: searchLoading } = useQuery({
        queryKey: ['searchUsers', searchQuery],
        queryFn: async () => {
            if (!searchQuery.trim()) return [];
            const response = await messagesApi.searchUsers(api, searchQuery);
            return response.data;
        },
        enabled: searchQuery.trim().length > 0,
    });

    // Send message mutation (similar to createComment)
    const sendMessageMutation = useMutation({
        mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
            const response = await messagesApi.sendMessage(api, receiverId, content);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch conversations and messages
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', userId] });
        },
        onError: (error) => {
            Alert.alert('Error', 'Failed to send message. Please try again.');
        },
    });

    // Delete conversation mutation
    const deleteConversationMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await messagesApi.deleteConversation(api, userId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            Alert.alert('Success', 'Conversation deleted successfully.');
        },
        onError: (error) => {
            Alert.alert('Error', 'Failed to delete conversation. Please try again.');
        },
    });

    // Send message function
    const sendMessage = ({ receiverId, content }: { receiverId: string; content: string }) => {
        if (!content.trim()) {
            Alert.alert('Error', 'Message cannot be empty');
            return;
        }
        sendMessageMutation.mutate({ receiverId, content: content.trim() });
    };

    // Delete conversation function
    const deleteConversation = (userId: string) => {
        deleteConversationMutation.mutate(userId);
    };

    return {
        // Data
        conversations,
        messages,
        searchResults,

        // Loading states
        conversationsLoading,
        messagesLoading,
        searchLoading,
        sendingMessage: sendMessageMutation.isPending,
        deletingConversation: deleteConversationMutation.isPending,

        // Actions
        sendMessage,
        deleteConversation,
        refetchConversations,
        refetchMessages,

        // Search
        searchQuery,
        setSearchQuery,
    };
};
