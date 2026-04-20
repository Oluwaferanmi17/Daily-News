import {
  ScrollView,
  Text,
  View,
  Pressable,
  RefreshControl,
  Share,
} from "react-native";
import { useState, useEffect } from "react";
import { Link, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { useDailyCard } from "@/hooks/use-daily-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
// import {  } from "react-native";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { card, isLoading, isRefreshing, error, refreshCard, fetchCard } =
    useDailyCard();

  // Fetch card on mount
  useEffect(() => {
    if (!card || card.stories.length === 0) {
      fetchCard();
    }
  }, []);

  const handleShare = async (story: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const message = `📰 ${story.headline}
  
  ${story.summary || story.description || "No summary available."}
  
  💡 Why this matters: ${story.whyItMatters || "Impact to be determined"}
  
  📌 Category: ${story.category || "General"}
  🔗 Read more: ${story.url || "N/A"}
  
  —
  Shared from Daily Brief ${story.url || ""}`;

      await Share.share({
        message,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };
  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refreshCard();
  };

  const handleStoryPress = (storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/story-detail?storyId=${storyId}`);
  };

  const handlePersonalization = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/personalization");
  };

  const stories = card?.stories || [];

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-6 pb-8">
          {/* Header */}
          <View className="flex-row justify-between items-start mb-8">
            <View className="flex-1">
              <Text className="text-sm text-muted mb-1">
                {card?.date || "Today"}
              </Text>
              <Text className="text-4xl font-bold text-foreground">
                Daily Brief
              </Text>
              <Text className="text-sm text-muted mt-2">
                If you only read one thing today, read this.
              </Text>
            </View>
            <Pressable
              onPress={handlePersonalization}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <IconSymbol name="ellipsis" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {/* Error State */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-4 mb-6">
              <Text className="text-sm text-error">{error}</Text>
              <Pressable
                onPress={handleRefresh}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1, marginTop: 8 },
                ]}
              >
                <Text className="text-sm font-semibold text-error">
                  Try again
                </Text>
              </Pressable>
            </View>
          )}

          {/* Loading State */}
          {isLoading && stories.length === 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-center text-muted">
                Loading your Daily Brief...
              </Text>
            </View>
          )}

          {/* Stories Card */}
          {stories.length > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-6">
                Today&apos;s Stories
              </Text>

              {stories.map((story, index) => (
                <Pressable
                  key={story.id}
                  onPress={() => handleStoryPress(story.id)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View
                    className={`pb-4 ${
                      index < stories.length - 1
                        ? "border-b border-divider"
                        : ""
                    }`}
                  >
                    <View className="flex-row justify-between items-start gap-2">
                      <Text className="flex-1 text-base font-semibold text-foreground mb-1">
                        {story.headline}
                      </Text>

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleShare(story);
                        }}
                        style={({ pressed }) => [
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <IconSymbol
                          name="paperplane.fill"
                          size={20}
                          color={colors.primary}
                        />
                      </Pressable>
                    </View>

                    <Text className="text-sm text-muted leading-relaxed">
                      Why this matters: {story.whyItMatters}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && stories.length === 0 && !error && (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <Text className="text-base text-foreground font-semibold mb-2">
                No stories available
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                Check your internet connection and try again
              </Text>
              <Pressable
                onPress={handleRefresh}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Text className="text-sm font-semibold text-primary">
                  Refresh
                </Text>
              </Pressable>
            </View>
          )}

          {/* Info Section */}
          <View className="mt-8 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center">
              {stories.length} stories • Tap to read more • Pull down to refresh
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
