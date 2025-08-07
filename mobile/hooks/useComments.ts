import { commentsApi, useApiClient } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";


export const useComments = () => {
    const [comments, setComments] = useState("");
    const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
    const [dislikingCommentId, setDislikingCommentId] = useState<string | null>(null);
    const api = useApiClient();

    const queryClient = useQueryClient();

    const createCommentMutation = useMutation({
        mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
            const response = await commentsApi.createComment(api, postId, content);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate all posts-related queries
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
            // Force refetch to ensure immediate updates
            queryClient.refetchQueries({ queryKey: ["posts"] });
            queryClient.refetchQueries({ queryKey: ["post"] });
        },
        onError: (error) => {
            Alert.alert("Failed to add comment. Please try again.");
        },
    });

    const createComment = (postId: string) => {
        if (!comments.trim()) {
            Alert.alert("Comment cannot be empty");
            return;
        }
        createCommentMutation.mutate({ postId, content: comments.trim() });
        setComments("");
    }

    const deleteComment = (commentId: string) => {
        Alert.alert(
            "Delete Comment",
            "Are you sure you want to delete this comment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await commentsApi.deleteComment(api, commentId);
                            queryClient.invalidateQueries({ queryKey: ["posts"] });
                        } catch (error) {
                            Alert.alert("Failed to delete comment. Please try again.");
                        }
                    },
                },
            ]
        );
    }

    const likeCommentMutation = useMutation({
        mutationFn: (commentId: string) => {
            setLikingCommentId(commentId);
            return commentsApi.likeComment(api, commentId);
        },
        onSuccess: () => {
            // More gentle cache update - just invalidate without immediate refetch
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
            setLikingCommentId(null);
        },
        onError: (error) => {
            console.error("Like comment error:", error);
            setLikingCommentId(null);
        },
    });

    const dislikeCommentMutation = useMutation({
        mutationFn: (commentId: string) => {
            setDislikingCommentId(commentId);
            return commentsApi.dislikeComment(api, commentId);
        },
        onSuccess: () => {
            // More gentle cache update - just invalidate without immediate refetch
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
            setDislikingCommentId(null);
        },
        onError: (error) => {
            console.error("Dislike comment error:", error);
            setDislikingCommentId(null);
        },
    }); const checkIsCommentLiked = (commentLikes: string[], currentUser: any) => {
        return currentUser && commentLikes.includes(currentUser._id);
    }

    const checkIsCommentDisliked = (commentDislikes: string[], currentUser: any) => {
        return currentUser && commentDislikes.includes(currentUser._id);
    }

    return {
        comments,
        createComment,
        setComments,
        isCreatingComment: createCommentMutation.isPending,
        deleteComment,
        toggleCommentLike: (commentId: string) => likeCommentMutation.mutate(commentId),
        toggleCommentDislike: (commentId: string) => dislikeCommentMutation.mutate(commentId),
        checkIsCommentLiked,
        checkIsCommentDisliked,
        isLikingComment: likeCommentMutation.isPending,
        isDislikingComment: dislikeCommentMutation.isPending,
        likingCommentId,
        dislikingCommentId,
    }
};