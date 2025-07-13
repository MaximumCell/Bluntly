import { commentsApi, useApiClient } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert } from "react-native";


export const useComments = () => {
    const [comments, setComments] = useState("");
    const api = useApiClient();

    const queryClient = useQueryClient();

    const createCommentMutation = useMutation({
        mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
            const response = await commentsApi.createComment(api, postId, content);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
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

    return {
        comments,
        createComment,
        setComments,
        isCreatingComment: createCommentMutation.isPending,
        deleteComment,
    }
    };