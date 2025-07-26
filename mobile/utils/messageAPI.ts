import axios from 'axios';

const BASE_URL = 'https://bluntly.onrender.com/api/messages';

// Create axios instance with default config
const messageAPI = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Message API service
export class MessageAPIService {

    // Set authorization token
    static setAuthToken(token: string) {
        if (token) {
            messageAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete messageAPI.defaults.headers.common['Authorization'];
        }
    }

    // Get all users that have message history
    static async getAllUsers(currentUserId: string) {
        try {
            const response = await messageAPI.get(`/users?currentUserId=${currentUserId}`);
            return {
                success: true,
                users: response.data.users || [],
            };
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch users',
                users: [],
            };
        }
    }

    // Get messages between current user and specific user
    static async getMessages(senderId: string, receiverId: string) {
        try {
            const response = await messageAPI.get(`?senderId=${senderId}&receiverId=${receiverId}`);
            return {
                success: true,
                messages: response.data.messages || [],
            };
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch messages',
                messages: [],
            };
        }
    }

    // Send message via HTTP (alternative to socket)
    static async sendMessage(senderId: string, receiverId: string, content: string) {
        try {
            const response = await messageAPI.post('/', {
                senderId,
                receiverId,
                content,
            });
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error: any) {
            console.error('Error sending message:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send message',
            };
        }
    }

    // Check server health
    static async checkHealth() {
        try {
            const response = await axios.get('https://bluntly.onrender.com/health');
            return {
                success: true,
                status: response.data,
            };
        } catch (error: any) {
            console.error('Health check failed:', error);
            return {
                success: false,
                error: 'Server health check failed',
            };
        }
    }

    // Search all users (for finding new people to message)
    static async searchUsers() {
        try {
            const response = await axios.get('https://bluntly.onrender.com/api/users');
            return {
                success: true,
                users: response.data || [],
            };
        } catch (error: any) {
            console.error('Error searching users:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to search users',
                users: [],
            };
        }
    }
}

export default MessageAPIService;
