import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postsApi } from "@/utils/api";
import { useState } from "react";

export const usePosts = () => {
    const api = useApiClient();

    const queryClient = useQueryClient();

    const [likingPostId, setLikingPostId] = useState<string | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

    const { data: postData, isLoading, error, refetch } = useQuery({
        queryKey: ["posts"],
        queryFn: () => postsApi.getPosts(api),
        select: (response) => response.data.posts,
    });

    const likePostMutation = useMutation({
        mutationFn: (postId: string) => {
            setLikingPostId(postId);
            return postsApi.likePost(api, postId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
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
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
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
