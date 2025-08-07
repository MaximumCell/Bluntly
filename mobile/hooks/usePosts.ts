import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postsApi } from "@/utils/api";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";

export const usePosts = (username?: string) => {
    const api = useApiClient();
    const { isLoaded } = useAuth();

    const queryClient = useQueryClient();

    const [likingPostId, setLikingPostId] = useState<string | null>(null);
    const [dislikingPostId, setDislikingPostId] = useState<string | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const { data: postData, isLoading, error, refetch } = useQuery({
        queryKey: username ? ["userPosts", username] : ["posts"],
        queryFn: () => (username ? postsApi.getUserPosts(api, username) : postsApi.getPosts(api)),
        select: (response) => response.data.posts,
        enabled: isLoaded, // Only run query when auth is loaded
    });

    const likePostMutation = useMutation({
        mutationFn: (postId: string) => {
            setLikingPostId(postId);
            return postsApi.likePost(api, postId);
        },
        onSuccess: (_, postId) => {
            // Invalidate all posts-related queries
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            if (username) {
                queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
            }
            // Force refetch for all posts
            queryClient.refetchQueries({ queryKey: ["posts"] });
            setLikingPostId(null);
        },
        onError: (error) => {
            console.error("Like post error:", error);
            setLikingPostId(null);
        },
    });

    const dislikePostMutation = useMutation({
        mutationFn: (postId: string) => {
            setDislikingPostId(postId);
            return postsApi.dislikePost(api, postId);
        },
        onSuccess: (_, postId) => {
            // Invalidate all posts-related queries
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            if (username) {
                queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
            }
            // Force refetch for all posts
            queryClient.refetchQueries({ queryKey: ["posts"] });
            setDislikingPostId(null);
        },
        onError: (error) => {
            console.error("Dislike post error:", error);
            setDislikingPostId(null);
        },
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => {
            setDeletingPostId(postId);
            return postsApi.deletePost(api, postId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            if (username) {
                queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
            }
            setDeletingPostId(null);
        },
    });

    const checkIsLiked = (postLikes: string[], currentUser: any) => {
        const isLike = currentUser && postLikes.includes(currentUser._id);
        return isLike;
    }

    const checkIsDisliked = (postDislikes: string[], currentUser: any) => {
        const isDislike = currentUser && postDislikes.includes(currentUser._id);
        return isDislike;
    }

    return {
        posts: postData || [],
        isLoading,
        error,
        refetch,
        toggleLike: (postId: string) => likePostMutation.mutate(postId),
        toggleDislike: (postId: string) => dislikePostMutation.mutate(postId),
        deletePost: (postId: string) => deletePostMutation.mutate(postId),
        checkIsLiked,
        checkIsDisliked,
        isLikingPostPending: likePostMutation.isPending,
        isDislikingPostPending: dislikePostMutation.isPending,
        isDeletingPostPending: deletePostMutation.isPending,
        likingPostId,
        dislikingPostId,
        deletingPostId,
    };
};
