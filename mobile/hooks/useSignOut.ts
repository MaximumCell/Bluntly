import { useClerk } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

export const useSignOut = () => {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple simultaneous logout attempts

    setIsSigningOut(true);
    try {
      // Clear all cached queries first
      queryClient.clear();

      // Small delay to ensure queries are cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Sign out from Clerk
      await signOut();

      // Navigate to auth screen
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still try to navigate even if there's an error
      router.replace("/(auth)");
    } finally {
      setIsSigningOut(false);
    }
  };

  return { handleSignOut, isSigningOut };
};