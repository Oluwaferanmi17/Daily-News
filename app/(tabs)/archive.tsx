import { ScrollView, Text, View, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { DailyCard } from "@/lib/types";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export default function ArchiveScreen() {
  const colors = useColors();
  const router = useRouter();
  const { state } = useAppContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStoryPress = (storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/story-detail?storyId=${storyId}`);
  };

  // Use archive data from app context
  const archiveData: DailyCard[] = state.archiveCards.length > 0 ? state.archiveCards : [
    {
      id: "1",
      date: "April 11, 2026",
      stories: [
        {
          id: "1",
          headline: "Nigeria signs new tech investment deal",
          summary: "",
          category: "tech",
          source: "",
          timestamp: "",
          whyItMatters: "",
        },
        {
          id: "2",
          headline: "Global oil prices rise 3%",
          summary: "",
          category: "business",
          source: "",
          timestamp: "",
          whyItMatters: "",
        },
        {
          id: "3",
          headline: "Major AI regulation announced in EU",
          summary: "",
          category: "tech",
          source: "",
          timestamp: "",
          whyItMatters: "",
        },
      ],
      createdAt: "",
    },
  ];

  const renderArchiveItem = ({ item }: { item: DailyCard }) => {
    const isExpanded = expandedId === item.id;

    return (
      <Pressable
        onPress={() => {
          setExpandedId(isExpanded ? null : item.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
          {/* Date Header */}
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-foreground">
              {item.date}
            </Text>
            <Text className="text-xs text-muted">
              {isExpanded ? "−" : "+"}
            </Text>
          </View>

          {/* Preview or Expanded Content */}
          {isExpanded ? (
            <View className="mt-4">
              {item.stories.map((story, index) => (
                <Pressable
                  key={story.id}
                  onPress={() => handleStoryPress(story.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <View className="mb-3">
                    <Text className="text-sm text-foreground leading-relaxed font-semibold">
                      • {story.headline}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text className="text-xs text-muted mt-2">
              {item.stories.length} stories
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="p-6">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground">Archive</Text>
        <Text className="text-sm text-muted mt-2">
          Browse past daily briefs
        </Text>
      </View>

      <FlatList
        data={archiveData}
        renderItem={renderArchiveItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View className="p-4 bg-surface rounded-lg border border-border mt-4">
        <Text className="text-xs text-muted text-center">
          Tap to expand • Older briefs loading...
        </Text>
      </View>
    </ScreenContainer>
  );
}
