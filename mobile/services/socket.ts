import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;

    connect(userId: string) {
        if (this.socket?.connected) {
            return;
        }

        this.userId = userId;
        this.socket = io('https://bluntly-phi.vercel.app', {
            transports: ['websocket'],
            forceNew: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
            this.socket?.emit('user_connected', userId);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
        }
    }

    sendMessage(receiverId: string, content: string) {
        if (!this.socket || !this.userId) {
            throw new Error('Socket not connected');
        }

        this.socket.emit('send_message', {
            senderId: this.userId,
            receiverId,
            content,
        });
    }

    onMessageReceived(callback: (message: any) => void) {
        this.socket?.on('receive_message', callback);
    }

    onMessageSent(callback: (message: any) => void) {
        this.socket?.on('message_sent', callback);
    }

    onMessageError(callback: (error: string) => void) {
        this.socket?.on('message_error', callback);
    }

    onUserConnected(callback: (userId: string) => void) {
        this.socket?.on('user_connected', callback);
    }

    onUserDisconnected(callback: (userId: string) => void) {
        this.socket?.on('user_disconnected', callback);
    }

    onUsersOnline(callback: (users: string[]) => void) {
        this.socket?.on('users_online', callback);
    }

    updateActivity(activity: string) {
        if (!this.socket || !this.userId) return;

        this.socket.emit('update_activity', {
            userId: this.userId,
            activity,
        });
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
