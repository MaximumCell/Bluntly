import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "@/utils/api";

export const useFollow = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();

    const { mutate: toggleFollow, isPending, error } = useMutation({
        mutationFn: (userId: string) => {
            console.log("Making follow API call for userId:", userId);
            return userApi.followUser(api, userId);
        },
        onSuccess: (data, userId) => {
            console.log("Follow API success:", data);
            // Invalidate or refetch affected queries (like user profile and followers)
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (error) => {
            console.error("Follow API error:", error);
        }
    });

    return { toggleFollow, isPending, error };
};

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";

export const useUserProfile = (username: string) => {
    const api = useApiClient();
    const { isLoaded } = useAuth();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: () => userApi.getUserByUsername(api, username),
        select: (res) => res.data.user,
        enabled: !!username && isLoaded, // Only run when auth is loaded and username exists
    });

    return {
        user: data,
        isLoading,
        error,
        refetch,
    };
};
