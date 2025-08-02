import axios, { AxiosInstance } from 'axios';
import { useAuth } from '@clerk/clerk-expo';

const API_URL = 'https://bluntly-phi.vercel.app/api';
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
    const api = axios.create({
        baseURL: API_URL
    });

    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) { // This check correctly handles the possibility of token being null
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return api;
};

export const useApiClient = (): AxiosInstance => {
    const { getToken, isLoaded } = useAuth();

    // Don't create API client until auth is loaded
    if (!isLoaded) {
        // Return a dummy client during loading to maintain hook consistency
        return createApiClient(() => Promise.resolve(null));
    }

    return createApiClient(getToken);
}

export const userApi = {
    syncUser: async (api: AxiosInstance) => api.post('/users/sync'),
    getCurrentUser: async (api: AxiosInstance) => api.get('/users/me'),
    updateProfile: async (api: AxiosInstance, data: any) => api.put('/users/profile', data),
    followUser: async (api: AxiosInstance, userId: string) => api.post(`/users/follow/${userId}`),
    getUserByUsername: async (api: AxiosInstance, username: string) => api.get(`/users/profile/${username}`),
    getAllUsers: async (api: AxiosInstance) => api.get('/users'),
}

export const postsApi = {
    createPost: (api: AxiosInstance, data: { content: string; image?: string }) => api.post('/posts', data),
    getPosts: (api: AxiosInstance) => api.get('/posts'),
    getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
    likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
    deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
}

export const commentsApi = {
    createComment: (api: AxiosInstance, postId: string, content: string) => api.post(`/comments/post/${postId}`, { content }),
    getComments: (api: AxiosInstance, postId: string) => api.get(`/comments/post/${postId}`),
    deleteComment: (api: AxiosInstance, commentId: string) => api.delete(`/comments/${commentId}`),
}

export const notificationsApi = {
    getNotifications: (api: AxiosInstance) => api.get('/notifications'),
    deleteNotification: (api: AxiosInstance, notificationId: string) => api.delete(`/notifications/${notificationId}`),
}