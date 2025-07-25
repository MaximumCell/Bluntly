import io, { Socket } from 'socket.io-client';

// Socket server configuration
const SOCKET_SERVER_URL = 'https://bluntly.onrender.com';

class SocketService {
    private socket: Socket | null;
    private userId: string | null;
    private isConnected: boolean;

    constructor() {
        this.socket = null;
        this.userId = null;
        this.isConnected = false;
    }

    // Initialize socket connection
    connect(userId: string, username: string): Socket | undefined {
        try {
            this.userId = userId;

            this.socket = io(SOCKET_SERVER_URL, {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            this.setupEventListeners();

            // Authenticate user once connected
            this.socket.on('connect', () => {
                console.log('✅ Connected to socket server');
                this.isConnected = true;
                this.authenticateUser(userId, username);
            });

            return this.socket;
        } catch (error) {
            console.error('❌ Socket connection error:', error);
        }
    }

    // Authenticate user with socket server
    authenticateUser(userId: string, username: string): void {
        if (this.socket && this.isConnected) {
            this.socket.emit('user_connected', userId);
            console.log(`🔐 User authenticated: ${username} (${userId})`);
        }
    }

    // Setup default event listeners
    setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('🔌 Socket connected');
            this.isConnected = true;
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log('🔌 Socket disconnected:', reason);
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('❌ Socket connection error:', error);
            this.isConnected = false;
        });

        // User events
        this.socket.on('user_connected', (userId: string) => {
            console.log(`👤 User ${userId} came online`);
        });

        this.socket.on('user_disconnected', (userId: string) => {
            console.log(`👤 User ${userId} went offline`);
        });

        this.socket.on('users_online', (userIds: string[]) => {
            console.log('👥 Users online:', userIds);
        });

        this.socket.on('activities', (activities: any[]) => {
            console.log('📊 User activities:', activities);
        });

        this.socket.on('activity_updated', ({ userId, activity }: { userId: string; activity: string }) => {
            console.log(`📊 Activity updated: ${userId} - ${activity}`);
        });
    }

    // Send message
    sendMessage(receiverId: string, content: string): void {
        if (this.socket && this.isConnected) {
            const messageData = {
                senderId: this.userId,
                receiverId,
                content,
            };

            this.socket.emit('send_message', messageData);
            console.log(`💬 Sending message to ${receiverId}:`, content);
        } else {
            console.error('❌ Socket not connected, cannot send message');
        }
    }

    // Update user activity
    updateActivity(activity: string): void {
        if (this.socket && this.isConnected && this.userId) {
            this.socket.emit('update_activity', {
                userId: this.userId,
                activity,
            });
        }
    }

    // Listen for incoming messages
    onMessageReceived(callback: (message: any) => void): void {
        if (this.socket) {
            this.socket.on('receive_message', callback);
        }
    }

    // Listen for message sent confirmation
    onMessageSent(callback: (message: any) => void): void {
        if (this.socket) {
            this.socket.on('message_sent', callback);
        }
    }

    // Listen for message errors
    onMessageError(callback: (error: any) => void): void {
        if (this.socket) {
            this.socket.on('message_error', callback);
        }
    }

    // Listen for users online updates
    onUsersOnlineUpdate(callback: (userIds: string[]) => void): void {
        if (this.socket) {
            this.socket.on('users_online', callback);
        }
    }

    // Listen for activity updates
    onActivityUpdate(callback: (data: { userId: string; activity: string }) => void): void {
        if (this.socket) {
            this.socket.on('activity_updated', callback);
        }
    }

    // Disconnect socket
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.userId = null;
            console.log('🔌 Socket disconnected');
        }
    }

    // Get connection status
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // Remove specific event listener
    removeListener(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Remove all listeners for an event
    removeAllListeners(event: string): void {
        if (this.socket) {
            this.socket.removeAllListeners(event);
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
