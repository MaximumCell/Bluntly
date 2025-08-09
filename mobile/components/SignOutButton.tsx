import { useSignOut } from "@/hooks/useSignOut";
import { useEnhancedTheme } from "@/contexts/EnhancedThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, ActivityIndicator, View, Text, Modal } from "react-native";
import { RetroTransition } from "./animations";
import { useState } from "react";

const SignOutButton = () => {
  const { handleSignOut, isSigningOut } = useSignOut();
  const { currentTheme } = useEnhancedTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleSignOut();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleLogoutPress}
        disabled={isSigningOut}
        style={{
          padding: 8,
          borderRadius: 20,
          backgroundColor: currentTheme.colors.surface + 'AA',
          borderWidth: 1,
          borderColor: '#E0245E40',
        }}
      >
        {isSigningOut ? (
          <ActivityIndicator size="small" color="#E0245E" />
        ) : (
          <Feather name="log-out" size={20} color={"#E0245E"} />
        )}
      </TouchableOpacity>

      {/* Enhanced Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <RetroTransition type="scaleIn" delay={0}>
            <View style={{
              backgroundColor: currentTheme.colors.surface,
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 320,
              borderWidth: 2,
              borderColor: currentTheme.colors.primary + '60',
              shadowColor: currentTheme.colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}>
              {/* Icon */}
              <View style={{
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#E0245E20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#E0245E40',
                }}>
                  <Ionicons name="log-out-outline" size={28} color="#E0245E" />
                </View>
              </View>

              {/* Title */}
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: currentTheme.colors.text,
                textAlign: 'center',
                marginBottom: 8,
                fontFamily: 'monospace',
                textShadowColor: currentTheme.colors.primary + '40',
                textShadowOffset: { width: 0.5, height: 0.5 },
                textShadowRadius: 1,
              }}>
                Sign Out
              </Text>

              {/* Message */}
              <Text style={{
                fontSize: 16,
                color: currentTheme.colors.text + 'DD',
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 24,
              }}>
                Are you sure you want to sign out of your account?
              </Text>

              {/* Buttons */}
              <View style={{
                flexDirection: 'row',
                gap: 12,
              }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: currentTheme.colors.surface,
                    borderWidth: 2,
                    borderColor: currentTheme.colors.primary + '60',
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                  }}
                  onPress={cancelLogout}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: currentTheme.colors.primary,
                    fontWeight: '600',
                    fontSize: 16,
                    fontFamily: 'monospace',
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#E0245E',
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    shadowColor: '#E0245E',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontSize: 16,
                    fontFamily: 'monospace',
                    textShadowColor: '#E0245E80',
                    textShadowOffset: { width: 0.5, height: 0.5 },
                    textShadowRadius: 1,
                  }}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </RetroTransition>
        </View>
      </Modal>
    </>
  );
};

export default SignOutButton;