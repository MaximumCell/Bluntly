import { useOAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

export const useSocialAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
    const { startOAuthFlow: startGitHubOAuth } = useOAuth({ strategy: "oauth_github" });

    const handleSocialAuth = async (strategy: "oauth_google" | "oauth_github") => {
        setIsLoading(true);
        try {
            const startOAuthFlow = strategy === "oauth_google" ? startGoogleOAuth : startGitHubOAuth;
            const { createdSessionId, setActive } = await startOAuthFlow();

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId });
            } else {
                console.error("No session created");
            }
        } catch (error) {
            console.error("Social Auth Error:", error);
            const provider = strategy === "oauth_google" ? "Google" : "GitHub";
            Alert.alert("Error", `Failed to sign in with ${provider}. Please try again later.`);
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isLoading,
        handleSocialAuth,
    };
}