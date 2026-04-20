import { Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * Lockscreen Widget Component
 *
 * This is a placeholder component for future lockscreen widget implementation.
 * iOS 17+ and Android 12+ support home screen and lock screen widgets.
 *
 * Future implementation will:
 * 1. Use expo-widgets or react-native-widget-package
 * 2. Display today's top story headline
 * 3. Show "Why this matters" summary
 * 4. Update daily at notification time
 * 5. Support tap-to-open app functionality
 *
 * Design: Minimal card showing headline and context, matching app aesthetic
 */

export interface LockscreenWidgetProps {
  headline?: string;
  whyItMatters?: string;
  date?: string;
}

export function LockscreenWidget({
  headline = "Daily Brief",
  whyItMatters = "Tap to see today's top story",
  date = "Today",
}: LockscreenWidgetProps) {
  const colors = useColors();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 10,
            color: colors.muted,
            marginBottom: 4,
          }}
        >
          {date}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
            marginBottom: 6,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {headline}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 12,
          color: colors.muted,
          lineHeight: 16,
        }}
        numberOfLines={2}
      >
        {whyItMatters}
      </Text>
    </View>
  );
}

/**
 * Future: Lockscreen Widget Configuration
 *
 * For iOS (using WidgetKit):
 * - Create a separate target in Xcode
 * - Implement TimelineProvider for widget updates
 * - Use WidgetBundle to register widget
 * - Support small, medium, large sizes
 *
 * For Android (using AppWidgets):
 * - Create RemoteViews layout
 * - Implement AppWidgetProvider
 * - Set update frequency (daily at notification time)
 * - Support 4x2 and 4x4 widget sizes
 *
 * Data Flow:
 * 1. App generates daily card
 * 2. Widget receives update via shared storage/database
 * 3. Widget displays headline + context
 * 4. Tap opens app to full story
 */
