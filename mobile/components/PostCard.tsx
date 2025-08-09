import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Image } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';

import { Post, User } from '@/types';
import { formatDate, formatNumber } from '@/utils/formatters';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import RetroTransition from '@/components/animations/RetroTransition';

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
    onDislike?: (postId: string) => void;
    onDelete: (postId: string) => void;
    onComment: (post: Post) => void;
    isLiked?: boolean;
    isDisliked?: boolean;
    currentUser: User;
    likingPostId?: string | null;
    dislikingPostId?: string | null;
    deletingPostId?: string | null;
}

const PostCard = ({
    post,
    onLike,
    onDislike,
    onDelete,
    onComment,
    isLiked,
    isDisliked,
    currentUser,
    likingPostId,
    dislikingPostId,
    deletingPostId,
}: PostCardProps) => {
    const { currentTheme } = useEnhancedTheme();
    const isOwnPost = currentUser && post.user._id === currentUser._id;
    const isThisPostLiking = likingPostId === post._id;
    const isThisPostDisliking = dislikingPostId === post._id;
    const isThisPostDeleting = deletingPostId === post._id;

    const { currentUser: authUser } = useCurrentUser();

    // Optimistic update state for instant UI feedback
    const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
    const [optimisticDisliked, setOptimisticDisliked] = useState(isDisliked);
    const [optimisticLikesCount, setOptimisticLikesCount] = useState(post.likes?.length || 0);
    const [optimisticDislikesCount, setOptimisticDislikesCount] = useState(post.dislikes?.length || 0);

    // Update optimistic state when props change (after server response)
    React.useEffect(() => {
        setOptimisticLiked(isLiked);
        setOptimisticDisliked(isDisliked);
        setOptimisticLikesCount(post.likes?.length || 0);
        setOptimisticDislikesCount(post.dislikes?.length || 0);
    }, [isLiked, isDisliked, post.likes?.length, post.dislikes?.length]);

    // Animation refs and state for instant feedback
    const likeScaleAnim = useRef(new Animated.Value(1)).current;
    const dislikeScaleAnim = useRef(new Animated.Value(1)).current;
    const likeButtonScaleAnim = useRef(new Animated.Value(1)).current;
    const dislikeButtonScaleAnim = useRef(new Animated.Value(1)).current;
    const [isAnimatingLike, setIsAnimatingLike] = useState(false);
    const [isAnimatingDislike, setIsAnimatingDislike] = useState(false);

    // Instant like animation with optimistic updates
    const handleLikePress = () => {
        if (isAnimatingLike) return;

        setIsAnimatingLike(true);

        // Optimistic UI update - instant state change
        const wasLiked = optimisticLiked;
        const wasDisliked = optimisticDisliked;

        if (wasLiked) {
            // Unlike: remove like
            setOptimisticLiked(false);
            setOptimisticLikesCount(prev => prev - 1);
        } else {
            // Like: add like and remove dislike if present
            setOptimisticLiked(true);
            setOptimisticLikesCount(prev => prev + 1);

            if (wasDisliked) {
                setOptimisticDisliked(false);
                setOptimisticDislikesCount(prev => prev - 1);
            }
        }

        // Icon scale animation
        Animated.sequence([
            Animated.timing(likeScaleAnim, {
                toValue: 1.4,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(likeScaleAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsAnimatingLike(false);
        });

        // Button scale animation
        Animated.sequence([
            Animated.timing(likeButtonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(likeButtonScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Call the actual like function (server sync happens in background)
        onLike(post._id);
    };

    // Instant dislike animation with optimistic updates
    const handleDislikePress = () => {
        if (isAnimatingDislike || !onDislike) return;

        setIsAnimatingDislike(true);

        // Optimistic UI update - instant state change
        const wasLiked = optimisticLiked;
        const wasDisliked = optimisticDisliked;

        if (wasDisliked) {
            // Remove dislike
            setOptimisticDisliked(false);
            setOptimisticDislikesCount(prev => prev - 1);
        } else {
            // Add dislike and remove like if present
            setOptimisticDisliked(true);
            setOptimisticDislikesCount(prev => prev + 1);

            if (wasLiked) {
                setOptimisticLiked(false);
                setOptimisticLikesCount(prev => prev - 1);
            }
        }

        // Icon scale animation
        Animated.sequence([
            Animated.timing(dislikeScaleAnim, {
                toValue: 1.4,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(dislikeScaleAnim, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsAnimatingDislike(false);
        });

        // Button scale animation
        Animated.sequence([
            Animated.timing(dislikeButtonScaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(dislikeButtonScaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Call the actual dislike function (server sync happens in background)
        onDislike(post._id);
    };

    const handleDelete = () => {
        Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(post._id) },
        ]);
    };

    const handleProfilePress = () => {
        if (post.user._id === authUser?._id) {
            // For current user, navigate to their own profile screen
            router.push("/myProfile");
        } else {
            // Navigate to user profile screen with userId param
            router.push({
                pathname: "/userProfile",
                params: { username: post.user.username }
            });
        }
    };

    return (
        <RetroTransition type="slideUp" delay={50}>
            <View style={{
                backgroundColor: currentTheme.colors.surface + 'F0',
                marginVertical: 6,
                marginHorizontal: 12,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: currentTheme.colors.primary + '20',
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
                overflow: 'hidden',
            }}>
                {/* Header Section with Profile and Actions */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 12,
                }}>
                    {/* Profile Section */}
                    <TouchableOpacity
                        onPress={handleProfilePress}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        {/* Profile Picture */}
                        <View style={{
                            shadowColor: currentTheme.colors.primary,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                        }}>
                            {post.user.profilePicture ? (
                                <Image
                                    source={{ uri: post.user.profilePicture }}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        borderWidth: 2,
                                        borderColor: currentTheme.colors.primary + '60',
                                    }}
                                />
                            ) : (
                                <View style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 22,
                                    backgroundColor: currentTheme.colors.primary,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: currentTheme.colors.primary + '60',
                                }}>
                                    <Text style={{
                                        color: currentTheme.colors.surface,
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                    }}>
                                        {post.user.firstName?.[0]?.toUpperCase() || post.user.username[0]?.toUpperCase()}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* User Info */}
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                color: currentTheme.colors.text,
                                textShadowColor: currentTheme.colors.primary + '40',
                                textShadowOffset: { width: 0.5, height: 0.5 },
                                textShadowRadius: 1,
                            }}>
                                {post.user.firstName} {post.user.lastName}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Text style={{
                                    color: currentTheme.colors.text + 'CC',
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                    marginRight: 8,
                                }}>
                                    @{post.user.username}
                                </Text>
                                <Text style={{
                                    color: currentTheme.colors.text + '99',
                                    fontSize: 13,
                                    fontFamily: 'monospace',
                                }}>
                                    {formatDate(post.createdAt)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    {isOwnPost && (
                        <TouchableOpacity
                            onPress={() => onDelete(post._id)}
                            style={{
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: '#FF444415',
                                borderWidth: 1,
                                borderColor: '#FF444430',
                                marginLeft: 12,
                            }}
                            disabled={isThisPostDeleting}
                        >
                            {isThisPostDeleting ? (
                                <ActivityIndicator size="small" color="#FF4444" />
                            ) : (
                                <Feather name='trash-2' size={16} color='#FF4444' />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Content Section */}
                <View style={{ paddingHorizontal: 16 }}>
                    {/* Post Content */}
                    {post.content && (
                        <TouchableOpacity onPress={() => router.navigate(`/post/${post._id}` as any)}>
                            <Text style={{
                                color: currentTheme.colors.text,
                                fontSize: 16,
                                lineHeight: 24,
                                marginBottom: 12,
                            }}>
                                {post.content}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Post Image */}
                    {post.image && (
                        <TouchableOpacity onPress={() => router.navigate(`/post/${post._id}` as any)}>
                            <Image
                                source={{ uri: post.image }}
                                style={{
                                    width: '100%',
                                    height: undefined,
                                    aspectRatio: 1, // This will be overridden by the image's natural aspect ratio
                                    borderRadius: 12,
                                    marginBottom: 16,
                                    borderWidth: 2,
                                    borderColor: currentTheme.colors.primary + '30',
                                }}
                                resizeMode='cover'
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 16,
                    borderTopWidth: 1,
                    borderTopColor: currentTheme.colors.primary + '20',
                }}>
                    {/* Comments Button */}
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 8,
                            borderRadius: 20,
                            backgroundColor: currentTheme.colors.primary + '10',
                        }}
                        onPress={() => onComment(post)}
                    >
                        <Feather name="message-circle" size={16} color={currentTheme.colors.primary} />
                        <Text style={{
                            color: currentTheme.colors.text + 'CC',
                            fontSize: 12,
                            marginLeft: 4,
                            fontWeight: '600',
                        }}>
                            {formatNumber(post.comments?.length || 0)}
                        </Text>
                    </TouchableOpacity>

                    {/* Like Button */}
                    <Animated.View style={{ transform: [{ scale: likeButtonScaleAnim }] }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 8,
                                borderRadius: 20,
                                backgroundColor: optimisticLiked
                                    ? currentTheme.colors.accent + '20'
                                    : currentTheme.colors.primary + '10',
                            }}
                            onPress={handleLikePress}
                            disabled={false}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
                                <Feather
                                    name="thumbs-up"
                                    size={16}
                                    color={optimisticLiked ? currentTheme.colors.accent : currentTheme.colors.primary}
                                />
                            </Animated.View>
                            <Text style={{
                                fontSize: 12,
                                marginLeft: 4,
                                fontWeight: '600',
                                color: optimisticLiked ? currentTheme.colors.accent : currentTheme.colors.text + 'CC',
                            }}>
                                {formatNumber(optimisticLikesCount)}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Dislike Button */}
                    {onDislike && (
                        <Animated.View style={{ transform: [{ scale: dislikeButtonScaleAnim }] }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 8,
                                    borderRadius: 20,
                                    backgroundColor: optimisticDisliked
                                        ? '#FF444420'
                                        : currentTheme.colors.primary + '10',
                                }}
                                onPress={handleDislikePress}
                                disabled={false}
                                activeOpacity={0.7}
                            >
                                <Animated.View style={{ transform: [{ scale: dislikeScaleAnim }] }}>
                                    <Feather
                                        name="thumbs-down"
                                        size={16}
                                        color={optimisticDisliked ? "#FF4444" : currentTheme.colors.primary}
                                    />
                                </Animated.View>
                                <Text style={{
                                    fontSize: 12,
                                    marginLeft: 4,
                                    fontWeight: '600',
                                    color: optimisticDisliked ? "#FF4444" : currentTheme.colors.text + 'CC',
                                }}>
                                    {formatNumber(optimisticDislikesCount)}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* Net Score */}
                    <View style={{
                        backgroundColor: currentTheme.colors.primary + '20',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.primary + '40',
                    }}>
                        <Text style={{
                            color: currentTheme.colors.text,
                            fontSize: 12,
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                        }}>
                            Net: {optimisticLikesCount - optimisticDislikesCount}
                        </Text>
                    </View>

                    {/* Share Button */}
                    <TouchableOpacity style={{
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: currentTheme.colors.primary + '10',
                    }}>
                        <Feather name="share" size={16} color={currentTheme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </RetroTransition>
    );
};

export default PostCard;
