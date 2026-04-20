/* eslint-disable react/no-unescaped-entities */
import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";
import { NewsCategory } from "@/lib/types";

const CATEGORIES: { id: NewsCategory; label: string; description: string }[] = [
  {
    id: "tech",
    label: "Technology",
    description: "AI, startups, software, and innovation",
  },
  {
    id: "business",
    label: "Business",
    description: "Markets, economy, and corporate news",
  },
  {
    id: "politics",
    label: "Politics",
    description: "Government, policy, and elections",
  },
  {
    id: "sports",
    label: "Sports",
    description: "Sports events and athletes",
  },
  {
    id: "local",
    label: "Local (Nigeria)",
    description: "News from Nigeria and West Africa",
  },
  {
    id: "global",
    label: "Global",
    description: "International news and events",
  },
];

export default function PersonalizationScreen() {
  const colors = useColors();
  const router = useRouter();
  const { preferences, updatePreferences } = useAppContext();

  const handleCategoryToggle = async (category: NewsCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = preferences.categories.includes(category)
      ? preferences.categories.filter((c) => c !== category)
      : [...preferences.categories, category];
    await updatePreferences({ categories: updated });
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
          Your Interests
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-6">
          {/* Info */}
          <View className="mb-6">
            <Text className="text-sm text-muted">
              Select the topics you want to see in your Daily Brief. We'll
              curate stories based on your interests.
            </Text>
          </View>

          {/* Category Toggles */}
          <View className="gap-3 mb-8">
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                onPress={() => handleCategoryToggle(category.id)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View className="bg-surface rounded-lg p-4 border border-border flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-foreground">
                      {category.label}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {category.description}
                    </Text>
                  </View>
                  <Switch
                    value={preferences.categories.includes(category.id)}
                    onValueChange={() => handleCategoryToggle(category.id)}
                    trackColor={{
                      false: colors.border,
                      true: colors.primary,
                    }}
                    thumbColor={colors.foreground}
                  />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Selected Count */}
          <View className="p-4 bg-surface rounded-lg border border-border mb-8">
            <Text className="text-sm text-center text-muted">
              {preferences.categories.length} of {CATEGORIES.length} categories
              selected
            </Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View className="bg-primary rounded-lg p-4 items-center">
              <Text className="text-base font-semibold text-background">
                Save Preferences
              </Text>
            </View>
          </Pressable>

          {/* Info Footer */}
          <View className="mt-6 p-4 bg-surface rounded-lg border border-border">
            <Text className="text-xs text-muted text-center">
              Your preferences are saved locally on your device
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
