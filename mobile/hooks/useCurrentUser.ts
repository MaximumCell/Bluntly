import { useQuery } from "@tanstack/react-query";
import { useApiClient, userApi } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";

export const useCurrentUser = () => {
  const api = useApiClient();
  const { isLoaded } = useAuth();

  const { data: currentUser, isLoading, error, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: () => userApi.getCurrentUser(api),
    select: (response) => response.data.user,
    enabled: isLoaded, // Only run query when auth is loaded
  });

  return { currentUser, isLoading, error, refetch };
};