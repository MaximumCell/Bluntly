import { View, Text } from 'react-native'
import React from 'react'
import { useClerk } from '@clerk/clerk-expo'

const HomeScreen = () => {
  const { signOut} = useClerk();
  return (
    <View>
      <Text>HomeScreen</Text>
      <Text onPress={() => signOut()} className='text-blue-500'>Sign Out</Text>
      <Text className='items-center justify-center '>Welcome to the Home Screen!</Text>
    </View>
  )
}

export default HomeScreen