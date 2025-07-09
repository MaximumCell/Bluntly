import { useApiClient, userApi } from "@/utils/api"
import { useAuth } from "@clerk/clerk-expo"
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";


export const useUserSync = () => {
    const { isSignedIn } = useAuth();
    const api = useApiClient();

    const syncUserMutation = useMutation({
        mutationFn: () => userApi.syncUser(api),
        onSuccess: (res: any) => console.log("User synced successfully", res.data.user),
        onError: (error: any) => console.error("Error syncing user", error),
    });

    useEffect(() => {
        if (isSignedIn && !syncUserMutation.data) {
            syncUserMutation.mutate();
        }
    }, [isSignedIn]);

    return null;
}

