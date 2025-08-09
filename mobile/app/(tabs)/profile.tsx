import EditProfileModal from '@/components/EditProfileModal';
import PostsList from '@/components/PostsList';
import SignOutButton from '@/components/SignOutButton';
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EnhancedRetroBackground, RetroTransition, RetroLoader } from '@/components/animations';


const ProfileScreen = () => {
  // ALL hooks must be called first
  const { currentUser, isLoading } = useCurrentUser();
  const { currentTheme, currentPeriod } = useEnhancedTheme();
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
      <EnhancedRetroBackground intensity={0.8}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}>
          <RetroTransition type="scaleIn" delay={200}>
            <RetroLoader style="neon" size="large" />
            <Text style={{
              marginTop: 20,
              color: currentTheme.colors.text,
              fontSize: 16,
              fontFamily: 'monospace',
              textAlign: 'center'
            }}>
              Loading profile...
            </Text>
          </RetroTransition>
        </View>
      </EnhancedRetroBackground>
    );
  }
  return (
    <EnhancedRetroBackground
      intensity={1.5}
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
            backgroundColor: currentTheme.colors.surface + 'CC',
            borderBottomWidth: 2,
            borderBottomColor: currentTheme.colors.primary + '30',
            shadowColor: currentTheme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}>
            <View>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.colors.text,
                fontFamily: 'monospace',
                textShadowColor: currentTheme.colors.primary + '40',
                textShadowOffset: { width: 0.5, height: 0.5 },
                textShadowRadius: 1,
              }}>
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Text style={{
                color: currentTheme.colors.text + 'CC',
                fontSize: 14,
                fontFamily: 'monospace',
              }}>
                {userPosts?.length || 0} Posts
              </Text>
            </View>
            <SignOutButton />
          </View>
        </RetroTransition>

        {/* Enhanced Profile Content */}
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: 'transparent'
          }}
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
              progressBackgroundColor={currentTheme.colors.surface}
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
                source={{ uri: currentUser.bannerImage || "https://w0.peakpx.com/wallpaper/314/171/HD-wallpaper-shooting-star-art.jpg" }}
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
                    source={{ uri: currentUser.profilePicture || 'https://via.placeholder.com/150' }}
                    onError={() => console.log('Failed to load profile picture')}
                    style={{
                      width: 128,
                      height: 128,
                      borderRadius: 64,
                    }}
                  />
                </View>

                {/* Enhanced Edit Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    borderRadius: 25,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderWidth: 2,
                    borderColor: currentTheme.colors.primary + '80',
                    shadowColor: currentTheme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={openEditModal}
                >
                  <Text style={{
                    fontWeight: '600',
                    color: currentTheme.colors.surface,
                    fontFamily: 'monospace',
                    textShadowColor: currentTheme.colors.primary + '80',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1,
                  }}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Enhanced User Info */}
              <View style={{ marginBottom: 16 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: currentTheme.colors.text,
                    marginRight: 8,
                    textShadowColor: currentTheme.colors.primary + '30',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 2,
                  }}>
                    {currentUser.firstName} {currentUser.lastName}
                  </Text>
                  <Ionicons name='checkmark-circle' size={24} color={currentTheme.colors.accent} />
                </View>

                <Text style={{
                  color: currentTheme.colors.text + 'CC',
                  fontSize: 16,
                  marginBottom: 12,
                  fontFamily: 'monospace',
                }}>
                  @{currentUser.username}
                </Text>

                <Text style={{
                  color: currentTheme.colors.text,
                  fontSize: 16,
                  marginBottom: 16,
                  lineHeight: 24,
                }}>
                  {currentUser.bio || "No bio available."}
                </Text>

                {/* Enhanced Info Icons */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Feather
                      name='map-pin'
                      size={18}
                      color={currentTheme.colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: currentTheme.colors.text + 'CC',
                      fontSize: 14,
                    }}>
                      {currentUser.location || "Unknown location"}
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <Feather
                      name='calendar'
                      size={18}
                      color={currentTheme.colors.primary}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      color: currentTheme.colors.text + 'CC',
                      fontSize: 14,
                    }}>
                      Joined {new Date(currentUser.createdAt).toLocaleDateString()}
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
                      fontSize: 18,
                      color: currentTheme.colors.text,
                    }}>
                      {currentUser.following?.length || 0}
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
                      fontSize: 18,
                      color: currentTheme.colors.text,
                    }}>
                      {currentUser.followers?.length || 0}
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
            <PostsList username={currentUser?.username} />
          </RetroTransition>
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
    </EnhancedRetroBackground>
  )
}

export default ProfileScreen