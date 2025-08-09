import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFollow, useUserProfile } from '@/hooks/useFollow';
import { usePosts } from '@/hooks/usePosts';
import PostsList from '@/components/PostsList';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import EnhancedRetroBackground from '@/components/animations/EnhancedRetroBackground';
import RetroTransition from '@/components/animations/RetroTransition';

const UserProfile = ({ username }: { username: string }) => {
  // ALL hooks must be called first, before any conditional logic
  const { currentTheme, currentPeriod } = useEnhancedTheme();
  const insets = useSafeAreaInsets();
  const { currentUser, isLoading: loadingCurrentUser } = useCurrentUser();
  const { user, isLoading, refetch: refetchProfile } = useUserProfile(username);
  const { posts, refetch: refetchPosts, isLoading: isRefetching } = usePosts(user?.username);
  const { toggleFollow, isPending } = useFollow();

  // console.log("User Profile:", user, "Current User:", currentUser);

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (user?.followers && currentUser?._id) {
      // Check if current user's MongoDB _id is in the followers array
      setIsFollowing(user.followers.includes(currentUser._id));
    }
  }, [user, currentUser]);

  const handleToggleFollow = () => {
    if (!user?.clerkId) {
      console.error("User clerkId not available");
      return;
    }

    // console.log("Attempting to follow/unfollow user:", user.clerkId);
    // console.log("Current follow state:", isFollowing);

    toggleFollow(user._id, {
      onSuccess: () => {
        console.log("Follow/unfollow successful");
        setIsFollowing(prev => !prev);
        refetchProfile();
      },
      onError: (error) => {
        console.error("Follow/unfollow failed:", error);
      }
    });
  };

  // Early returns come AFTER all hooks
  if (loadingCurrentUser || isLoading || !user) {
    return (
      <View style={{ flex: 1 }}>
        <EnhancedRetroBackground intensity={0.4}>
          <SafeAreaView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: Math.max(insets.top, 20)
          }} edges={["top", "left", "right"]}>
            <ActivityIndicator size="large" color={currentTheme.colors.primary} />
            <Text style={{
              marginTop: 16,
              color: currentTheme.colors.text,
              fontSize: 16,
              fontFamily: 'monospace'
            }}>
              Loading profile...
            </Text>
          </SafeAreaView>
        </EnhancedRetroBackground>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <EnhancedRetroBackground
        intensity={0.6}
        showParticles={true}
        showObjects={true}
        showAtmosphere={true}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
          {/* Enhanced Header */}
          <RetroTransition type="slideUp" delay={0}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: currentTheme.colors.surface + '95',
              borderBottomWidth: 2,
              borderBottomColor: currentTheme.colors.primary + '30',
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    marginRight: 16,
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: currentTheme.colors.primary + '20'
                  }}
                >
                  <Feather name="arrow-left" size={24} color={currentTheme.colors.primary} />
                </TouchableOpacity>
                <View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: currentTheme.colors.text,
                    textShadowColor: currentTheme.colors.primary + '40',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 2,
                  }}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={{
                    color: currentTheme.colors.text + 'CC',
                    fontSize: 14,
                    fontFamily: 'monospace',
                  }}>
                    {posts?.length || 0} Posts
                  </Text>
                </View>
              </View>
            </View>
          </RetroTransition>

          {/* Enhanced Profile Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  refetchProfile();
                  refetchPosts();
                }}
                colors={[currentTheme.colors.primary]}
                tintColor={currentTheme.colors.primary}
              />
            }
          >
            {/* Enhanced Cover Image */}
            <RetroTransition type="fadeIn" delay={100}>
              <View style={{
                position: 'relative',
                borderBottomWidth: 3,
                borderBottomColor: currentTheme.colors.primary + '60'
              }}>
                <Image
                  source={{ uri: user.bannerImage || "https://w0.peakpx.com/wallpaper/314/171/HD-wallpaper-shooting-star-art.jpg" }}
                  style={{
                    width: '100%',
                    height: 192,
                  }}
                  resizeMode='cover'
                />
              </View>
            </RetroTransition>

            {/* Enhanced Profile Details */}
            <RetroTransition type="slideUp" delay={200}>
              <View style={{
                paddingHorizontal: 16,
                paddingBottom: 16,
                borderBottomWidth: 2,
                borderBottomColor: currentTheme.colors.primary + '20',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  marginTop: -64,
                  marginBottom: 16,
                }}>
                  {/* Enhanced Profile Picture */}
                  <View style={{
                    borderWidth: 4,
                    borderColor: currentTheme.colors.surface,
                    borderRadius: 64,
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}>
                    <Image
                      source={{ uri: user.profilePicture || 'https://via.placeholder.com/150' }}
                      style={{
                        width: 128,
                        height: 128,
                        borderRadius: 64,
                      }}
                    />
                  </View>

                  {/* Enhanced Follow Button */}
                  {currentUser?._id !== user._id && (
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 24,
                        paddingVertical: 10,
                        borderRadius: 25,
                        backgroundColor: isFollowing
                          ? currentTheme.colors.surface + 'DD'
                          : currentTheme.colors.primary,
                        borderWidth: 2,
                        borderColor: isFollowing
                          ? currentTheme.colors.primary + '60'
                          : currentTheme.colors.primary,
                        shadowColor: currentTheme.colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isFollowing ? 0.1 : 0.3,
                        shadowRadius: 6,
                        elevation: isFollowing ? 2 : 4,
                      }}
                      onPress={handleToggleFollow}
                      disabled={isPending}
                    >
                      <View>
                        <Text style={{
                          fontWeight: '600',
                          fontSize: 16,
                          color: isFollowing
                            ? currentTheme.colors.text
                            : currentTheme.colors.surface,
                          textShadowColor: isFollowing
                            ? 'transparent'
                            : currentTheme.colors.primary + '40',
                          textShadowOffset: { width: 0.5, height: 0.5 },
                          textShadowRadius: 1,
                        }}>
                          {isPending ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4
                  }}>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: currentTheme.colors.text,
                      marginRight: 8,
                      textShadowColor: currentTheme.colors.primary + '40',
                      textShadowOffset: { width: 0.5, height: 0.5 },
                      textShadowRadius: 2,
                    }}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Feather
                      name='check-circle'
                      size={20}
                      color={currentTheme.colors.accent}
                    />
                  </View>
                  <Text style={{
                    color: currentTheme.colors.text + 'CC',
                    marginBottom: 8,
                    fontSize: 16,
                    fontFamily: 'monospace',
                  }}>
                    @{user.username}
                  </Text>

                  {/* Enhanced Bio Section */}
                  {user.bio && (
                    <View style={{
                      backgroundColor: currentTheme.colors.surface + 'AA',
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.primary + '30',
                      marginBottom: 16,
                    }}>
                      <Text style={{
                        color: currentTheme.colors.text,
                        fontSize: 15,
                        lineHeight: 22,
                      }}>
                        {user.bio || "No bio available."}
                      </Text>
                    </View>
                  )}

                  {/* Enhanced Location and Join Date */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    flexWrap: 'wrap'
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 24,
                      marginBottom: 8
                    }}>
                      <Feather
                        name='map-pin'
                        size={16}
                        color={currentTheme.colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{
                        color: currentTheme.colors.text + 'CC',
                        fontSize: 14,
                      }}>
                        {user.location || "Unknown location"}
                      </Text>
                    </View>

                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <Feather
                        name='calendar'
                        size={16}
                        color={currentTheme.colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{
                        color: currentTheme.colors.text + 'CC',
                        fontSize: 14,
                      }}>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* Enhanced Stats Section */}
                  <View style={{
                    flexDirection: 'row',
                    paddingVertical: 12,
                    backgroundColor: currentTheme.colors.surface + '80',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: currentTheme.colors.primary + '30',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                    <TouchableOpacity style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8
                    }}>
                      <Text style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: currentTheme.colors.text,
                      }}>
                        {user.following?.length || 0}
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + 'CC',
                        fontSize: 14,
                      }}>
                        Following
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8
                    }}>
                      <Text style={{
                        fontWeight: 'bold',
                        fontSize: 16,
                        color: currentTheme.colors.text,
                      }}>
                        {user.followers?.length || 0}
                      </Text>
                      <Text style={{
                        color: currentTheme.colors.text + 'CC',
                        fontSize: 14,
                      }}>
                        Followers
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </RetroTransition>

            {/* Enhanced Posts Section */}
            <RetroTransition type="slideUp" delay={300}>
              <PostsList username={user?.username} />
            </RetroTransition>
          </ScrollView>
        </SafeAreaView>
      </EnhancedRetroBackground>
    </View>
  );
};

export default UserProfile;
