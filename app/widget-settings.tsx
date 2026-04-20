/* eslint-disable react/no-unescaped-entities */
import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { useState, useEffect } from "react";
import {
  isWidgetEnabled,
  setWidgetEnabled,
  getWidgetConfig,
  saveWidgetConfig,
  getWidgetStats,
  WidgetConfig,
  WidgetStats,
} from "@/lib/widget-service";

export default function WidgetSettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  const [widgetEnabled, setWidgetEnabledLocal] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>({
    showTopStoryOnly: false,
    showContext: true,
    refreshInterval: 60,
    theme: "auto",
    storyCount: 3,
    enableSwipeNavigation: true,
  });
  const [stats, setStats] = useState<WidgetStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await isWidgetEnabled();
      const widgetConfig = await getWidgetConfig();
      const widgetStats = await getWidgetStats();

      setWidgetEnabledLocal(enabled);
      setConfig(widgetConfig);
      setStats(widgetStats);
    } catch (error) {
      console.error("Failed to load widget settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWidget = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await setWidgetEnabled(value);
      setWidgetEnabledLocal(value);
    } catch (error) {
      console.error("Failed to toggle widget:", error);
    }
  };

  const handleToggleMultiStory = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newConfig = { ...config, showTopStoryOnly: !value };
    setConfig(newConfig);
    await saveWidgetConfig(newConfig);
  };

  const handleToggleContext = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newConfig = { ...config, showContext: value };
    setConfig(newConfig);
    await saveWidgetConfig(newConfig);
  };

  const handleRefreshIntervalChange = async (interval: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newConfig = { ...config, refreshInterval: interval };
    setConfig(newConfig);
    await saveWidgetConfig(newConfig);
  };

  const handleThemeChange = async (theme: "light" | "dark" | "auto") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newConfig = { ...config, theme };
    setConfig(newConfig);
    await saveWidgetConfig(newConfig);
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">Loading widget settings...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-6 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Pressable
              onPress={() => {
                router.back();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <IconSymbol
                name="chevron.left"
                size={24}
                color={colors.primary}
              />
            </Pressable>
            <Text className="text-2xl font-bold text-foreground flex-1 ml-4">
              Widget Settings
            </Text>
          </View>

          {/* Enable Widget */}
          <View className="bg-surface rounded-2xl p-6 border border-border mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground mb-1">
                  Lock Screen Widget
                </Text>
                <Text className="text-sm text-muted">
                  Show Daily Brief on your lock screen
                </Text>
              </View>
              <Switch
                value={widgetEnabled}
                onValueChange={handleToggleWidget}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={widgetEnabled ? colors.primary : colors.muted}
              />
            </View>
          </View>

          {/* Widget Options */}
          {widgetEnabled && (
            <>
              {/* Multi-Story Navigation */}
              <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Multi-Story Widget
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      Show up to 3 stories with swipe navigation
                    </Text>
                  </View>
                  <Switch
                    value={!config.showTopStoryOnly}
                    onValueChange={handleToggleMultiStory}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={
                      !config.showTopStoryOnly ? colors.primary : colors.muted
                    }
                  />
                </View>
              </View>

              {/* Show Context */}
              <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Show Context
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      Display "Why this matters" on widget
                    </Text>
                  </View>
                  <Switch
                    value={config.showContext}
                    onValueChange={handleToggleContext}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={
                      config.showContext ? colors.primary : colors.muted
                    }
                  />
                </View>
              </View>

              {/* Refresh Interval */}
              <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Refresh Interval
                </Text>
                <View className="gap-2">
                  {[30, 60, 120, 240].map((interval) => (
                    <Pressable
                      key={interval}
                      onPress={() => handleRefreshIntervalChange(interval)}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor:
                            config.refreshInterval === interval
                              ? colors.primary
                              : colors.border,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                        },
                      ]}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          config.refreshInterval === interval
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {interval} minutes
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Theme */}
              <View className="bg-surface rounded-2xl p-6 border border-border mb-4">
                <Text className="text-base font-semibold text-foreground mb-4">
                  Widget Theme
                </Text>
                <View className="gap-2">
                  {(["auto", "light", "dark"] as const).map((theme) => (
                    <Pressable
                      key={theme}
                      onPress={() => handleThemeChange(theme)}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                          backgroundColor:
                            config.theme === theme
                              ? colors.primary
                              : colors.border,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                        },
                      ]}
                    >
                      <Text
                        className={`text-sm font-medium capitalize ${
                          config.theme === theme
                            ? "text-white"
                            : "text-foreground"
                        }`}
                      >
                        {theme === "auto" ? "System" : theme}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Statistics */}
          {stats && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-base font-semibold text-foreground mb-4">
                Widget Statistics
              </Text>
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Status</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.isEnabled ? "Enabled" : "Disabled"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Updates</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {stats.updateCount}
                  </Text>
                </View>
                {stats.lastUpdated && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Last Updated</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {new Date(stats.lastUpdated).toLocaleTimeString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Info */}
          <View className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <Text className="text-xs text-primary text-center">
              Widget updates automatically when you get your daily brief. You
              can customize what appears on your lock screen above.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
