import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

import { Post, User } from '@/types';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
    onDelete: (postId: string) => void;
    onComment: (post: Post) => void;
    isLiked?: boolean;
    currentUser: User;
    likingPostId?: string | null;
    deletingPostId?: string | null;
}

const PostCard = ({
    post,
    onLike,
    onDelete,
    onComment,
    isLiked,
    currentUser,
    likingPostId,
    deletingPostId,
}: PostCardProps) => {
    const isOwnPost = currentUser && post.user._id === currentUser._id;
    const isThisPostLiking = likingPostId === post._id;
    const isThisPostDeleting = deletingPostId === post._id;

    const navigation = useNavigation();
    const { currentUser: authUser } = useCurrentUser();

    const handleDelete = () => {
        Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(post._id) },
        ]);
    };

    const handleProfilePress = () => {
        if (post.user._id === authUser?._id) {
            // Navigate to current user's profile tab
            router.push("/(tabs)/profile");
        } else {
            // Navigate to user profile screen with userId param
            router.push({
                pathname: "/userProfile",
                params: { username: post.user.username }
            });
        }
    };

    return (
        <View className='border-b border-gray-100 bg-white'>
            <View className='flex-row p-4'>
                <TouchableOpacity onPress={handleProfilePress}>
                    <Image
                        source={{ uri: post.user.profilePicture || "" }}
                        className='w-12 h-12 rounded-full mr-3'
                    />
                </TouchableOpacity>

                <View className='flex-1'>
                    <View className='flex-row items-center justify-between mb-2'>
                        <View className='flex-row items-center'>
                            <Text className='font-bold text-gray-900 mr-1'>{post.user.firstName}</Text>
                            <Text className='text-gray-500 ml-1'>
                                @{post.user.username} · {formatDate(post.createdAt)}
                            </Text>
                        </View>

                        {isOwnPost && (
                            <TouchableOpacity
                                onPress={handleDelete}
                                className='flex-shrink-0 ml-2'
                                disabled={isThisPostDeleting}
                            >
                                {isThisPostDeleting ? (
                                    <ActivityIndicator size="small" color="red" />
                                ) : (
                                    <Feather name='trash-2' size={20} color='red' />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {post.content && (
                        <Text className='text-gray-900 text-base leading-5 mb-3'>{post.content}</Text>
                    )}

                    {post.image && (
                        <Image
                            source={{ uri: post.image }}
                            className='w-full h-64 rounded-lg mb-3'
                            resizeMode='cover'
                        />
                    )}

                    <View className="flex-row justify-between max-w-xs">
                        <TouchableOpacity className="flex-row items-center" onPress={() => onComment(post)}>
                            <Feather name="message-circle" size={18} color="#657786" />
                            <Text className="text-gray-500 text-sm ml-2">
                                {formatNumber(post.comments?.length || 0)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center">
                            <Feather name="repeat" size={18} color="#657786" />
                            <Text className="text-gray-500 text-sm ml-2">0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => onLike(post._id)}
                            disabled={isThisPostLiking}
                        >
                            {isThisPostLiking ? (
                                <ActivityIndicator size="small" color={isLiked ? "#E0245E" : "#657786"} />
                            ) : isLiked ? (
                                <AntDesign name="heart" size={18} color="#E0245E" />
                            ) : (
                                <Feather name="heart" size={18} color="#657786" />
                            )}
                            <Text className={`text-sm ml-2 ${isLiked ? "text-red-500" : "text-gray-500"}`}>
                                {formatNumber(post.likes?.length || 0)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Feather name="share" size={18} color="#657786" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default PostCard;
