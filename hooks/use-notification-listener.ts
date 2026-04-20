import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

/**
 * Hook to handle notification interactions and deep linking
 */
export function useNotificationListener() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Listen for notifications received while app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listen for notification interactions (user taps notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log("Notification response:", response);

        const { notification } = response;
        const { data } = notification.request.content;

        // Handle deep linking based on notification data
        if (data.type === "daily_brief") {
          // Navigate to home screen
          router.push("/");
        } else if (data.storyId) {
          // Navigate to story detail
          router.push(`/story-detail?storyId=${data.storyId}`);
        }
      });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);
}
