import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import React from 'react'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  // Wait for auth to load before making decisions
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  if (isSignedIn) {
    return <Redirect href={"/(tabs)"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}