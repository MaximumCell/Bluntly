import { ActivityIndicator, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { EnhancedRetroBackground } from '@/components/animations';
import { RetroTransition } from './animations';
import { Ionicons } from '@expo/vector-icons';

interface EditProfileModalProps {
  isVisible: boolean;
  formData: any;
  onClose: () => void;
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModal = ({
  isVisible,
  formData,
  onClose,
  saveProfile,
  updateFormField,
  isUpdating,
}: EditProfileModalProps) => {
  const { currentTheme } = useEnhancedTheme();

  const handleSave = () => {
    saveProfile();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle='formSheet'
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: currentTheme.colors.background[0] }}>
        <EnhancedRetroBackground intensity={1.2}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.colors.primary + '30',
            backgroundColor: currentTheme.colors.surface + 'CC',
            backdropFilter: 'blur(10px)',
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: currentTheme.colors.surface + 'AA',
                borderWidth: 1,
                borderColor: currentTheme.colors.primary + '40',
              }}
            >
              <Ionicons name="close" size={20} color={currentTheme.colors.primary} />
            </TouchableOpacity>

            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: currentTheme.colors.text,
              fontFamily: 'monospace',
              textShadowColor: currentTheme.colors.primary + '40',
              textShadowOffset: { width: 0.5, height: 0.5 },
              textShadowRadius: 1,
            }}>
              Edit Profile
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isUpdating}
              style={{
                backgroundColor: isUpdating ? currentTheme.colors.primary + '60' : currentTheme.colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                shadowColor: currentTheme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                  fontFamily: 'monospace',
                }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <RetroTransition type="slideUp" delay={100}>
              <View style={{ gap: 20 }}>
                {/* First Name Field */}
                <View>
                  <Text style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    First Name
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: currentTheme.colors.surface + 'DD',
                      borderWidth: 2,
                      borderColor: currentTheme.colors.primary + '40',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      fontFamily: 'monospace',
                      shadowColor: currentTheme.colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    value={formData.firstName}
                    onChangeText={(text) => updateFormField("firstName", text)}
                    placeholder="Your first name"
                    placeholderTextColor={currentTheme.colors.text + '60'}
                  />
                </View>

                {/* Last Name Field */}
                <View>
                  <Text style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Last Name
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: currentTheme.colors.surface + 'DD',
                      borderWidth: 2,
                      borderColor: currentTheme.colors.primary + '40',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      fontFamily: 'monospace',
                      shadowColor: currentTheme.colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    value={formData.lastName}
                    onChangeText={(text) => updateFormField("lastName", text)}
                    placeholder="Your last name"
                    placeholderTextColor={currentTheme.colors.text + '60'}
                  />
                </View>

                {/* Bio Field */}
                <View>
                  <Text style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Bio
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: currentTheme.colors.surface + 'DD',
                      borderWidth: 2,
                      borderColor: currentTheme.colors.primary + '40',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      fontFamily: 'monospace',
                      minHeight: 100,
                      textAlignVertical: 'top',
                      shadowColor: currentTheme.colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    value={formData.bio}
                    onChangeText={(text) => updateFormField("bio", text)}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={currentTheme.colors.text + '60'}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Location Field */}
                <View>
                  <Text style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    Location
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: currentTheme.colors.surface + 'DD',
                      borderWidth: 2,
                      borderColor: currentTheme.colors.primary + '40',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: currentTheme.colors.text,
                      fontFamily: 'monospace',
                      shadowColor: currentTheme.colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                    value={formData.location}
                    onChangeText={(text) => updateFormField("location", text)}
                    placeholder="Where are you located?"
                    placeholderTextColor={currentTheme.colors.text + '60'}
                  />
                </View>
              </View>
            </RetroTransition>
          </ScrollView>
        </EnhancedRetroBackground>
      </SafeAreaView>
    </Modal>
  );
};

export default EditProfileModal