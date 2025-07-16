import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMessages } from '@/hooks/useMessages';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Feather } from '@expo/vector-icons';

interface MessagingStatusProps {
    style?: object;
}

const MessagingStatus: React.FC<MessagingStatusProps> = ({ style }) => {
    const { currentUser } = useCurrentUser();
    const { connectionStatus, onlineUsers } = useMessages();
    const [lastActivity, setLastActivity] = useState<string>('');

    useEffect(() => {
        const updateActivity = () => {
            setLastActivity(new Date().toLocaleTimeString());
        };

        const interval = setInterval(updateActivity, 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#10b981';
            case 'connecting': return '#f59e0b';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return 'wifi';
            case 'connecting': return 'loader';
            case 'failed': return 'wifi-off';
            default: return 'help-circle';
        }
    };

    const showDetails = () => {
        Alert.alert(
            'Messaging System Status',
            `Connection: ${connectionStatus}\nOnline Users: ${onlineUsers.length}\nLast Update: ${lastActivity}\nUser ID: ${currentUser?._id || 'Not logged in'}`,
            [{ text: 'OK' }]
        );
    };

    return (
        <TouchableOpacity
            onPress={showDetails}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: '#f3f4f6',
                    borderRadius: 20,
                    marginHorizontal: 16,
                    marginVertical: 8,
                },
                style
            ]}
        >
            <View
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getStatusColor(),
                    marginRight: 8,
                }}
            />
            <Feather
                name={getStatusIcon()}
                size={16}
                color={getStatusColor()}
                style={{ marginRight: 8 }}
            />
            <Text style={{ color: '#4b5563', fontSize: 14, fontWeight: '500' }}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 8 }}>
                ({onlineUsers.length} online)
            </Text>
        </TouchableOpacity>
    );
};

export default MessagingStatus;
