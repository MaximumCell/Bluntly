import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
     <ClerkProvider tokenCache={tokenCache}>
       <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
       </Stack>
     </ClerkProvider>
  );
}
