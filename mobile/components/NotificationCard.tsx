import { Notification } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import { View, Text, Alert, Image, TouchableOpacity } from "react-native";
import { useEnhancedTheme } from "@/contexts/EnhancedThemeContext";
import { router } from "expo-router";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({ notification, onDelete }: NotificationCardProps) => {
  const { currentTheme } = useEnhancedTheme();

  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Feather name="heart" size={20} color={currentTheme.colors.accent} />;
      case "comment":
        return <Feather name="message-circle" size={20} color={currentTheme.colors.primary} />;
      case "follow":
        return <Feather name="user-plus" size={20} color={currentTheme.colors.secondary} />;
      default:
        return <Feather name="bell" size={20} color={currentTheme.colors.text} />;
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Notification", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(notification._id),
      },
    ]);
  };

  const handleDeletePress = (event: any) => {
    event.stopPropagation();
    handleDelete();
  };

  const handleNotificationPress = () => {
    // Navigate to post if notification is related to a post
    if (notification.post && notification.post._id) {
      router.push({
        pathname: '/post/[id]',
        params: { id: notification.post._id }
      });
    } else if (notification.type === "follow") {
      // Navigate to user profile for follow notifications
      router.push({
        pathname: '/userProfile',
        params: { username: notification.from.username }
      });
    }
  };

  const isClickable = () => {
    return (notification.post && notification.post._id) || notification.type === "follow";
  };

  return (
    <TouchableOpacity
      onPress={handleNotificationPress}
      activeOpacity={isClickable() ? 0.7 : 1}
      disabled={!isClickable()}
      style={{
        marginHorizontal: 12,
        marginVertical: 6,
        borderRadius: 12,
        backgroundColor: currentTheme.colors.surface + '20', // Very transparent
        borderWidth: 1,
        borderColor: currentTheme.colors.primary + '30',
        shadowColor: currentTheme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
      }}
    >
      {/* Retro border glow effect */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          backgroundColor: currentTheme.colors.primary,
          opacity: 0.6,
        }}
      />

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 12, position: 'relative' }}>
            <Image
              source={{ uri: notification.from.profilePicture }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: currentTheme.colors.primary + '50',
              }}
            />

            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 24,
                height: 24,
                backgroundColor: currentTheme.colors.surface + 'DD',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: currentTheme.colors.primary + '50',
              }}
            >
              {getNotificationIcon()}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: currentTheme.colors.text,
                    fontSize: 16,
                    lineHeight: 20,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>
                    {notification.from.firstName} {notification.from.lastName}
                  </Text>
                  <Text style={{ color: currentTheme.colors.text + 'AA', fontWeight: '400' }}>
                    {' '}@{notification.from.username}
                  </Text>
                </Text>
                <Text
                  style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  {getNotificationText()}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  marginLeft: 8,
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: currentTheme.colors.surface + '40',
                }}
                onPress={handleDeletePress}
              >
                <Feather name="trash" size={16} color={currentTheme.colors.accent} />
              </TouchableOpacity>

              {isClickable() && (
                <View style={{
                  marginLeft: 8,
                  padding: 8,
                  borderRadius: 6,
                  backgroundColor: currentTheme.colors.primary + '20',
                }}>
                  <Feather name="chevron-right" size={16} color={currentTheme.colors.primary} />
                </View>
              )}
            </View>

            {notification.post && (
              <View
                style={{
                  backgroundColor: currentTheme.colors.surface + '30',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.primary + '20',
                }}
              >
                <Text
                  style={{
                    color: currentTheme.colors.text + 'EE',
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                  numberOfLines={3}
                >
                  {notification.post.content}
                </Text>
                {notification.post.image && (
                  <Image
                    source={{ uri: notification.post.image }}
                    style={{
                      width: '100%',
                      height: 128,
                      borderRadius: 8,
                      marginTop: 8,
                      borderWidth: 1,
                      borderColor: currentTheme.colors.primary + '30',
                    }}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}

            {notification.comment && (
              <View
                style={{
                  backgroundColor: currentTheme.colors.primary + '20',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: currentTheme.colors.primary + '40',
                }}
              >
                <Text
                  style={{
                    color: currentTheme.colors.text + 'AA',
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  Comment:
                </Text>
                <Text
                  style={{
                    color: currentTheme.colors.text + 'DD',
                    fontSize: 14,
                  }}
                  numberOfLines={2}
                >
                  &ldquo;{notification.comment.content}&rdquo;
                </Text>
              </View>
            )}

            <Text
              style={{
                color: currentTheme.colors.text + '88',
                fontSize: 12,
              }}
            >
              {formatDate(notification.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default NotificationCard;