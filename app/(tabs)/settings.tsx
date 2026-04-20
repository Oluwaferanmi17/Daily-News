import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeContext } from "@/lib/theme-provider";
import { useAppContext } from "@/lib/app-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import {
  initializeNotifications,
  scheduleDailyNotification,
  sendTestNotification,
} from "@/lib/notification-service";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { colorScheme: currentScheme, setColorScheme } = useThemeContext();
  const { preferences, updatePreferences } = useAppContext();
  const [notificationTime, setNotificationTime] = useState(
    preferences.notificationTime,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    preferences.notificationsEnabled,
  );
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  const handleToggleDarkMode = () => {
    const newScheme = currentScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleToggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updatePreferences({ notificationsEnabled: newValue });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Schedule or cancel notification
    if (newValue) {
      const [hour, minute] = notificationTime.split(":").map(Number);
      await scheduleDailyNotification(hour, minute);
    }
  };

  const handleChangeNotificationTime = (newTime: string) => {
    setNotificationTime(newTime);
    updatePreferences({ notificationTime: newTime });

    // Reschedule notification if enabled
    if (notificationsEnabled) {
      const [hour, minute] = newTime.split(":").map(Number);
      scheduleDailyNotification(hour, minute);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await sendTestNotification();
    } catch (error) {
      console.error("Failed to send test notification:", error);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleManageCategories = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/personalization");
  };

  const handleWidgetSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/widget-settings");
  };

  const SettingRow = ({
    label,
    value,
    onPress,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed && onPress ? 0.7 : 1,
        },
      ]}
    >
      <View className="flex-row justify-between items-center py-4 border-b border-divider">
        <Text className="text-base text-foreground">{label}</Text>
        {value && <Text className="text-sm text-muted">{value}</Text>}
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-6">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
          </View>

          {/* Notifications Section */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">
              Notifications
            </Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-divider">
                <Text className="text-base text-foreground">
                  Daily Brief Notifications
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor={colors.foreground}
                />
              </View>

              {notificationsEnabled && (
                <View>
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1">
                      <Text className="text-sm text-muted mb-1">
                        Delivery time
                      </Text>
                      <Text className="text-lg font-bold text-foreground">
                        {notificationTime}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => {
                          const [h, m] = notificationTime
                            .split(":")
                            .map(Number);
                          const newH = (h - 1 + 24) % 24;
                          handleChangeNotificationTime(
                            `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                          );
                        }}
                        style={({ pressed }) => [
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <IconSymbol
                          name="minus.circle.fill"
                          size={28}
                          color={colors.primary}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          const [h, m] = notificationTime
                            .split(":")
                            .map(Number);
                          const newH = (h + 1) % 24;
                          handleChangeNotificationTime(
                            `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
                          );
                        }}
                        style={({ pressed }) => [
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <IconSymbol
                          name="plus.circle.fill"
                          size={28}
                          color={colors.primary}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleSendTestNotification}
                    disabled={isSendingTest}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      className="border border-primary rounded-lg p-3 mt-4 items-center"
                      style={{ borderColor: colors.primary }}
                    >
                      <Text className="text-sm font-semibold text-primary">
                        {isSendingTest
                          ? "Sending test notification..."
                          : "Send Test Notification"}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Display Section */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">
              Display
            </Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">Dark Mode</Text>
                <Switch
                  value={currentScheme === "dark"}
                  onValueChange={handleToggleDarkMode}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor={colors.foreground}
                />
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">
              Preferences
            </Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <SettingRow
                label="Categories"
                value={`${preferences.categories.length} selected`}
                onPress={handleManageCategories}
              />
              <SettingRow
                label="Lock Screen Widget"
                onPress={handleWidgetSettings}
              />
              <SettingRow label="Story language" value="English" />
              <SettingRow label="Story sources" value="Auto" />
            </View>
          </View>

          {/* About Section */}
          <View className="mb-8">
            <Text className="text-sm font-semibold text-muted uppercase mb-4">
              About
            </Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <SettingRow label="App version" value="1.0.0" />
              <SettingRow label="Privacy Policy" />
              <SettingRow label="Terms of Service" />
              <SettingRow label="Help & Support" />
            </View>
          </View>

          {/* Footer */}
          <View className="p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center">
              Daily Brief — A calm, minimal daily intelligence app
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
