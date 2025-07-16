import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/utils/api";

interface User {
    _id: string;
    username: string;
    name: string;
    avatar?: string;
    verified?: boolean;
}

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
    const [searchQuery, setSearchQuery] = useState("");
    const api = useApiClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ["searchUsers", searchQuery],
        queryFn: async () => {
            if (!searchQuery.trim()) return [];
            const response = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
            return response.data.users;
        },
        enabled: searchQuery.trim().length > 0,
    });

    const handleSelectUser = (userId: string) => {
        onSelectUser(userId);
        setSearchQuery("");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose} className="mr-3">
                        <Feather name="x" size={24} color="#1DA1F2" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">New Message</Text>
                </View>

                {/* Search Input */}
                <View className="px-4 py-3 border-b border-gray-100">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                        <Feather name="search" size={20} color="#657786" />
                        <TextInput
                            className="flex-1 ml-3 text-base"
                            placeholder="Search for users..."
                            placeholderTextColor="#657786"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Feather name="x-circle" size={20} color="#657786" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Results */}
                <View className="flex-1">
                    {isLoading ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#1DA1F2" />
                            <Text className="text-gray-500 mt-2">Searching users...</Text>
                        </View>
                    ) : searchQuery.trim().length === 0 ? (
                        <View className="flex-1 justify-center items-center px-4">
                            <Feather name="search" size={64} color="#e5e7eb" />
                            <Text className="text-gray-500 text-lg font-medium mt-4">
                                Search for users
                            </Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Enter a name or username to find people to message
                            </Text>
                        </View>
                    ) : users.length === 0 ? (
                        <View className="flex-1 justify-center items-center px-4">
                            <Feather name="user-x" size={64} color="#e5e7eb" />
                            <Text className="text-gray-500 text-lg font-medium mt-4">
                                No users found
                            </Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Try searching for a different name or username
                            </Text>
                        </View>
                    ) : (
                        <ScrollView className="flex-1">
                            {users.map((user: User) => (
                                <TouchableOpacity
                                    key={user._id}
                                    className="flex-row items-center p-4 border-b border-gray-50 active:bg-gray-50"
                                    onPress={() => handleSelectUser(user._id)}
                                >
                                    <Image
                                        source={{
                                            uri: user.avatar || 'https://via.placeholder.com/100x100?text=?'
                                        }}
                                        className="size-12 rounded-full mr-3"
                                    />
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1">
                                            <Text className="font-semibold text-gray-900">{user.name}</Text>
                                            {user.verified && (
                                                <Feather name="check-circle" size={16} color="#1DA1F2" />
                                            )}
                                        </View>
                                        <Text className="text-gray-500 text-sm">@{user.username}</Text>
                                    </View>
                                    <Feather name="message-circle" size={20} color="#1DA1F2" />
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
