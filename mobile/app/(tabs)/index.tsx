import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignOutButton from '@/components/SignOutButton'
import { useUserSync } from '@/hooks/useUserSync'

const HomeScreen = () => {
  useUserSync()
  return (
    <SafeAreaView>
      <View>
        <Text>Home Screen</Text>
        <SignOutButton />
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen