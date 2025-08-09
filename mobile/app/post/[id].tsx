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
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import RetroTransition from '@/components/animations/RetroTransition';
import RetroLoader from '@/components/animations/RetroLoader';

const PostDetailScreen = () => {
    const { currentTheme } = useEnhancedTheme();
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
            <View style={{
                flex: 1,
                backgroundColor: currentTheme.colors.surface,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <RetroLoader />
                <Text style={{
                    color: currentTheme.colors.text + 'CC',
                    marginTop: 16,
                    fontFamily: 'monospace',
                    fontSize: 16
                }}>
                    Loading post...
                </Text>
            </View>
        );
    }

    if (error || !postData) {
        return (
            <RetroTransition>
                <View style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20
                }}>
                    <Text style={{
                        color: currentTheme.colors.text + 'CC',
                        textAlign: 'center',
                        fontSize: 16,
                        fontFamily: 'monospace',
                        marginBottom: 20
                    }}>
                        Failed to load post
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            backgroundColor: currentTheme.colors.primary,
                            borderRadius: 25,
                            shadowColor: currentTheme.colors.primary,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.5,
                            shadowRadius: 4,
                            elevation: 5,
                        }}
                    >
                        <Text style={{
                            color: currentTheme.colors.surface,
                            fontWeight: 'bold',
                            fontFamily: 'monospace'
                        }}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </RetroTransition>
        );
    }

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: currentTheme.colors.surface
        }}>
            {/* Enhanced Header */}
            <RetroTransition>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: 2,
                    borderBottomColor: currentTheme.colors.primary + '30',
                    backgroundColor: currentTheme.colors.surface + 'F0',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            marginRight: 16,
                            padding: 8,
                            borderRadius: 20,
                            backgroundColor: currentTheme.colors.primary + '10',
                        }}
                    >
                        <Feather name="arrow-left" size={24} color={currentTheme.colors.primary} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: currentTheme.colors.text,
                        fontFamily: 'monospace',
                        textShadowColor: currentTheme.colors.primary + '40',
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 1,
                    }}>
                        Post Details
                    </Text>
                </View>
            </RetroTransition>

            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.surface
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Post Content */}
                <RetroTransition type="slideUp" delay={100}>
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
                </RetroTransition>

                {/* Enhanced Comments Section */}
                <RetroTransition type="slideUp" delay={200}>
                    <View style={{
                        borderTopWidth: 2,
                        borderTopColor: currentTheme.colors.primary + '30',
                        paddingHorizontal: 16,
                        paddingVertical: 16,
                        backgroundColor: currentTheme.colors.surface + 'F0',
                        marginTop: 8,
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginBottom: 16,
                            color: currentTheme.colors.text,
                            fontFamily: 'monospace',
                            textShadowColor: currentTheme.colors.primary + '40',
                            textShadowOffset: { width: 0.5, height: 0.5 },
                            textShadowRadius: 1,
                        }}>
                            Comments ({postData.comments?.length || 0})
                        </Text>

                        {/* Enhanced Add Comment */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 16,
                            padding: 12,
                            backgroundColor: currentTheme.colors.primary + '10',
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: currentTheme.colors.primary + '30',
                        }}>
                            <TextInput
                                style={{
                                    flex: 1,
                                    color: currentTheme.colors.text,
                                    marginRight: 12,
                                    fontSize: 16,
                                    fontFamily: 'monospace',
                                }}
                                placeholder="Add a comment..."
                                placeholderTextColor={currentTheme.colors.text + '80'}
                                value={comments}
                                onChangeText={setComments}
                                multiline
                                maxLength={280}
                            />
                            <TouchableOpacity
                                onPress={() => createComment(postData._id)}
                                disabled={isCreatingComment || !comments.trim()}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: (isCreatingComment || !comments.trim())
                                        ? currentTheme.colors.text + '30'
                                        : currentTheme.colors.primary,
                                    shadowColor: (isCreatingComment || !comments.trim())
                                        ? 'transparent'
                                        : currentTheme.colors.primary,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 4,
                                    elevation: (isCreatingComment || !comments.trim()) ? 0 : 5,
                                }}
                            >
                                {isCreatingComment ? (
                                    <ActivityIndicator size="small" color={currentTheme.colors.surface} />
                                ) : (
                                    <Text style={{
                                        color: (isCreatingComment || !comments.trim())
                                            ? currentTheme.colors.text + '80'
                                            : currentTheme.colors.surface,
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace'
                                    }}>
                                        Post
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Enhanced Comments List */}
                        {postData.comments && postData.comments.length > 0 ? (
                            postData.comments.map((comment: Comment, index: number) => (
                                <RetroTransition key={comment._id} type="slideUp" delay={300 + (index * 50)}>
                                    <View style={{
                                        borderBottomWidth: 1,
                                        borderBottomColor: currentTheme.colors.primary + '20',
                                        paddingVertical: 12,
                                        backgroundColor: currentTheme.colors.surface + 'F0',
                                        marginBottom: 8,
                                        borderRadius: 12,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: currentTheme.colors.primary + '20',
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            {/* Enhanced Profile Picture */}
                                            <Image
                                                source={{ uri: comment.user.profilePicture }}
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 20,
                                                    marginRight: 12,
                                                    borderWidth: 2,
                                                    borderColor: currentTheme.colors.primary + '60',
                                                }}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginBottom: 4,
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <Text style={{
                                                        fontWeight: 'bold',
                                                        color: currentTheme.colors.text,
                                                        fontSize: 14,
                                                        marginRight: 8,
                                                    }}>
                                                        {comment.user.firstName} {comment.user.lastName}
                                                    </Text>
                                                    <Text style={{
                                                        color: currentTheme.colors.text + 'CC',
                                                        fontSize: 12,
                                                        fontFamily: 'monospace',
                                                        marginRight: 8,
                                                    }}>
                                                        @{comment.user.username}
                                                    </Text>
                                                    <Text style={{
                                                        color: currentTheme.colors.text + '99',
                                                        fontSize: 12,
                                                        fontFamily: 'monospace',
                                                    }}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                                <Text style={{
                                                    color: currentTheme.colors.text,
                                                    marginBottom: 8,
                                                    fontSize: 14,
                                                    lineHeight: 20,
                                                }}>
                                                    {comment.content}
                                                </Text>

                                                {/* Enhanced Comment Actions */}
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <TouchableOpacity
                                                        onPress={() => toggleCommentLike(comment._id)}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            marginRight: 16,
                                                            padding: 6,
                                                            borderRadius: 16,
                                                            backgroundColor: checkIsCommentLiked(comment.likes, currentUser)
                                                                ? currentTheme.colors.accent + '20'
                                                                : currentTheme.colors.primary + '10',
                                                        }}
                                                        disabled={likingCommentId === comment._id}
                                                    >
                                                        <Feather
                                                            name="thumbs-up"
                                                            size={14}
                                                            color={
                                                                checkIsCommentLiked(comment.likes, currentUser)
                                                                    ? currentTheme.colors.accent
                                                                    : currentTheme.colors.primary
                                                            }
                                                        />
                                                        <Text style={{
                                                            marginLeft: 4,
                                                            color: checkIsCommentLiked(comment.likes, currentUser)
                                                                ? currentTheme.colors.accent
                                                                : currentTheme.colors.text + 'CC',
                                                            fontSize: 12,
                                                            fontWeight: '600',
                                                        }}>
                                                            {comment.likes.length}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => toggleCommentDislike(comment._id)}
                                                        style={{
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            marginRight: 16,
                                                            padding: 6,
                                                            borderRadius: 16,
                                                            backgroundColor: checkIsCommentDisliked(comment.dislikes, currentUser)
                                                                ? '#FF444420'
                                                                : currentTheme.colors.primary + '10',
                                                        }}
                                                        disabled={dislikingCommentId === comment._id}
                                                    >
                                                        <Feather
                                                            name="thumbs-down"
                                                            size={14}
                                                            color={
                                                                checkIsCommentDisliked(comment.dislikes, currentUser)
                                                                    ? "#FF4444"
                                                                    : currentTheme.colors.primary
                                                            }
                                                        />
                                                        <Text style={{
                                                            marginLeft: 4,
                                                            color: checkIsCommentDisliked(comment.dislikes, currentUser)
                                                                ? "#FF4444"
                                                                : currentTheme.colors.text + 'CC',
                                                            fontSize: 12,
                                                            fontWeight: '600',
                                                        }}>
                                                            {comment.dislikes.length}
                                                        </Text>
                                                    </TouchableOpacity>

                                                    {currentUser?._id === comment.user._id && (
                                                        <TouchableOpacity
                                                            onPress={() => deleteComment(comment._id)}
                                                            style={{
                                                                marginLeft: 'auto',
                                                                padding: 6,
                                                                borderRadius: 16,
                                                                backgroundColor: '#FF444415',
                                                            }}
                                                        >
                                                            <Feather name="trash-2" size={14} color="#FF4444" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </RetroTransition>
                            ))
                        ) : (
                            <RetroTransition type="fadeIn" delay={300}>
                                <Text style={{
                                    color: currentTheme.colors.text + 'CC',
                                    textAlign: 'center',
                                    paddingVertical: 32,
                                    fontSize: 16,
                                    fontFamily: 'monospace',
                                }}>
                                    No comments yet. Be the first to comment!
                                </Text>
                            </RetroTransition>
                        )}
                    </View>
                </RetroTransition>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PostDetailScreen;
