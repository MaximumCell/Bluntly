import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useEnhancedTheme } from "@/contexts/EnhancedThemeContext";
import { EnhancedRetroBackground } from "@/components/animations";
import { ActivityIndicator, Text, TouchableOpacity, View, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const { isLoading, handleSocialAuth } = useSocialAuth();
  const { currentTheme } = useEnhancedTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Array.isArray(currentTheme.colors.background) ? currentTheme.colors.background[0] : currentTheme.colors.background }}>
      <EnhancedRetroBackground intensity={1.8}>
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingVertical: 60 }}>

          {/* Header Section */}
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* App Logo/Icon */}
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(138, 43, 226, 0.3)',
              borderWidth: 3,
              borderColor: currentTheme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}>
              <Ionicons
                name="flash"
                size={48}
                color={currentTheme.colors.primary}
              />
            </View>

            {/* App Title */}
            <Text style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'monospace',
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
              marginBottom: 12,
            }}>
              Bluntly
            </Text>

            {/* Subtitle */}
            <Text style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              fontFamily: 'monospace',
              letterSpacing: 1,
              lineHeight: 26,
              marginBottom: 24,
            }}>
              Share thoughts, spark conversations
            </Text>

            {/* Decorative Elements */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}>
              {[0, 1, 2].map((index) => (
                <View
                  key={index}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  }}
                />
              ))}
            </View>
          </View>

          {/* Auth Buttons Section */}
          <View style={{ gap: 20 }}>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isLoading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 2,
                borderColor: '#4285F4',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 24,
                shadowColor: '#4285F4',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}>
                  {/* Custom Google Icon */}
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#4285F4',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                    }}>
                      G
                    </Text>
                  </View>
                  <Text style={{
                    color: '#333333',
                    fontSize: 18,
                    fontWeight: '600',
                    fontFamily: 'monospace',
                  }}>
                    Continue with Google
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* GitHub Sign In */}
            <TouchableOpacity
              onPress={() => handleSocialAuth("oauth_github")}
              disabled={isLoading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 2,
                borderColor: '#333333',
                borderRadius: 16,
                paddingVertical: 18,
                paddingHorizontal: 24,
                shadowColor: '#333333',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#333333" />
              ) : (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                }}>
                  {/* Custom GitHub Icon */}
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#333333',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Ionicons name="logo-github" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    color: '#333333',
                    fontSize: 18,
                    fontWeight: '600',
                    fontFamily: 'monospace',
                  }}>
                    Continue with GitHub
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Privacy Policy */}
            <Text style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 13,
              textAlign: 'center',
              lineHeight: 20,
              fontFamily: 'monospace',
              paddingHorizontal: 20,
              marginTop: 16,
            }}>
              By continuing, you agree to our{' '}
              <Text style={{ color: '#FFFFFF', textDecorationLine: 'underline' }}>
                Terms of Service
              </Text>
              {', '}
              <Text style={{ color: '#FFFFFF', textDecorationLine: 'underline' }}>
                Privacy Policy
              </Text>
              {', and '}
              <Text style={{ color: '#FFFFFF', textDecorationLine: 'underline' }}>
                Cookie Policy
              </Text>
              .
            </Text>
          </View>

        </View>
      </EnhancedRetroBackground>
    </SafeAreaView>
  );
}
