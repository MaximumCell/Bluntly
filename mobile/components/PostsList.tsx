import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import PostCard from './PostCard';
import CommentsModal from './CommentsModal';

const PostsList = ({ username }: { username?: string }) => {
    const { currentUser } = useCurrentUser();
    const { posts, isLoading, error, refetch, toggleLike, deletePost, checkIsLiked, likingPostId, deletingPostId } = usePosts(username);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const selectedPost = selectedPostId ? posts.find((post:Post) => post._id === selectedPostId) : null;
    if (isLoading) {
        return (
          <View className='p-8 items-center'>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className='text-gray-500 mt-2'>Loading posts...</Text>
        </View>
        );
    }

    if (error) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500 mb-4">Failed to load posts</Text>
        <TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-lg" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="p-8 items-center">
        <Text className="text-gray-500">No posts yet</Text>
      </View>
    );
  }

  return (
    <>
      {posts.map((post: Post) => (
        <PostCard key={post._id} post={post} onLike={toggleLike} onDelete={deletePost} currentUser={currentUser} isLiked={checkIsLiked(post.likes, currentUser)} onComment={(post: Post) => setSelectedPostId(post._id)} likingPostId={likingPostId} deletingPostId={deletingPostId} />
      ))}

      <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
    </>
  )

}

export default PostsList