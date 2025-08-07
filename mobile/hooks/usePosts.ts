import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postsApi } from "@/utils/api";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-expo";

export const usePosts = (username?: string) => {
    const api = useApiClient();
    const { isLoaded } = useAuth();

    const queryClient = useQueryClient();

    const [likingPostId, setLikingPostId] = useState<string | null>(null);
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            if (username) {
                queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
            }
            setLikingPostId(null);
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

    return {
        posts: postData || [], isLoading, error, refetch, toggleLike: (postId: string) => likePostMutation.mutate(postId), deletePost: (postId: string) => deletePostMutation.mutate(postId), checkIsLiked, isLikingPostPending: likePostMutation.isPending, isDeletingPostPending: deletePostMutation.isPending, likingPostId,
        deletingPostId,
    };
};
