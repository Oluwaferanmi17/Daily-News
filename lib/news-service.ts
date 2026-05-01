/**
 * News Service - Handles fetching and curating news stories
 * Integrates with NewsAPI for story fetching and Google Gemini for context generation
 */

import { NewsStory, DailyCard, NewsCategory } from "./types";

const NEWSAPI_KEY = process.env.EXPO_PUBLIC_NEWSAPI_KEY;
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Map categories to NewsAPI country/search parameters
const CATEGORY_PARAMS: Record<NewsCategory, { country?: string; q?: string }> =
  {
    tech: { q: "technology OR AI OR software" },
    business: { q: "business OR economy OR market" },
    politics: { q: "politics OR government OR policy" },
    sports: { q: "sports" },
    local: { country: "ng" }, // Nigeria
    global: { country: "us" }, // Global news from US source
  };

/**
 * Fetch news stories from NewsAPI
 */
export async function fetchNewsStories(
  categories: NewsCategory[],
  limit: number = 10,
): Promise<NewsStory[]> {
  if (!NEWSAPI_KEY) {
    console.error("NEWSAPI_KEY not configured");
    return [];
  }

  try {
    const allStories: NewsStory[] = [];

    // Fetch stories for each selected category
    for (const category of categories) {
      const params = CATEGORY_PARAMS[category];
      const queryParams = new URLSearchParams({
        pageSize: "5",
        apiKey: NEWSAPI_KEY,
        ...(params.country && { country: params.country }),
        ...(params.q && { q: params.q }),
        sortBy: "publishedAt",
      });

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?${queryParams}`,
      );

      if (!response.ok) {
        console.error(`Failed to fetch ${category} news:`, response.statusText);
        continue;
      }

      const data = await response.json();

      if (data.articles && Array.isArray(data.articles)) {
        for (const article of data.articles) {
          // Skip articles without required fields
          if (!article.title || !article.description) continue;

          allStories.push({
            id: `${Date.now()}-${Math.random()}`,
            headline: article.title,
            summary: article.description,
            category,
            source: article.source?.name || "Unknown",
            timestamp: new Date(article.publishedAt).toLocaleString(),
            whyItMatters: "", // Will be filled by AI
            url: article.url,
            imageUrl: article.urlToImage,
          });
        }
      }
    }

    // Return top stories, limited by requested count
    return allStories.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

/**
 * Generate "Why this matters" context using Google Gemini
 */
export async function generateWhyItMatters(
  headline: string,
  summary: string,
  category: NewsCategory,
): Promise<string> {
  try {
    const API_KEY = GEMINI_API_KEY;

    if (!API_KEY) throw new Error("Missing Gemini API key");

    const prompt = `Explain briefly why this news matters (1 short sentence).

Headline: ${headline}
Summary: ${summary}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    // 🔥 THIS is the important fix
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error FULL:", errorText);
      throw new Error(errorText);
    }

    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return text || "Impact to be determined";
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);
    return "Impact to be determined";
  }
}

/**
 * Curate and generate today's Daily Card
 */
export async function generateDailyCard(
  categories: NewsCategory[],
): Promise<DailyCard> {
  try {
    // Fetch raw stories
    const rawStories = await fetchNewsStories(categories, 10);

    if (rawStories.length === 0) {
      console.warn("No stories fetched, returning empty card");
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return {
        id: `card-${Date.now()}`,
        date: today,
        stories: [],
        createdAt: new Date().toISOString(),
      };
    }

    // Generate "why it matters" for each story (top 5)
    // const curatedStories: NewsStory[] = [];
    const storiesToProcess = rawStories.slice(0, 5);

    const curatedStories = await Promise.all(
      storiesToProcess.map(async (story) => {
        const whyItMatters = await generateWhyItMatters(
          story.headline,
          story.summary,
          story.category,
        );

        return { ...story, whyItMatters };
      }),
    );

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      id: `card-${Date.now()}`,
      date: today,
      stories: curatedStories,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to generate daily card:", error);

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      id: `card-${Date.now()}`,
      date: today,
      stories: [],
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Cache a daily card for offline access
 */
export async function cacheDailyCard(card: DailyCard): Promise<void> {
  try {
    // TODO: Implement caching with AsyncStorage
    console.log("Caching daily card:", card.id);
  } catch (error) {
    console.error("Failed to cache daily card:", error);
  }
}

/**
 * Retrieve cached daily cards
 */
export async function getCachedCards(): Promise<DailyCard[]> {
  try {
    // TODO: Implement retrieval from AsyncStorage
    console.log("Retrieving cached cards");
    return [];
  } catch (error) {
    console.error("Failed to retrieve cached cards:", error);
    return [];
  }
}
