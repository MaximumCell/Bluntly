import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import Feather from "@expo/vector-icons/build/Feather";import {
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

interface CommentsModalProps {
  selectedPost: Post;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const { comments, setComments, createComment, isCreatingComment, deleteComment } = useComments();
  const { currentUser } = useCurrentUser();

  const [isScrollAtTop, setIsScrollAtTop] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenHeight = Dimensions.get('window').height;

  // Reanimated values
  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);
  const dragIndicatorOpacity = useSharedValue(0.6); // More visible by default

  // Reset modal position when selectedPost changes
  useEffect(() => {
    if (selectedPost) {
      // Animate modal entrance
      translateY.value = screenHeight * 0.6; // Half screen height
      backdropOpacity.value = 0;

      // Animate in with spring
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 120,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });

      setIsScrollAtTop(true);
      setIsTyping(false);

      // Haptic feedback on modal open
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
      // Highlight drag indicator when starting to drag
      dragIndicatorOpacity.value = withTiming(1, { duration: 200 });
    },
    onActive: (event, context: Record<string, any>) => {
      // Allow downward movement from anywhere - more permissive
      if (event.translationY > 0) {
        translateY.value = Math.max(0, context.startY + event.translationY);
        // Update backdrop opacity based on drag distance
        backdropOpacity.value = Math.max(0.2, 1 - (event.translationY / (screenHeight * 0.6)) * 1.5);
      }
    },
    onEnd: (event) => {
      // Reset drag indicator opacity
      dragIndicatorOpacity.value = withTiming(0.6, { duration: 200 });

      // Much more lenient closing conditions - easier to close
      if (event.translationY > 50 || event.velocityY > 800) {
        // Haptic feedback on close
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

        translateY.value = withTiming(screenHeight * 0.6, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 250 });
        // Close modal after animation
        setTimeout(() => {
          runOnJS(closeModal)();
        }, 250);
      } else {
        // Haptic feedback on bounce back
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);

        // Otherwise, spring back to original position
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
    const newIsScrollAtTop = scrollY <= 10; // Slightly larger buffer for half-screen
    setIsScrollAtTop(newIsScrollAtTop);

    // Update drag indicator visibility based on scroll position
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
      <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }, backdropStyle]}>
        {/* Backdrop touchable area */}
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
              height: screenHeight * 0.6, // Changed from 0.9 to 0.6 for half screen
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
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
                      backgroundColor: '#9CA3AF',
                      borderRadius: 3,
                    },
                    dragIndicatorStyle
                  ]}
                />
              </View>

              {/* MODAL HEADER */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={handleClose}>
                  <Text className="text-blue-500 text-lg">Close</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Comments</Text>
                <View className="w-12" />
              </View>

              {selectedPost && (
                <ScrollView
                  ref={scrollViewRef}
                  className="flex-1"
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                  bounces={true}
                >
                  {/* ORIGINAL POST */}
                  <View className="border-b border-gray-100 bg-white p-4">
                    <View className="flex-row">
                      <Image
                        source={{ uri: selectedPost.user.profilePicture }}
                        className="size-12 rounded-full mr-3"
                      />

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="font-bold text-gray-900 mr-1">
                            {selectedPost.user.firstName} {selectedPost.user.lastName}
                          </Text>
                          <Text className="text-gray-500 ml-1">@{selectedPost.user.username}</Text>
                        </View>

                        {selectedPost.content && (
                          <Text className="text-gray-900 text-base leading-5 mb-3">
                            {selectedPost.content}
                          </Text>
                        )}

                        {selectedPost.image && (
                          <Image
                            source={{ uri: selectedPost.image }}
                            className="w-full h-48 rounded-2xl mb-3"
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* COMMENTS LIST */}
                  {selectedPost.comments.map((comment) => (
                    <View key={comment._id} className="border-b border-gray-100 bg-white p-4">
                      <View className="flex-row">
                        <Image
                          source={{ uri: comment.user.profilePicture }}
                          className="w-10 h-10 rounded-full mr-3"
                        />

                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="font-bold text-gray-900 mr-1">
                              {comment.user.firstName} {comment.user.lastName}
                            </Text>
                            <Text className="text-gray-500 text-sm ml-1">@{comment.user.username}</Text>
                          </View>

                          <Text className="text-gray-900 text-base leading-5 mb-2">{comment.content}</Text>
                        </View>

                        {/* Only show delete button if current user is the comment owner */}
                        {currentUser._id === comment.user._id && (
                          <View>
                            <TouchableOpacity onPress={() => deleteComment(comment._id)}>
                              <Feather name="trash-2" size={20} color="red" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}

                  {/* ADD COMMENT INPUT */}
                  <View className="p-4 border-t border-gray-100">
                    <View className="flex-row">
                      <Image
                        source={{ uri: currentUser?.profilePicture }}
                        className="size-10 rounded-full mr-3"
                      />

                      <View className="flex-1">
                        <TextInput
                          className="border border-gray-200 rounded-lg p-3 text-base mb-3"
                          placeholder="Write a comment..."
                          value={comments}
                          onChangeText={setComments}
                          onFocus={() => setIsTyping(true)}
                          onBlur={() => setIsTyping(false)}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />

                        <TouchableOpacity
                          className={`px-4 py-2 rounded-lg self-start ${comments.trim() ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          onPress={() => createComment(selectedPost._id)}
                          disabled={isCreatingComment || !comments.trim()}
                        >
                          {isCreatingComment ? (
                            <ActivityIndicator size={"small"} color={"white"} />
                          ) : (
                            <Text
                              className={`font-semibold ${comments.trim() ? "text-white" : "text-gray-500"
                                }`}
                            >
                              Reply
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View></ScrollView>
              )}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CommentsModal;