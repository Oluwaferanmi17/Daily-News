import { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, UserPreferences, DailyCard, NewsStory } from "./types";

const DEFAULT_PREFERENCES: UserPreferences = {
  categories: ["tech", "business", "politics", "sports", "local", "global"],
  notificationTime: "07:00",
  notificationsEnabled: true,
  darkMode: "auto",
  language: "en",
};

// Sample data for development
const SAMPLE_DAILY_CARD: DailyCard = {
  id: "today",
  date: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  stories: [
    {
      id: "1",
      headline: "Nigeria signs new tech investment deal",
      summary:
        "Nigeria has announced a major investment deal with international tech firms to boost the startup ecosystem. The agreement includes funding, mentorship, and infrastructure support.",
      category: "local",
      source: "TechCrunch Africa",
      timestamp: "2 hours ago",
      whyItMatters: "Could accelerate startup ecosystem growth and create tech jobs locally",
      url: "https://example.com/story1",
    },
    {
      id: "2",
      headline: "Global oil prices rise 3%",
      summary:
        "Oil prices surged 3% today following supply concerns and increased demand. Brent crude reached $85 per barrel, the highest in two months.",
      category: "business",
      source: "Reuters",
      timestamp: "1 hour ago",
      whyItMatters: "May affect fuel prices and transportation costs across Africa",
      url: "https://example.com/story2",
    },
    {
      id: "3",
      headline: "Major AI regulation announced in EU",
      summary:
        "The European Union has unveiled comprehensive AI regulation aimed at ensuring responsible development. The rules will apply to all AI systems used in the EU market.",
      category: "tech",
      source: "BBC",
      timestamp: "30 minutes ago",
      whyItMatters: "Could influence tech policy globally, including Africa's approach to AI",
      url: "https://example.com/story3",
    },
  ],
  createdAt: new Date().toISOString(),
};

type AppContextType = {
  state: AppState;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  setTodayCard: (card: DailyCard) => void;
  addArchiveCard: (card: DailyCard) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    preferences: DEFAULT_PREFERENCES,
    todayCard: SAMPLE_DAILY_CARD,
    archiveCards: [],
    isLoading: false,
    error: null,
  });

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem("dailybrief_preferences");
      if (saved) {
        const prefs = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          preferences: { ...DEFAULT_PREFERENCES, ...prefs },
        }));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  }, []);

  const savePreferences = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        "dailybrief_preferences",
        JSON.stringify(state.preferences)
      );
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }, [state.preferences]);

  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      setState((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, ...prefs },
      }));
      // Save updated preferences
      const updated = { ...state.preferences, ...prefs };
      try {
        await AsyncStorage.setItem("dailybrief_preferences", JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save preferences:", error);
      }
    },
    [state.preferences]
  );

  const setTodayCard = useCallback((card: DailyCard) => {
    setState((prev) => ({
      ...prev,
      todayCard: card,
    }));
  }, []);

  const addArchiveCard = useCallback((card: DailyCard) => {
    setState((prev) => ({
      ...prev,
      archiveCards: [card, ...prev.archiveCards],
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  const value: AppContextType = {
    state,
    preferences: state.preferences,
    updatePreferences,
    setTodayCard,
    addArchiveCard,
    setLoading,
    setError,
    loadPreferences,
    savePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
