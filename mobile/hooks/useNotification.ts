import { useApiClient } from "@/utils/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";

export const useNotification = () => {
    const api = useApiClient();
    const queryClient = useQueryClient();
    const { isLoaded } = useAuth();

    const { data: notifications, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => notificationsApi.getNotifications(api),
        select: (res) => res.data.notifications,
        enabled: isLoaded, // Only run query when auth is loaded
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: (notificationId: string) => notificationsApi.deleteNotification(api, notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const deleteNotification = (notificationId: string) => {
        deleteNotificationMutation.mutate(notificationId);
    }

    return {
        notifications,
        isLoading,
        error,
        refetch,
        isRefetching,
        deleteNotification,
        isDeletingNotification: deleteNotificationMutation.isPending,
    };
}