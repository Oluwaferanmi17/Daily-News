import { ScrollView, Text, View, Pressable, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
// import {  } from "react-native";

export default function StoryDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { storyId } = useLocalSearchParams();
  const { state } = useAppContext();

  // Find the story from today's card or archive
  let story = null;
  if (state.todayCard) {
    story = state.todayCard.stories.find((s) => s.id === storyId);
  }

  if (!story && state.archiveCards.length > 0) {
    for (const card of state.archiveCards) {
      story = card.stories.find((s) => s.id === storyId);
      if (story) break;
    }
  }

  // Fallback if story not found
  if (!story) {
    return (
      <ScreenContainer className="p-6 justify-center items-center">
        <Text className="text-lg text-foreground font-semibold">
          Story not found
        </Text>
        <Pressable
          onPress={() => {
            router.back();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => [
            { opacity: pressed ? 0.7 : 1, marginTop: 16 },
          ]}
        >
          <Text className="text-base text-primary font-semibold">Go back</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const handleOpenURL = async () => {
    if (story?.url) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await WebBrowser.openBrowserAsync(story.url);
    }
  };

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

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-4 border-b border-divider">
        <Pressable
          onPress={() => {
            router.back();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.primary} />
        </Pressable>
        <Text className="text-lg font-semibold text-foreground flex-1 ml-4">
          Story Details
        </Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleShare(story);
          }}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-6">
          {/* Category Badge */}
          <View className="flex-row items-center gap-2 mb-4">
            <View className="bg-primary px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-background capitalize">
                {story.category}
              </Text>
            </View>
            <Text className="text-xs text-muted">{story.timestamp}</Text>
          </View>

          {/* Headline */}
          <Text className="text-3xl font-bold text-foreground mb-4 leading-tight">
            {story.headline}
          </Text>

          {/* Source */}
          <View className="flex-row items-center gap-2 mb-6 pb-6 border-b border-divider">
            <Text className="text-sm text-muted">Source:</Text>
            <Text className="text-sm font-semibold text-foreground">
              {story.source}
            </Text>
          </View>

          {/* Summary */}
          <View className="mb-8">
            <Text className="text-base leading-relaxed text-foreground">
              {story.summary}
            </Text>
          </View>

          {/* Why This Matters */}
          <View className="bg-surface rounded-lg p-4 mb-8 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Why this matters
            </Text>
            <Text className="text-sm leading-relaxed text-foreground">
              {story.whyItMatters}
            </Text>
          </View>

          {/* Read Full Story Button */}
          {story.url && (
            <Pressable
              onPress={handleOpenURL}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View className="bg-primary rounded-lg p-4 items-center">
                <Text className="text-base font-semibold text-background">
                  Read Full Story
                </Text>
              </View>
            </Pressable>
          )}

          {/* Footer */}
          <View className="mt-8 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center">
              Story from {story.source} • {story.timestamp}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
