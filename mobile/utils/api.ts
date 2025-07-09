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
    const { getToken } = useAuth();
    return createApiClient(getToken);
}

export const userApi = {
    syncUser: async (api: AxiosInstance) => api.post('/users/sync'),
    getCurrentUser: async (api: AxiosInstance) => api.get('/users/me'),
    updateProfile: async (api: AxiosInstance, data: any) => api.put('/users/profile', data),
}