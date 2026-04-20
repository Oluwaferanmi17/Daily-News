import { useCallback, useState } from "react";
import { useAppContext } from "@/lib/app-context";
import { generateDailyCard } from "@/lib/news-service";

/**
 * Hook to fetch and manage today's daily card
 */
export function useDailyCard() {
  const { state, setTodayCard, setLoading, setError } = useAppContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate card with user's selected categories
      const card = await generateDailyCard(state.preferences.categories);

      if (card.stories.length > 0) {
        setTodayCard(card);
      } else {
        setError("No stories available. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to fetch daily card:", error);
      setError("Failed to load daily brief. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [state.preferences.categories, setTodayCard, setLoading, setError]);

  const refreshCard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchCard();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchCard]);

  return {
    card: state.todayCard,
    isLoading: state.isLoading,
    isRefreshing,
    error: state.error,
    fetchCard,
    refreshCard,
  };
}
