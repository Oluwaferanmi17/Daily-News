/**
 * Location-Enhanced News Service
 * Extends the base news service with location-based story prioritization
 */

import { NewsStory, DailyCard, NewsCategory } from "./types";
import { LocationData } from "./geolocation-service";
import {
  prioritizeNigeriaStories,
  rankStoriesByLocation,
  getLocationCurationSummary,
} from "./location-news-curation";
import { fetchNewsStories, generateWhyItMatters } from "./news-service";

/**
 * Generate location-aware daily card
 * Prioritizes stories relevant to user's location
 */
export async function generateLocationAwareDailyCard(
  categories: NewsCategory[],
  location: LocationData | null,
): Promise<DailyCard> {
  try {
    // Fetch raw stories
    const rawStories = await fetchNewsStories(categories, 15); // Fetch more stories for better ranking

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

    // Rank stories by location if location is available
    let rankedStories = rawStories;
    if (location) {
      rankedStories = prioritizeNigeriaStories(
        rawStories,
        location,
        categories,
      );
    }

    // Generate "why it matters" for each story (top 5)
    const curatedStories: NewsStory[] = [];
    const storiesToProcess = rankedStories.slice(0, 5);

    for (const story of storiesToProcess) {
      const whyItMatters = await generateWhyItMatters(
        story.headline,
        story.summary,
        story.category,
      );

      curatedStories.push({
        ...story,
        whyItMatters,
      });
    }

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
    console.error("Failed to generate location-aware daily card:", error);

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
 * Curate stories with location context
 * Returns stories ranked by location relevance
 */
export async function curateStoriesWithLocation(
  stories: NewsStory[],
  location: LocationData,
  categories: NewsCategory[],
): Promise<NewsStory[]> {
  if (stories.length === 0) {
    return [];
  }

  // Rank stories by location
  const rankedStories = prioritizeNigeriaStories(stories, location, categories);

  // Generate "why it matters" for top stories
  const curatedStories: NewsStory[] = [];
  const storiesToProcess = rankedStories.slice(0, 5);

  for (const story of storiesToProcess) {
    const whyItMatters = await generateWhyItMatters(
      story.headline,
      story.summary,
      story.category,
    );

    curatedStories.push({
      ...story,
      whyItMatters,
    });
  }

  return curatedStories;
}

/**
 * Get location-based news curation status
 */
export function getLocationCurationStatus(
  location: LocationData | null,
  categories: NewsCategory[],
): {
  enabled: boolean;
  location: string;
  summary: string;
} {
  if (!location) {
    return {
      enabled: false,
      location: "Location not detected",
      summary: "Standard news curation based on your preferences",
    };
  }

  return {
    enabled: true,
    location: location.countryName,
    summary: getLocationCurationSummary(location, categories),
  };
}
