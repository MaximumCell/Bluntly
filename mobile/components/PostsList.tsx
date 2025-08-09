import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { usePosts } from '@/hooks/usePosts';
import { Post } from '@/types';
import PostCard from './PostCard';
import CommentsModal from './CommentsModal';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import RetroTransition from '@/components/animations/RetroTransition';
import RetroLoader from '@/components/animations/RetroLoader';

const PostsList = ({ username }: { username?: string }) => {
  const { currentTheme } = useEnhancedTheme();
  // ALL hooks must be called first
  const { currentUser } = useCurrentUser();
  const { posts, isLoading, error, refetch, toggleLike, toggleDislike, deletePost, checkIsLiked, checkIsDisliked, likingPostId, dislikingPostId, deletingPostId } = usePosts(username);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = selectedPostId ? posts.find((post: Post) => post._id === selectedPostId) : null;

  // Early returns come AFTER all hooks
  if (isLoading) {
    return (
      <View style={{
        padding: 32,
        alignItems: 'center',
        backgroundColor: currentTheme.colors.surface
      }}>
        <RetroLoader />
        <Text style={{
          color: currentTheme.colors.text + 'CC',
          marginTop: 16,
          fontFamily: 'monospace',
          fontSize: 14
        }}>
          Loading posts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <RetroTransition>
        <View style={{
          padding: 32,
          alignItems: 'center',
          backgroundColor: currentTheme.colors.surface
        }}>
          <Text style={{
            color: currentTheme.colors.text + 'CC',
            marginBottom: 16,
            fontFamily: 'monospace',
            fontSize: 16,
            textAlign: 'center'
          }}>
            Failed to load posts
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: currentTheme.colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={() => refetch()}
          >
            <Text style={{
              color: currentTheme.colors.surface,
              fontWeight: 'bold',
              fontFamily: 'monospace'
            }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </RetroTransition>
    );
  }

  if (posts.length === 0) {
    return (
      <RetroTransition>
        <View style={{
          padding: 32,
          alignItems: 'center',
          backgroundColor: currentTheme.colors.surface
        }}>
          <Text style={{
            color: currentTheme.colors.text + 'CC',
            fontFamily: 'monospace',
            fontSize: 16,
            textAlign: 'center'
          }}>
            No posts yet
          </Text>
        </View>
      </RetroTransition>
    );
  }

  return (
    <RetroTransition>
      <>
        {posts.map((post: Post) => (
          <PostCard
            key={post._id}
            post={post}
            onLike={toggleLike}
            onDislike={toggleDislike}
            onDelete={deletePost}
            currentUser={currentUser}
            isLiked={checkIsLiked(post.likes, currentUser)}
            isDisliked={checkIsDisliked(post.dislikes, currentUser)}
            onComment={(post: Post) => setSelectedPostId(post._id)}
            likingPostId={likingPostId}
            dislikingPostId={dislikingPostId}
            deletingPostId={deletingPostId}
          />
        ))}

        <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
      </>
    </RetroTransition>
  )

}

export default PostsList