import { useSocialAuth } from "@/hooks/useSocialAuth";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { isLoading, handleSocialAuth } = useSocialAuth();
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">
          {/* Demo img */}
          <View className="items-center">
            <Image source={require("../../assets/images/auth1.png")} className="size-96 " resizeMode="contain"/>
          </View>
          <View className="flex-col gap-2">
              <TouchableOpacity className="flex-row items-center justify-center bg-white border-gray-300 rounded-full py-3 px-6" onPress={() => {handleSocialAuth("oauth_google")}} disabled={isLoading} style={{
                shadowColor: "#4285f4",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <View className="flex-row items-center justify-center">
                  <Image source={require("../../assets/images/google.png")} className="size-10 mr-3" resizeMode="contain"/>
                  <Text className="text-black font-medium text-base">Sign in with Google</Text>
                </View>
                )}
              </TouchableOpacity>


              <TouchableOpacity className="flex-row items-center justify-center bg-white border-gray-300 rounded-full py-3 px-6" onPress={() => {handleSocialAuth("oauth_github")}} disabled={isLoading} style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Image source={require("../../assets/images/github.png")} className="size-8 mr-3" resizeMode="contain"/>
                    <Text className="text-black font-medium text-base">Sign in with GitHub</Text>
                  </View>
                )}
              </TouchableOpacity>

            </View>
            {/* text and privacy policy */}
            <Text className="text-gray-500 text-center leading-4 mt-6 px-2">
              By signing up, you agree to our <Text className="text-blue-500">Terms</Text>{", "}
              <Text className="text-blue-500">Privacy Policy</Text>{", and "}
              <Text className="text-blue-500">Cookies Use</Text>.
            </Text>
          </View>
      </View>
    </View>
  );
}
