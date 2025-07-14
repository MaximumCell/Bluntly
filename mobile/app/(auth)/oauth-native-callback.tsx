import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function OAuthNativeCallback() {
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const params = useLocalSearchParams();

    React.useEffect(() => {
        console.log("OAuth callback params:", params);

        const processCallback = () => {
            try {
                if (isSignedIn) {
                    // User is signed in, redirect to home
                    console.log("User is signed in, redirecting to home");
                    router.replace("/(tabs)");
                } else {
                    // Small delay to allow Clerk to process the callback
                    setTimeout(() => {
                        if (isSignedIn) {
                            router.replace("/(tabs)");
                        } else {
                            console.log("User is not signed in, redirecting to auth");
                            router.replace("/(auth)");
                        }
                    }, 2000);
                }
            } catch (err) {
                console.error("OAuth Callback Error:", JSON.stringify(err, null, 2));
                router.replace("/(auth)");
            }
        };

        processCallback();
    }, [isSignedIn, router, params]);

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
        backgroundColor: "#fff",
    },
});
