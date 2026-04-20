/**
 * Daily Brief type definitions
 */

export type NewsCategory = "tech" | "business" | "politics" | "sports" | "local" | "global";

export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  category: NewsCategory;
  source: string;
  timestamp: string;
  whyItMatters: string;
  url?: string;
  imageUrl?: string;
}

export interface DailyCard {
  id: string;
  date: string;
  stories: NewsStory[];
  createdAt: string;
}

export interface UserPreferences {
  categories: NewsCategory[];
  notificationTime: string; // HH:mm format
  notificationsEnabled: boolean;
  darkMode: "auto" | "light" | "dark";
  language: string;
}

export interface AppState {
  preferences: UserPreferences;
  todayCard: DailyCard | null;
  archiveCards: DailyCard[];
  isLoading: boolean;
  error: string | null;
}
