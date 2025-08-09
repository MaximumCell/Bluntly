import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import Feather from "@expo/vector-icons/build/Feather";
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import { PanGestureHandler, PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import RetroTransition from '@/components/animations/RetroTransition';
import RetroLoader from '@/components/animations/RetroLoader';

interface CommentsModalProps {
  selectedPost: Post;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const {
    comments,
    setComments,
    createComment,
    isCreatingComment,
    deleteComment,
    toggleCommentLike,
    toggleCommentDislike,
    checkIsCommentLiked,
    checkIsCommentDisliked,
    likingCommentId,
    dislikingCommentId
  } = useComments();
  const { currentUser } = useCurrentUser();
  const { currentTheme, currentPeriod, animationLevel } = useEnhancedTheme();

  // Enhanced contrast colors for better visibility
  const contrastColors = {
    // Ensure text is always readable
    primaryText: currentTheme.colors.text === currentTheme.colors.surface ? '#000000' : currentTheme.colors.text,
    secondaryText: currentTheme.colors.secondary === currentTheme.colors.surface ? '#666666' : currentTheme.colors.secondary,
    // Use contrasting background
    cardBackground: currentTheme.colors.surface === currentTheme.colors.background[0] ? 'rgba(255, 255, 255, 0.95)' : currentTheme.colors.surface,
    // High contrast borders
    strongBorder: currentTheme.colors.border === currentTheme.colors.surface ? 'rgba(0, 0, 0, 0.2)' : currentTheme.colors.border,
    // Ensure button text is visible
    buttonText: currentTheme.colors.surface === currentTheme.colors.primary ? '#FFFFFF' : currentTheme.colors.surface,
    // Enhanced accent for better visibility
    accentColor: currentTheme.colors.accent === currentTheme.colors.surface ? currentTheme.colors.primary : currentTheme.colors.accent,
  };

  // Local state for optimistic updates
  const [localPost, setLocalPost] = useState(selectedPost);

  // Update local state when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      setLocalPost(selectedPost);
    }
  }, [selectedPost]);

  // Optimistic comment like handler
  const handleCommentLike = async (commentId: string) => {
    if (!currentUser) return;

    // Optimistically update local state
    setLocalPost(prev => ({
      ...prev,
      comments: prev.comments.map(comment => {
        if (comment._id === commentId) {
          const isLiked = comment.likes.includes(currentUser._id);
          const newLikes = isLiked
            ? comment.likes.filter(id => id !== currentUser._id)
            : [...comment.likes, currentUser._id];

          // Remove from dislikes if present
          const newDislikes = comment.dislikes.filter(id => id !== currentUser._id);

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes
          };
        }
        return comment;
      })
    }));

    // Call the actual mutation
    toggleCommentLike(commentId);
  };

  // Optimistic comment dislike handler
  const handleCommentDislike = async (commentId: string) => {
    if (!currentUser) return;

    // Optimistically update local state
    setLocalPost(prev => ({
      ...prev,
      comments: prev.comments.map(comment => {
        if (comment._id === commentId) {
          const isDisliked = comment.dislikes.includes(currentUser._id);
          const newDislikes = isDisliked
            ? comment.dislikes.filter(id => id !== currentUser._id)
            : [...comment.dislikes, currentUser._id];

          // Remove from likes if present
          const newLikes = comment.likes.filter(id => id !== currentUser._id);

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes
          };
        }
        return comment;
      })
    }));

    // Call the actual mutation
    toggleCommentDislike(commentId);
  };

  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenHeight = Dimensions.get('window').height;

  // Reanimated values
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);
  const dragIndicatorOpacity = useSharedValue(0.6);

  // Reset modal position when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      translateY.value = screenHeight * 0.6;
      backdropOpacity.value = 0;

      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });

      setIsScrollAtTop(true);
      setIsTyping(false);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedPost, translateY, backdropOpacity, screenHeight]);

  const closeModal = () => {
    onClose();
    setComments("");
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: (_, context: Record<string, any>) => {
      context.startY = translateY.value;
      dragIndicatorOpacity.value = withTiming(1, { duration: 200 });
    },
    onActive: (event, context: Record<string, any>) => {
      if (event.translationY > 0) {
        translateY.value = Math.max(0, context.startY + event.translationY);
        backdropOpacity.value = Math.max(0.2, 1 - (event.translationY / (screenHeight * 0.6)) * 1.5);
      }
    },
    onEnd: (event) => {
      dragIndicatorOpacity.value = withTiming(0.6, { duration: 200 });

      if (event.translationY > 50 || event.velocityY > 800) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

        translateY.value = withTiming(screenHeight * 0.6, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        setTimeout(() => {
          runOnJS(closeModal)();
        }, 250);
      } else {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);

        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 150,
        });
        backdropOpacity.value = withSpring(1);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const dragIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: dragIndicatorOpacity.value,
    };
  });

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const newIsScrollAtTop = scrollY <= 10;
    setIsScrollAtTop(newIsScrollAtTop);

    if (newIsScrollAtTop && !isTyping) {
      dragIndicatorOpacity.value = withTiming(0.8, { duration: 200 });
    } else {
      dragIndicatorOpacity.value = withTiming(0.4, { duration: 200 });
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    translateY.value = withTiming(screenHeight * 0.6, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => {
      closeModal();
    }, 250);
  };

  return (
    <Modal visible={!!selectedPost} animationType="fade" presentationStyle="overFullScreen" transparent>
      <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }, backdropStyle]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={{ flex: 1 }} />
        </TouchableOpacity>

        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: screenHeight * 0.6,
              backgroundColor: contrastColors.cardBackground,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 3,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderTopColor: contrastColors.accentColor,
              borderLeftColor: contrastColors.strongBorder,
              borderRightColor: contrastColors.strongBorder,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 12,
            },
            animatedStyle
          ]}
        >
          <PanGestureHandler
            onGestureEvent={gestureHandler}
            minPointers={1}
            maxPointers={1}
            avgTouches={true}
          >
            <Animated.View style={{ flex: 1 }}>
              {/* Drag Indicator */}
              <View className="items-center py-4">
                <Animated.View
                  style={[
                    {
                      width: 60,
                      height: 5,
                      backgroundColor: contrastColors.accentColor,
                      borderRadius: 3,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6,
                    },
                    dragIndicatorStyle
                  ]}
                />
              </View>

              {/* MODAL HEADER */}
              <RetroTransition type="slideUp" delay={0}>
                <View
                  className="flex-row items-center justify-between px-6 py-4"
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: contrastColors.strongBorder,
                    backgroundColor: contrastColors.cardBackground
                  }}
                >
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: currentTheme.colors.primary,
                      borderWidth: 2,
                      borderColor: contrastColors.accentColor,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                    }}
                  >
                    <Text style={{ color: contrastColors.buttonText }} className="font-semibold">Close</Text>
                  </TouchableOpacity>
                  <Text style={{ color: contrastColors.primaryText }} className="text-xl font-bold">
                    Comments ({localPost?.comments?.length || 0})
                  </Text>
                  <View className="w-16" />
                </View>
              </RetroTransition>

              {localPost && (
                <ScrollView
                  ref={scrollViewRef}
                  className="flex-1"
                  style={{ backgroundColor: 'rgba(240, 240, 240, 0.9)' }}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  bounces={true}
                >
                  {/* COMMENTS LIST */}
                  {localPost.comments && localPost.comments.length > 0 ? (
                    localPost.comments.map((comment, index) => (
                      <RetroTransition key={comment._id} type="slideUp" delay={100 + (index * 50)}>
                        <View
                          className="p-4 mx-4 my-2 rounded-xl"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderWidth: 2,
                            borderColor: contrastColors.strongBorder,
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 6,
                            elevation: 3,
                          }}
                        >
                          {/* Header Row: Profile Info and Delete Button */}
                          <View className="flex-row items-center justify-between mb-3">
                            {/* Profile Info Section */}
                            <View className="flex-row items-center flex-1">
                              <View
                                style={{
                                  borderWidth: 2,
                                  borderColor: contrastColors.accentColor,
                                  borderRadius: 22,
                                  padding: 2,
                                }}
                              >
                                <Image
                                  source={{ uri: comment.user.profilePicture }}
                                  className="w-10 h-10 rounded-full"
                                />
                              </View>

                              <View className="ml-3 flex-1">
                                <Text
                                  style={{ color: contrastColors.primaryText }}
                                  className="font-bold text-base"
                                  numberOfLines={1}
                                >
                                  {comment.user.firstName} {comment.user.lastName}
                                </Text>
                                <Text
                                  style={{ color: contrastColors.secondaryText }}
                                  className="text-sm"
                                  numberOfLines={1}
                                >
                                  @{comment.user.username}
                                </Text>
                              </View>
                            </View>

                            {/* Delete Button Section */}
                            {currentUser._id === comment.user._id && (
                              <View className="ml-2">
                                <TouchableOpacity
                                  onPress={() => deleteComment(comment._id)}
                                  className="p-2 rounded-full"
                                  style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderWidth: 1,
                                    borderColor: '#EF4444'
                                  }}
                                >
                                  <Feather name="trash-2" size={16} color="#EF4444" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {/* Comment Content */}
                          <View className="mb-3">
                            <Text
                              style={{ color: contrastColors.primaryText }}
                              className="text-base leading-6"
                            >
                              {comment.content}
                            </Text>
                          </View>                          {/* Like/Dislike buttons */}
                          <View className="flex-row items-center space-x-4">
                            {/* Like button */}
                            <TouchableOpacity
                              onPress={() => handleCommentLike(comment._id)}
                              className="flex-row items-center space-x-2 px-3 py-2 rounded-full"
                              disabled={likingCommentId === comment._id}
                              style={{
                                backgroundColor: checkIsCommentLiked(comment.likes, currentUser)
                                  ? 'rgba(34, 197, 94, 0.1)'
                                  : 'rgba(255, 255, 255, 0.8)',
                                borderWidth: 2,
                                borderColor: checkIsCommentLiked(comment.likes, currentUser)
                                  ? '#22C55E'
                                  : contrastColors.strongBorder,
                              }}
                            >
                              <Ionicons
                                name={checkIsCommentLiked(comment.likes, currentUser) ? "heart" : "heart-outline"}
                                size={18}
                                color={checkIsCommentLiked(comment.likes, currentUser) ? '#22C55E' : '#666666'}
                              />
                              <Text
                                className="text-sm font-medium"
                                style={{
                                  color: checkIsCommentLiked(comment.likes, currentUser) ? '#22C55E' : '#666666'
                                }}
                              >
                                {comment.likes?.length || 0}
                              </Text>
                            </TouchableOpacity>

                            {/* Dislike button */}
                            <TouchableOpacity
                              onPress={() => handleCommentDislike(comment._id)}
                              className="flex-row items-center space-x-2 px-3 py-2 rounded-full"
                              disabled={dislikingCommentId === comment._id}
                              style={{
                                backgroundColor: checkIsCommentDisliked(comment.dislikes, currentUser)
                                  ? 'rgba(239, 68, 68, 0.1)'
                                  : 'rgba(255, 255, 255, 0.8)',
                                borderWidth: 2,
                                borderColor: checkIsCommentDisliked(comment.dislikes, currentUser)
                                  ? '#EF4444'
                                  : contrastColors.strongBorder,
                              }}
                            >
                              <Ionicons
                                name={checkIsCommentDisliked(comment.dislikes, currentUser) ? "heart-dislike" : "heart-dislike-outline"}
                                size={18}
                                color={checkIsCommentDisliked(comment.dislikes, currentUser) ? '#EF4444' : '#666666'}
                              />
                              <Text
                                className="text-sm font-medium"
                                style={{
                                  color: checkIsCommentDisliked(comment.dislikes, currentUser) ? '#EF4444' : '#666666'
                                }}
                              >
                                {comment.dislikes?.length || 0}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </RetroTransition>
                    ))
                  ) : (
                    // No comments state
                    <RetroTransition type="scaleIn" delay={200}>
                      <View className="flex-1 items-center justify-center py-16">
                        <View className="items-center">
                          <View
                            className="w-16 h-16 rounded-full items-center justify-center mb-4"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              borderWidth: 2,
                              borderColor: contrastColors.strongBorder
                            }}
                          >
                            <Ionicons name="chatbubble-outline" size={32} color="#666666" />
                          </View>
                          <Text style={{ color: contrastColors.primaryText }} className="text-xl font-bold mb-2">No comments yet</Text>
                          <Text style={{ color: contrastColors.secondaryText }} className="text-center text-base">
                            Be the first to share your thoughts!
                          </Text>
                        </View>
                      </View>
                    </RetroTransition>
                  )}

                  {/* ADD COMMENT INPUT */}
                  <RetroTransition type="slideUp" delay={300}>
                    <View
                      className="p-4 mx-4 mb-4 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderWidth: 2,
                        borderColor: contrastColors.strongBorder,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                        elevation: 3,
                      }}
                    >
                      {/* Header Row: Profile and Title */}
                      <View className="flex-row items-center mb-4">
                        <View
                          style={{
                            borderWidth: 2,
                            borderColor: contrastColors.accentColor,
                            borderRadius: 22,
                            padding: 2,
                          }}
                        >
                          <Image
                            source={{ uri: currentUser?.profilePicture }}
                            className="w-10 h-10 rounded-full"
                          />
                        </View>

                        <Text style={{ color: contrastColors.primaryText }} className="text-lg font-bold ml-3">
                          Add a comment
                        </Text>
                      </View>

                      {/* Input and Button Row */}
                      <View className="space-y-3">
                        <TextInput
                          style={{
                            borderWidth: 2,
                            borderColor: contrastColors.strongBorder,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: contrastColors.primaryText,
                            borderRadius: 16,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            fontSize: 16,
                            minHeight: 80,
                            maxHeight: 150,
                            textAlignVertical: 'top',
                            lineHeight: 22,
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 1,
                          }}
                          placeholder="Share your thoughts..."
                          placeholderTextColor="#999999"
                          value={comments}
                          onChangeText={setComments}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          multiline
                        />

                        <View className="flex-row justify-end">
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: 20,
                              paddingVertical: 10,
                              borderRadius: 20,
                              backgroundColor: comments.trim()
                                ? currentTheme.colors.primary
                                : 'rgba(200, 200, 200, 0.8)',
                              borderWidth: 2,
                              borderColor: comments.trim()
                                ? contrastColors.accentColor
                                : contrastColors.strongBorder,
                              shadowColor: '#000000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              minWidth: 120,
                            }}
                            onPress={() => createComment(localPost._id)}
                            disabled={isCreatingComment || !comments.trim()}
                          >
                            {isCreatingComment ? (
                              <View className="flex-row items-center justify-center">
                                <RetroLoader size="small" style="neon" />
                              </View>
                            ) : (
                              <Text
                                className="text-center"
                                style={{
                                  color: comments.trim()
                                    ? contrastColors.buttonText
                                    : '#666666',
                                  fontWeight: '600',
                                  fontSize: 15,
                                }}
                              >
                                Post Comment
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </RetroTransition>
                </ScrollView>
              )}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CommentsModal;