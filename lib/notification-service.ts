/**
 * Notification Service
 * Handles scheduling, sending, and managing push notifications for Daily Brief
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NewsStory } from "./types";

/**
 * Initialize notifications and request permissions
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.warn("Notification permission not granted");
      return false;
    }

    // Get device push token (for server-side push if needed)
    const token = await Notifications.getExpoPushTokenAsync();
    console.log("Expo Push Token:", token.data);

    // Store token for future use
    await AsyncStorage.setItem("expoPushToken", token.data);

    return true;
  } catch (error) {
    console.error("Failed to initialize notifications:", error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
  trigger?: any,
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
        badge: 1,
      },
      trigger: (trigger || {
        seconds: 5, // Default: 5 seconds from now
      }) as any,
    });

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

/**
 * Schedule daily notification at a specific time
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @param stories - Stories to include in notification
 */
export async function scheduleDailyNotification(
  hour: number,
  minute: number,
  stories?: NewsStory[],
): Promise<string | null> {
  try {
    // Create notification content from stories
    let title = "Daily Brief";
    let body = "Your daily intelligence summary is ready";

    if (stories && stories.length > 0) {
      // Use first story headline as preview
      title = stories[0].headline.substring(0, 50);
      body = stories[0].whyItMatters.substring(0, 100);
    }

    // Schedule for specific time daily
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: "daily_brief",
          storyCount: stories?.length.toString() || "0",
        },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as Notifications.DailyTriggerInput,
    });

    // Store notification schedule
    await AsyncStorage.setItem("dailyNotificationId", notificationId);
    await AsyncStorage.setItem(
      "notificationTime",
      JSON.stringify({ hour, minute }),
    );
    await AsyncStorage.setItem("notificationsEnabled", "true");

    return notificationId;
  } catch (error) {
    console.error("Failed to schedule daily notification:", error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem("dailyNotificationId");
  } catch (error) {
    console.error("Failed to cancel all notifications:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Brief Test",
        body: "This is a test notification. Your daily summary will arrive at your scheduled time.",
        data: { type: "test" },
        sound: "default",
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        repeats: false,
      },
    });
  } catch (error) {
    console.error("Failed to send test notification:", error);
  }
}

/**
 * Refresh daily notification with new stories
 * Call this after fetching today's card
 */
export async function refreshDailyNotification(
  stories?: NewsStory[],
): Promise<void> {
  try {
    // Cancel existing notification
    const existingId = await AsyncStorage.getItem("dailyNotificationId");
    if (existingId) {
      await cancelNotification(existingId);
    }

    // Get stored time
    const timeStr = await AsyncStorage.getItem("notificationTime");
    if (!timeStr) return;

    const { hour, minute } = JSON.parse(timeStr);

    // Schedule new notification with updated stories
    await scheduleDailyNotification(hour, minute, stories);
  } catch (error) {
    console.error("Failed to refresh daily notification:", error);
  }
}

/**
 * Get notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<string> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error("Failed to get permission status:", error);
    return "unknown";
  }
}

/**
 * Open notification settings
 */
export async function openNotificationSettings(): Promise<void> {
  try {
    // This would open system notification settings
    // Implementation varies by platform
    console.log("Opening notification settings");
  } catch (error) {
    console.error("Failed to open notification settings:", error);
  }
}
