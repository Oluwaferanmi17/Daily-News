/**
 * Widget Service v2 for Daily Brief
 * Enhanced with multi-story support and swipe navigation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyCard, NewsStory } from "./types";

const WIDGET_DATA_KEY = "daily_brief_widget_data";
const WIDGET_LAST_UPDATE_KEY = "daily_brief_widget_last_update";
const WIDGET_ENABLED_KEY = "daily_brief_widget_enabled";
const MULTI_STORY_WIDGET_DATA_KEY = "daily_brief_multi_story_widget_data";
const WIDGET_CURRENT_INDEX_KEY = "daily_brief_widget_current_index";
const WIDGET_STORY_COUNT_KEY = "daily_brief_widget_story_count";

export interface WidgetData {
  topStory: NewsStory | null;
  storyCount: number;
  date: string;
  lastUpdated: string;
}

export interface MultiStoryWidgetData {
  stories: NewsStory[];
  currentIndex: number;
  totalStories: number;
  date: string;
  lastUpdated: string;
}

/**
 * Save daily card data to widget storage (single story)
 * This data is shared with the native widget extensions
 */
export async function saveWidgetData(card: DailyCard): Promise<void> {
  try {
    const widgetData: WidgetData = {
      topStory: card.stories[0] || null,
      storyCount: card.stories.length,
      date: card.date,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));
    await AsyncStorage.setItem(
      WIDGET_LAST_UPDATE_KEY,
      new Date().toISOString(),
    );

    // Also save multi-story widget data
    await saveMultiStoryWidgetData(card);

    // Trigger native widget update (platform-specific)
    await updateNativeWidget(widgetData);
  } catch (error) {
    console.error("Failed to save widget data:", error);
  }
}

/**
 * Save multi-story widget data (top 3 stories)
 */
export async function saveMultiStoryWidgetData(card: DailyCard): Promise<void> {
  try {
    const topThreeStories = card.stories.slice(0, 3);
    const multiStoryData: MultiStoryWidgetData = {
      stories: topThreeStories,
      currentIndex: 0,
      totalStories: topThreeStories.length,
      date: card.date,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      MULTI_STORY_WIDGET_DATA_KEY,
      JSON.stringify(multiStoryData),
    );
    await AsyncStorage.setItem(WIDGET_CURRENT_INDEX_KEY, "0");
    await AsyncStorage.setItem(
      WIDGET_STORY_COUNT_KEY,
      topThreeStories.length.toString(),
    );
    await incrementWidgetUpdateCount();
  } catch (error) {
    console.error("Failed to save multi-story widget data:", error);
  }
}

/**
 * Get multi-story widget data
 */
export async function getMultiStoryWidgetData(): Promise<MultiStoryWidgetData | null> {
  try {
    const data = await AsyncStorage.getItem(MULTI_STORY_WIDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get multi-story widget data:", error);
    return null;
  }
}

/**
 * Get current story index for multi-story widget
 */
export async function getWidgetCurrentIndex(): Promise<number> {
  try {
    const index = await AsyncStorage.getItem(WIDGET_CURRENT_INDEX_KEY);
    return index ? parseInt(index, 10) : 0;
  } catch (error) {
    console.error("Failed to get widget current index:", error);
    return 0;
  }
}

/**
 * Set current story index for multi-story widget (for swipe navigation)
 */
export async function setWidgetCurrentIndex(index: number): Promise<void> {
  try {
    const data = await getMultiStoryWidgetData();
    if (data && index >= 0 && index < data.totalStories) {
      await AsyncStorage.setItem(WIDGET_CURRENT_INDEX_KEY, index.toString());
    }
  } catch (error) {
    console.error("Failed to set widget current index:", error);
  }
}

/**
 * Get next story index (for swipe right)
 */
export async function getNextStoryIndex(): Promise<number> {
  try {
    const currentIndex = await getWidgetCurrentIndex();
    const data = await getMultiStoryWidgetData();
    if (data && data.totalStories > 0) {
      return (currentIndex + 1) % data.totalStories;
    }
    return 0;
  } catch (error) {
    console.error("Failed to get next story index:", error);
    return 0;
  }
}

/**
 * Get previous story index (for swipe left)
 */
export async function getPreviousStoryIndex(): Promise<number> {
  try {
    const currentIndex = await getWidgetCurrentIndex();
    const data = await getMultiStoryWidgetData();
    if (data && data.totalStories > 0) {
      return (currentIndex - 1 + data.totalStories) % data.totalStories;
    }
    return 0;
  } catch (error) {
    console.error("Failed to get previous story index:", error);
    return 0;
  }
}

/**
 * Get current story from multi-story widget data
 */
export async function getCurrentWidgetStory(): Promise<NewsStory | null> {
  try {
    const data = await getMultiStoryWidgetData();
    if (!data || data.stories.length === 0) {
      return null;
    }
    return data.stories[data.currentIndex] || null;
  } catch (error) {
    console.error("Failed to get current widget story:", error);
    return null;
  }
}

/**
 * Get story at specific index
 */
export async function getWidgetStoryAtIndex(
  index: number,
): Promise<NewsStory | null> {
  try {
    const data = await getMultiStoryWidgetData();
    if (!data || index < 0 || index >= data.stories.length) {
      return null;
    }
    return data.stories[index] || null;
  } catch (error) {
    console.error("Failed to get widget story at index:", error);
    return null;
  }
}

/**
 * Get current widget data
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to get widget data:", error);
    return null;
  }
}

/**
 * Check if widget is enabled
 */
export async function isWidgetEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(WIDGET_ENABLED_KEY);
    return enabled === "true";
  } catch (error) {
    console.error("Failed to check widget enabled state:", error);
    return false;
  }
}

