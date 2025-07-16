import { useMessages } from '@/hooks/useMessages';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { socketService } from '@/services/socket';

export const useMessagingDebug = () => {
    const { currentUser } = useCurrentUser();
    const messagesHook = useMessages();

    const debugInfo = {
        currentUser: currentUser?._id || 'Not logged in',
        connectionStatus: messagesHook.connectionStatus,
        onlineUsers: messagesHook.onlineUsers,
        conversationsCount: messagesHook.conversations.length,
        isLoading: messagesHook.conversationsLoading,
        socketConnected: socketService.isConnected(),
    };

    const testMessage = async (receiverId: string, content: string = 'Test message') => {
        try {
            messagesHook.sendMessage({ receiverId, content });
            return { success: true, message: 'Message sent successfully' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    };

    const testConnection = () => {
        try {
            if (currentUser?._id) {
                socketService.connect(currentUser._id);
                return { success: true, message: 'Connection test initiated' };
            }
            return { success: false, error: 'No user logged in' };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    };

    const logDebugInfo = () => {
        console.log('=== MESSAGING DEBUG INFO ===');
        console.log('Current User:', debugInfo.currentUser);
        console.log('Connection Status:', debugInfo.connectionStatus);
        console.log('Online Users:', debugInfo.onlineUsers);
        console.log('Conversations Count:', debugInfo.conversationsCount);
        console.log('Is Loading:', debugInfo.isLoading);
        console.log('Socket Connected:', debugInfo.socketConnected);
        console.log('============================');
    };

    return {
        debugInfo,
        testMessage,
        testConnection,
        logDebugInfo,
    };
};

// Export for console debugging
if (typeof window !== 'undefined') {
    (window as any).messagingDebug = useMessagingDebug;
}
