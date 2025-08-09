import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useCreatePost } from '@/hooks/useCreatePost';
import { useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import RetroTransition from '@/components/animations/RetroTransition';

const PostComposer = () => {
  const { currentTheme } = useEnhancedTheme();
  const { content, setContent, selectedImage, setSelectedImage, createPost, isCreatingPost, pickImageFromGallery, takePhoto, removeImage } = useCreatePost();

  const { user } = useUser();
  return (
    <RetroTransition>
      <View style={{
        padding: 16,
        backgroundColor: currentTheme.colors.surface + 'F0',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: currentTheme.colors.primary + '30',
        shadowColor: currentTheme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={{ uri: user?.imageUrl }}
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
            <TextInput
              style={{
                color: currentTheme.colors.text,
                fontSize: 18,
                fontFamily: 'monospace',
                minHeight: 50,
                textAlignVertical: 'top',
              }}
              placeholder="What's on your mind?"
              placeholderTextColor={currentTheme.colors.text + '80'}
              multiline
              value={content}
              onChangeText={setContent}
              maxLength={280}
            />
          </View>
        </View>

        {selectedImage && (
          <View style={{ marginTop: 12, marginLeft: 52 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: selectedImage }}
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.primary + '30',
                }}
                resizeMode='cover'
              />
              <TouchableOpacity
                onPress={removeImage}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                }}
              >
                <Feather name='x' size={16} color='white' />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          borderTopWidth: 1,
          borderTopColor: currentTheme.colors.primary + '20',
          paddingTop: 12,
        }}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 8,
                backgroundColor: currentTheme.colors.primary + '10',
              }}
              onPress={pickImageFromGallery}
            >
              <Feather name="image" size={20} color={currentTheme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 8,
                backgroundColor: currentTheme.colors.primary + '10',
              }}
              onPress={takePhoto}
            >
              <Feather name="camera" size={20} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {content.length > 0 && (
              <Text
                style={{
                  fontSize: 14,
                  marginRight: 12,
                  color: content.length > 260 ? currentTheme.colors.accent : currentTheme.colors.text + 'CC',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                }}
              >
                {280 - content.length}
              </Text>
            )}

            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 25,
                backgroundColor: (content.trim() || selectedImage)
                  ? currentTheme.colors.primary
                  : currentTheme.colors.text + '30',
                shadowColor: (content.trim() || selectedImage)
                  ? currentTheme.colors.primary
                  : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: (content.trim() || selectedImage) ? 5 : 0,
              }}
              onPress={createPost}
              disabled={isCreatingPost || !(content.trim() || selectedImage)}
            >
              {isCreatingPost ? (
                <ActivityIndicator size="small" color={currentTheme.colors.surface} />
              ) : (
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: (content.trim() || selectedImage)
                      ? currentTheme.colors.surface
                      : currentTheme.colors.text + '80',
                  }}
                >
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RetroTransition>
  )
}

export default PostComposer