/**
 * Enable or disable widget
 */
export async function setWidgetEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_ENABLED_KEY, enabled ? "true" : "false");
  } catch (error) {
    console.error("Failed to set widget enabled state:", error);
  }
}

/**
 * Get widget last update time
 */
export async function getWidgetLastUpdate(): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(WIDGET_LAST_UPDATE_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error("Failed to get widget last update:", error);
    return null;
  }
}

/**
 * Clear widget data (used when disabling widget)
 */
export async function clearWidgetData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WIDGET_DATA_KEY);
    await AsyncStorage.removeItem(WIDGET_LAST_UPDATE_KEY);
    await AsyncStorage.removeItem(MULTI_STORY_WIDGET_DATA_KEY);
    await AsyncStorage.removeItem(WIDGET_CURRENT_INDEX_KEY);
    await AsyncStorage.removeItem(WIDGET_STORY_COUNT_KEY);
  } catch (error) {
    console.error("Failed to clear widget data:", error);
  }
}

/**
 * Platform-specific native widget update
 * This would be called via native modules in production
 */
async function updateNativeWidget(data: WidgetData): Promise<void> {
  try {
    // iOS: Update WidgetKit timeline
    if (typeof window !== "undefined" && (window as any).DailyBriefWidget) {
      (window as any).DailyBriefWidget.updateTimeline(data);
    }

    // Android: Update App Widget
    if (typeof window !== "undefined" && (window as any).AndroidWidget) {
      (window as any).AndroidWidget.updateWidget(data);
    }
  } catch (error) {
    console.error("Failed to update native widget:", error);
  }
}

/**
 * Format widget display text
 */
export function formatWidgetText(story: NewsStory | null): string {
  if (!story) {
    return "No stories available";
  }

  // Truncate headline to fit widget space
  const headline =
    story.headline.length > 50
      ? story.headline.substring(0, 47) + "..."
      : story.headline;

  return headline;
}

/**
 * Format widget context text
 */
export function formatWidgetContext(story: NewsStory | null): string {
  if (!story) {
    return "";
  }

  // Truncate context to fit widget space
  const context =
    story.whyItMatters.length > 80
      ? story.whyItMatters.substring(0, 77) + "..."
      : story.whyItMatters;

  return context;
}

/**
 * Get widget configuration
 */
export interface WidgetConfig {
  showTopStoryOnly: boolean;
  showContext: boolean;
  refreshInterval: number; // in minutes
  theme: "light" | "dark" | "auto";
  storyCount: number; // 1, 2, or 3
  enableSwipeNavigation: boolean;
}

/**
 * Get widget configuration
 */
export async function getWidgetConfig(): Promise<WidgetConfig> {
  try {
    const config = await AsyncStorage.getItem("daily_brief_widget_config");
    return config
      ? JSON.parse(config)
      : {
          showTopStoryOnly: false,
          showContext: true,
          refreshInterval: 60,
          theme: "auto",
          storyCount: 3,
          enableSwipeNavigation: true,
        };
  } catch (error) {
    console.error("Failed to get widget config:", error);
    return {
      showTopStoryOnly: false,
      showContext: true,
      refreshInterval: 60,
      theme: "auto",
      storyCount: 3,
      enableSwipeNavigation: true,
    };
  }
}

/**
 * Save widget configuration
 */
export async function saveWidgetConfig(config: WidgetConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(
      "daily_brief_widget_config",
      JSON.stringify(config),
    );
  } catch (error) {
    console.error("Failed to save widget config:", error);
  }
}

/**
 * Widget statistics for analytics
 */
export interface WidgetStats {
  isEnabled: boolean;
  lastUpdated: Date | null;
  updateCount: number;
  averageRefreshInterval: number;
  storyCount: number;
}

/**
 * Get widget statistics
 */
export async function getWidgetStats(): Promise<WidgetStats> {
  try {
    const isEnabled = await isWidgetEnabled();
    const lastUpdated = await getWidgetLastUpdate();
    const updateCount = parseInt(
      (await AsyncStorage.getItem("daily_brief_widget_update_count")) || "0",
    );
    const config = await getWidgetConfig();
    const storyCount = parseInt(
      (await AsyncStorage.getItem(WIDGET_STORY_COUNT_KEY)) || "0",
    );

    return {
      isEnabled,
      lastUpdated,
      updateCount,
      averageRefreshInterval: config.refreshInterval,
      storyCount,
    };
  } catch (error) {
    console.error("Failed to get widget stats:", error);
    return {
      isEnabled: false,
      lastUpdated: null,
      updateCount: 0,
      averageRefreshInterval: 60,
      storyCount: 0,
    };
  }
}

/**
 * Increment widget update count
 */
export async function incrementWidgetUpdateCount(): Promise<void> {
  try {
    const count = parseInt(
      (await AsyncStorage.getItem("daily_brief_widget_update_count")) || "0",
    );
    await AsyncStorage.setItem(
      "daily_brief_widget_update_count",
      (count + 1).toString(),
    );
  } catch (error) {
    console.error("Failed to increment widget update count:", error);
  }
}

/**
 * Get story count from widget data
 */
export async function getWidgetStoryCount(): Promise<number> {
  try {
    const count = await AsyncStorage.getItem(WIDGET_STORY_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Failed to get widget story count:", error);
    return 0;
  }
}
