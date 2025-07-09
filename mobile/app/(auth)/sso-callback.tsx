import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function SSOCallback() {
  // Get the router object to navigate the user
  const router = useRouter();

  // useOAuth is the hook that handles the OAuth flow and the callback.
  const { handleSSOCallback } = useOAuth({
    // The redirectUrl should match the one you configured in your Clerk dashboard.
    // For Expo Go, it's typically in the format exp://<ip-address>:<port>/--/
    // The important part is that Expo Router will handle this.
  });

  // This effect will run when the component mounts.
  React.useEffect(() => {
    const processCallback = async () => {
      try {
        // handleSSOCallback processes the token from the URL and signs the user in.
        const { createdSessionId, setActive } = await handleSSOCallback();

        if (createdSessionId && setActive) {
          // If a new session was created, set it as active.
          // This is the final step of the sign-in process.
          await setActive({ session: createdSessionId });

          // --- REDIRECTION ---
          // Once the user is signed in, redirect them to the home screen.
          // We use replace to prevent the user from going back to the callback screen.
          router.replace("/(tabs)");

        } else {
          // This case is unlikely but good to handle.
          // It means the SSO flow didn't result in a new session.
          // You might want to redirect to the sign-in page.
          console.error("SSO callback did not result in a new session.");
          router.replace("/(auth)"); // Go back to sign-in
        }
      } catch (err) {
        // Handle any errors that occurred during the callback process.
        console.error("SSO Callback Error:", JSON.stringify(err, null, 2));
        // Redirect the user back to the sign-in page on failure.
        router.replace("/(auth)");
      }
    };

    // Run the callback processing function.
    processCallback();
  }, [handleSSOCallback, router]);


  // --- UI ---
  // Display a loading indicator while the callback is being processed.
  // This provides visual feedback to the user.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
