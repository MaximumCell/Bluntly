import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFollow, useUserProfile } from '@/hooks/useFollow';
import { usePosts } from '@/hooks/usePosts';
import PostsList from '@/components/PostsList';

const UserProfile = ({ username }: { username: string }) => {
  // ALL hooks must be called first, before any conditional logic
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
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white' style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">{posts?.length || 0} Posts</Text>
          </View>
        </View>
      </View>

      {/* Profile Info */}
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            colors={['#1DA1F2']}
            tintColor={'#1DA1F2'}
          />
        }
      >
        <View className='relative'>
          <Image
            source={{ uri: user.bannerImage || "https://w0.peakpx.com/wallpaper/314/171/HD-wallpaper-shooting-star-art.jpg" }}
            className='w-full h-48'
            resizeMode='cover'
          />
        </View>

        <View className='px-4 pb-4 border-b border-gray-100'>
          <View className='flex-row items-end justify-between -mt-16 mb-4'>
            <Image
              source={{ uri: user.profilePicture || 'https://via.placeholder.com/150' }}
              className="size-32 rounded-full border-4 border-white"
            />
            <TouchableOpacity
              className={`rounded-full px-6 py-2 ${isFollowing ? 'bg-white border border-gray-300' : 'bg-blue-500'}`}
              onPress={handleToggleFollow}
              disabled={isPending}
            >
              <Text className={`font-semibold ${isFollowing ? 'text-gray-900' : 'text-white'}`}>
                {isPending ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className='mb-4'>
            <View className='flex-row items-center mb-1'>
              <Text className='text-xl font-bold text-gray-900 mr-1'>{user.firstName} {user.lastName}</Text>
              <Feather name='check-circle' size={20} color='#1DA1F2' />
            </View>
            <Text className='text-gray-500 mb-2'>@{user.username}</Text>
            <Text className='text-gray-900 mb-3'>{user.bio || "No bio available."}</Text>
            <View className='flex-row items-center mb-3'>
              <Feather name='map-pin' size={16} color='#1DA1F2' />
              <Text className='text-gray-500 ml-2'>{user.location || "Unknown location"}</Text>
            </View>
            <View className='flex-row items-center mb-3'>
              <Feather name='calendar' size={16} color='#1DA1F2' />
              <Text className='text-gray-500 ml-2'>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{user.following?.length || 0}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{user.followers?.length || 0}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* User Posts */}
        <PostsList username={user?.username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfile;
