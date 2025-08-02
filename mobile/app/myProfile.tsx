import EditProfileModal from '@/components/EditProfileModal';
import PostsList from '@/components/PostsList';
import SignOutButton from '@/components/SignOutButton';
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { Feather } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const MyProfileScreen = () => {
    // ALL hooks must be called first, before any conditional logic
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

    // Early returns come AFTER all hooks
    if (isLoading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1DA1F2" />
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Text>No user data found</Text>
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
                            {currentUser.firstName} {currentUser.lastName}
                        </Text>
                        <Text className="text-gray-500 text-sm">{userPosts?.length || 0} Posts</Text>
                    </View>
                </View>
                <SignOutButton />
            </View>

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
                        source={{ uri: currentUser.bannerImage || "https://w0.peakpx.com/wallpaper/314/171/HD-wallpaper-shooting-star-art.jpg" }}
                        className='w-full h-48'
                        resizeMode='cover'
                    />
                </View>

                <View className='px-4 pb-4 border-b border-gray-100'>
                    <View className='flex-row items-end justify-between -mt-16 mb-4'>
                        <Image
                            source={{ uri: currentUser.profilePicture || 'https://via.placeholder.com/150' }}
                            className="size-32 rounded-full border-4 border-white"
                        />
                        <TouchableOpacity
                            className="rounded-full px-6 py-2 bg-white border border-gray-300"
                            onPress={openEditModal}
                        >
                            <Text className="font-semibold text-gray-900">Edit Profile</Text>
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
                                    <Text className="font-bold">{currentUser.following?.length || 0}</Text>
                                    <Text className="text-gray-500"> Following</Text>
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text className="text-gray-900">
                                    <Text className="font-bold">{currentUser.followers?.length || 0}</Text>
                                    <Text className="text-gray-500"> Followers</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <PostsList username={currentUser?.username} />
            </ScrollView>

            <EditProfileModal
                isVisible={isEditModalVisible}
                onClose={closeEditModal}
                formData={formData}
                updateFormField={updateFormField}
                saveProfile={saveProfile}
                isUpdating={isUpdating}
            />
        </SafeAreaView>
    );
};

export default MyProfileScreen;
