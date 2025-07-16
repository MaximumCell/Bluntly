import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useMessages, SearchUser } from '@/hooks/useMessages';

interface UserSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectUser: (userId: string) => void;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
    visible,
    onClose,
    onSelectUser,
}) => {
    const { searchQuery, setSearchQuery, searchResults, searchLoading } = useMessages();

    const handleUserSelect = (user: SearchUser) => {
        onSelectUser(user._id);
        onClose();
        setSearchQuery('');
    };

    const handleClose = () => {
        onClose();
        setSearchQuery('');
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900">New Message</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Feather name="x" size={24} color="#1DA1F2" />
                    </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View className="px-4 py-3 border-b border-gray-100">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                        <Feather name="search" size={20} color="#657786" />
                        <TextInput
                            placeholder="Search people..."
                            className="flex-1 ml-3 text-base"
                            placeholderTextColor="#657786"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Feather name="x-circle" size={20} color="#657786" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Results */}
                <View className="flex-1">
                    {searchLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1DA1F2" />
                            <Text className="text-gray-500 mt-2">Searching...</Text>
                        </View>
                    ) : searchQuery.trim().length === 0 ? (
                        <View className="flex-1 justify-center items-center px-4">
                            <Feather name="users" size={64} color="#e5e7eb" />
                            <Text className="text-gray-500 text-lg font-medium mt-4">Find People</Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Search for someone to start a conversation
                            </Text>
                        </View>
                    ) : searchResults.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-4">
                            <Feather name="search" size={64} color="#e5e7eb" />
                            <Text className="text-gray-500 text-lg font-medium mt-4">No Results</Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Try searching for a different name or username
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1">
                            {searchResults.map((user: SearchUser) => (
                                <TouchableOpacity
                                    key={user._id}
                                    className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                    onPress={() => handleUserSelect(user)}
                                >
                                    <Image
                                        source={{
                                            uri: user.avatar || 'https://via.placeholder.com/100x100?text=?'
                                        }}
                                        className="size-12 rounded-full mr-3"
                                    />
                                    <View className="flex-1">
                                        <View className="flex-row items-center">
                                            <Text className="font-semibold text-gray-900 mr-1">
                                                {user.name}
                                            </Text>
                                            {user.verified && (
                                                <Feather name="check-circle" size={16} color="#1DA1F2" />
                                            )}
                                        </View>
                                        <Text className="text-gray-500 text-sm">@{user.username}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default UserSearchModal;
