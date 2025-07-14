import EditProfileModal from '@/components/EditProfileModal';
import PostsList from '@/components/PostsList';
import SignOutButton from '@/components/SignOutButton';
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { Feather } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ProfileScreen = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

   const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  const insets = useSafeAreaInsets();
  if (isLoading) {
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
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{userPosts.length} Posts</Text>
        </View>
        <SignOutButton />
      </View>
      {/* Profile Info */}
      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false} refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => {
            refetchProfile();
            refetchPosts();
          }} colors={['#1DA1F2']} tintColor={'#1DA1F2'} />
        }>
        <View className='relative'>
          <Image
            source={{ uri: currentUser.bannerImage || "https://w0.peakpx.com/wallpaper/314/171/HD-wallpaper-shooting-star-art.jpg" }}
            className='w-full h-48' resizeMode='cover'
          />
        </View>
        <View className='px-4 pb-4 border-b border-gray-100'>
          <View className='flex-row items-end justify-between -mt-16 mb-4'>
            <Image
              source={{ uri: currentUser.profilePicture || 'https://via.placeholder.com/150' }}
              onError={() => console.log('Failed to load profile picture')}
              className="size-32 rounded-full border-4 border-white"
            />
            <TouchableOpacity className='border border-gray-300 rounded-full px-6 py-2' onPress={openEditModal}>
              <Text className='font-semibold text-gray-900'>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View className='mb-4'>
            <View className='flex-row items-center mb-1'>
              <Text className='text-xl font-bold text-gray-900 mr-1'>{currentUser.firstName} {currentUser.lastName}</Text>
              <Feather name='check-circle' size={20} color='#1DA1F2' />
            </View>
            <Text className='text-gray-500 mb-2'>@{currentUser.username}</Text>
            <Text className='text-gray-900 mb-3'>{currentUser.bio || "No bio available."}</Text>
            <View className='flex-row items-center mb-3'>
              <Feather name='map-pin' size={16} color='#1DA1F2' />
              <Text className='text-gray-500 ml-2'>{currentUser.location || "Unknown location"}</Text>
            </View>
            <View className='flex-row items-center mb-3'>
              <Feather name='calendar' size={16} color='#1DA1F2' />
              <Text className='text-gray-500 ml-2'>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{currentUser.following?.length}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold"> {" "}{currentUser.followers?.length}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* User Posts */}
        <PostsList username={currentUser?.username} />
      </ScrollView>
      {/* Edit Profile Modal */}
      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  )
}

export default ProfileScreen