import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { useCreatePost } from '@/hooks/useCreatePost';
import { useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';

const PostComposer = () => {
    const { content, setContent, selectedImage, setSelectedImage, createPost, isCreatingPost, pickImageFromGallery, takePhoto, removeImage } = useCreatePost();

    const { user } = useUser();
    return (
        <View className='p-4 bg-white rounded-lg shadow-sm border-gray-100'>
            <View className='flex-row' >
                <Image
                    source={{ uri: user?.imageUrl }}
                    className='w-10 h-10 rounded-full mr-2'
                />
                <View className='flex-1'>
                    <TextInput className='text-gray-900 text-lg' placeholder="What's on your mind?" placeholderTextColor="#657786" multiline value={content} onChangeText={setContent} maxLength={280} />
                </View>
            </View>

            {selectedImage && (
                <View className='mt-3 ml-15'>
                    <View className='relative'>
                        <Image
                            source={{ uri: selectedImage }}
                            className='w-full h-40 rounded-2xl' resizeMode='cover'
                        />
                        <TouchableOpacity onPress={removeImage} className='absolute top-2 right-2 bg-black rounded-full bg-opacity-60 items-center justify-center w-8 h-8'>
                            <Feather name='x' size={16} color='white' />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row">
          <TouchableOpacity className="mr-4" onPress={pickImageFromGallery}>
            <Feather name="image" size={20} color="#1DA1F2" />
          </TouchableOpacity>
          <TouchableOpacity className="mr-4" onPress={takePhoto}>
            <Feather name="camera" size={20} color="#1DA1F2" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          {content.length > 0 && (
            <Text
              className={`text-sm mr-3 ${content.length > 260 ? "text-red-500" : "text-gray-500"}`}
            >
              {280 - content.length}
            </Text>
          )}

          <TouchableOpacity
            className={`px-6 py-2 rounded-full ${
              content.trim() || selectedImage ? "bg-blue-500" : "bg-gray-300"
            }`}
            onPress={createPost}
            disabled={isCreatingPost || !(content.trim() || selectedImage)}
          >
            {isCreatingPost ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                className={`font-semibold ${
                  content.trim() || selectedImage ? "text-white" : "text-gray-500"
                }`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>

    )
}

export default PostComposer