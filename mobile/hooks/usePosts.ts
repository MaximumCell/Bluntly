import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postsApi } from "@/utils/api";

export const usePosts = () => {
    const api = useApiClient();

    const queryClient = useQueryClient();

    const {data: postData, isLoading, error, refetch} = useQuery({
        queryKey: ["posts"],
        queryFn: () => postsApi.getPosts(api),
        select: (response) => response.data.posts,
    });

    const likePostMutation = useMutation({
        mutationFn: (postId: string) => postsApi.likePost(api, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    const deletePostMutation = useMutation({
        mutationFn: (postId: string) => postsApi.deletePost(api, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
        },
    });

    const checkIsLiked = (postLikes: string[], currentUser: any)  => {
        const isLike = currentUser && postLikes.includes(currentUser.id);
        return isLike;
    }

    return { posts: postData || [], isLoading, error, refetch, toggleLike: (postId: string) => likePostMutation.mutate(postId), deletePost: (postId: string) => deletePostMutation.mutate(postId), checkIsLiked };
};
