import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useApiClient, postsApi } from '@/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useComments } from '@/hooks/useComments';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/PostCard';
import { Comment } from '@/types';

const PostDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const api = useApiClient();
    const { currentUser } = useCurrentUser();
    const {
        toggleLike,
        toggleDislike,
        deletePost,
        checkIsLiked,
        checkIsDisliked,
        likingPostId,
        dislikingPostId,
        deletingPostId
    } = usePosts();
    const {
        comments,
        createComment,
        setComments,
        isCreatingComment,
        toggleCommentLike,
        toggleCommentDislike,
        checkIsCommentLiked,
        checkIsCommentDisliked,
        deleteComment,
        likingCommentId,
        dislikingCommentId
    } = useComments();

    const { data: postData, isLoading, error } = useQuery({
        queryKey: ["post", id],
        queryFn: () => postsApi.getPost(api, id!),
        select: (response) => response.data.post,
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    if (error || !postData) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Text className="text-gray-500 text-center">Failed to load post</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
                >
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Post</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Post Content */}
                <PostCard
                    post={postData}
                    currentUser={currentUser}
                    onLike={toggleLike}
                    onDislike={toggleDislike}
                    onDelete={deletePost}
                    onComment={() => { }} // We handle comments differently on this page
                    isLiked={checkIsLiked(postData.likes, currentUser)}
                    isDisliked={checkIsDisliked(postData.dislikes, currentUser)}
                    likingPostId={likingPostId}
                    dislikingPostId={dislikingPostId}
                    deletingPostId={deletingPostId}
                />

                {/* Comments Section */}
                <View className="border-t border-gray-100 px-4 py-4">
                    <Text className="text-lg font-bold mb-4">
                        Comments ({postData.comments?.length || 0})
                    </Text>

                    {/* Add Comment */}
                    <View className="flex-row items-center mb-4 p-3 bg-gray-50 rounded-lg">
                        <TextInput
                            className="flex-1 text-gray-900 mr-3"
                            placeholder="Add a comment..."
                            value={comments}
                            onChangeText={setComments}
                            multiline
                            maxLength={280}
                        />
                        <TouchableOpacity
                            onPress={() => createComment(postData._id)}
                            disabled={isCreatingComment || !comments.trim()}
                            className={`px-4 py-2 rounded-lg ${isCreatingComment || !comments.trim()
                                ? 'bg-gray-300'
                                : 'bg-blue-500'
                                }`}
                        >
                            {isCreatingComment ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold">Post</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    {postData.comments && postData.comments.length > 0 ? (
                        postData.comments.map((comment: Comment) => (
                            <View key={comment._id} className="border-b border-gray-50 py-3">
                                <View className="flex-row items-start">
                                    {/* Profile Picture */}
                                    <Image
                                        source={{ uri: comment.user.profilePicture }}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-1">
                                            <Text className="font-semibold text-gray-900">
                                                {comment.user.firstName} {comment.user.lastName}
                                            </Text>
                                            <Text className="text-gray-500 ml-2">
                                                @{comment.user.username}
                                            </Text>
                                            <Text className="text-gray-500 ml-2">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-900 mb-2">{comment.content}</Text>

                                        {/* Comment Actions */}
                                        <View className="flex-row items-center">
                                            <TouchableOpacity
                                                onPress={() => toggleCommentLike(comment._id)}
                                                className="flex-row items-center mr-4"
                                                disabled={likingCommentId === comment._id}
                                            >
                                                <Feather
                                                    name="thumbs-up"
                                                    size={16}
                                                    color={
                                                        checkIsCommentLiked(comment.likes, currentUser)
                                                            ? "#22C55E"
                                                            : "#6B7280"
                                                    }
                                                />
                                                <Text className="ml-1 text-gray-600 text-sm">
                                                    {comment.likes.length}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => toggleCommentDislike(comment._id)}
                                                className="flex-row items-center mr-4"
                                                disabled={dislikingCommentId === comment._id}
                                            >
                                                <Feather
                                                    name="thumbs-down"
                                                    size={16}
                                                    color={
                                                        checkIsCommentDisliked(comment.dislikes, currentUser)
                                                            ? "#EF4444"
                                                            : "#6B7280"
                                                    }
                                                />
                                                <Text className="ml-1 text-gray-600 text-sm">
                                                    {comment.dislikes.length}
                                                </Text>
                                            </TouchableOpacity>

                                            {currentUser?._id === comment.user._id && (
                                                <TouchableOpacity
                                                    onPress={() => deleteComment(comment._id)}
                                                    className="ml-auto"
                                                >
                                                    <Feather name="trash-2" size={16} color="#EF4444" />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-500 text-center py-8">
                            No comments yet. Be the first to comment!
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PostDetailScreen;
