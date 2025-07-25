import { useState, useEffect } from 'react';
import axios from 'axios';

// Socket server URL for fetching users
const SOCKET_SERVER_URL = 'https://bluntly.onrender.com';

export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    avatar: string;
    bio?: string;
    verified?: boolean;
    createdAt: string;
    updatedAt: string;
}

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch users from socket server
            const response = await axios.get(`${SOCKET_SERVER_URL}/api/users`);
            setUsers(response.data);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to fetch users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const getUserByUsername = async (username: string): Promise<User | null> => {
        try {
            const response = await axios.get(`${SOCKET_SERVER_URL}/api/users/${username}`);
            return response.data;
        } catch (err: any) {
            console.error('Error fetching user by username:', err);
            return null;
        }
    };

    const getCurrentUser = async (): Promise<User | null> => {
        try {
            // For now, we can get current user from the main backend
            // or implement it in socket server if needed
            console.log('getCurrentUser not implemented for socket server');
            return null;
        } catch (err: any) {
            console.error('Error fetching current user:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers,
        getUserByUsername,
        getCurrentUser,
    };
};
