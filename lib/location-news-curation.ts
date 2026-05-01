import { NewsStory } from "./types";
import {
  LocationData,
  isInNigeria,
  CountryCode,
  SUPPORTED_COUNTRIES,
} from "./geolocation-service";

/**
 * Location-based story ranking factors
 */
export interface StoryRankingFactors {
  locationRelevance: number; // 0-100: how relevant to user's location
  categoryMatch: number; // 0-100: how well it matches user's preferences
  recency: number; // 0-100: how recent the story is
  engagement: number; // 0-100: estimated engagement/importance
}

/**
 * Get location-based keywords for news curation
 */
export function getLocationKeywords(location: LocationData): string[] {
  const keywords: string[] = [];

  // Add country-specific keywords
  if (isInNigeria(location.countryCode)) {
    keywords.push("Nigeria", "Lagos", "Abuja", "Kano", "Nigerian");
  } else {
    keywords.push(location.countryName);
    if (location.city) {
      keywords.push(location.city);
    }
    if (location.region) {
      keywords.push(location.region);
    }
  }

  // Add regional keywords
  if (
    location.countryCode === "NG" ||
    location.countryCode === "KE" ||
    location.countryCode === "ZA" ||
    location.countryCode === "GH"
  ) {
    keywords.push("Africa", "African");
  }

  return keywords;
}

/**
 * Calculate location relevance score for a story
 * Returns 0-100 where 100 is most relevant to user's location
 */
export function calculateLocationRelevance(
  story: NewsStory,
  location: LocationData,
): number {
  const keywords = getLocationKeywords(location);
  const storyText =
    `${story.headline} ${story.summary} ${story.whyItMatters}`.toLowerCase();

  let relevanceScore = 0;
  let keywordMatches = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "g");
    const matches = storyText.match(regex) || [];
    if (matches.length > 0) {
      keywordMatches += matches.length;
      relevanceScore += 25; // Base score per keyword match
    }
  }

  // Boost score for multiple mentions
  if (keywordMatches > 1) {
    relevanceScore += Math.min(keywordMatches * 10, 50);
  }

  // Cap at 100
  return Math.min(relevanceScore, 100);
}

/**
 * Calculate category match score
 * Returns 0-100 where 100 is perfect match to user preferences
 */
export function calculateCategoryMatch(
  story: NewsStory,
  userCategories: string[],
): number {
  if (userCategories.length === 0) {
    return 50; // Neutral score if no preferences
  }

  const isMatch = userCategories.includes(story.category);
  return isMatch ? 100 : 25; // 100 if matches, 25 if doesn't
}

/**
 * Calculate recency score
 * Returns 0-100 where 100 is very recent
 */
export function calculateRecencyScore(story: NewsStory): number {
  const storyDate = new Date(story.timestamp);
  const now = new Date();
  const ageInHours = (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60);

  // Stories less than 1 hour old: 100
  if (ageInHours < 1) {
    return 100;
  }
  // Stories 1-24 hours old: 100 - (ageInHours * 4)
  if (ageInHours < 24) {
    return Math.max(100 - ageInHours * 4, 50);
  }
  // Stories older than 24 hours: 50 or less
  return Math.max(50 - ageInHours / 24, 10);
}

/**
 * Calculate engagement score based on source and category
 * Returns 0-100
 */
export function calculateEngagementScore(story: NewsStory): number {
  let score = 50; // Base score

  // Boost for tech and business stories (typically higher engagement)
  if (story.category === "tech" || story.category === "business") {
    score += 20;
  }

  // Boost for breaking news indicators
  if (
    story.headline.toLowerCase().includes("breaking") ||
    story.headline.toLowerCase().includes("urgent")
  ) {
    score += 15;
  }

  // Boost for major news sources
  const majorSources = [
    "BBC",
    "Reuters",
    "AP",
    "Bloomberg",
    "TechCrunch",
    "The Guardian",
  ];
  if (majorSources.some((source) => story.source.includes(source))) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calculate overall ranking score for a story
 */
export function calculateStoryRankingScore(
  story: NewsStory,
  location: LocationData,
  userCategories: string[],
  weights: {
    locationWeight?: number;
    categoryWeight?: number;
    recencyWeight?: number;
    engagementWeight?: number;
  } = {},
): number {
  // Default weights: location is most important for location-based curation
  const {
    locationWeight = 0.4,
    categoryWeight = 0.3,
    recencyWeight = 0.2,
    engagementWeight = 0.1,
  } = weights;

  const locationRelevance = calculateLocationRelevance(story, location);
  const categoryMatch = calculateCategoryMatch(story, userCategories);
  const recency = calculateRecencyScore(story);
  const engagement = calculateEngagementScore(story);

  const score =
    locationRelevance * locationWeight +
    categoryMatch * categoryWeight +
    recency * recencyWeight +
    engagement * engagementWeight;

  return score;
}

/**
 * Get ranking factors for a story (for debugging/UI display)
 */
export function getStoryRankingFactors(
  story: NewsStory,
  location: LocationData,
  userCategories: string[],
): StoryRankingFactors {
  return {
    locationRelevance: calculateLocationRelevance(story, location),
    categoryMatch: calculateCategoryMatch(story, userCategories),
    recency: calculateRecencyScore(story),
    engagement: calculateEngagementScore(story),
  };
}

/**
 * Sort stories by location-based ranking
 */
export function rankStoriesByLocation(
  stories: NewsStory[],
  location: LocationData,
  userCategories: string[],
): NewsStory[] {
  const scoredStories = stories.map((story) => ({
    story,
    score: calculateStoryRankingScore(story, location, userCategories),
  }));

  // Sort by score descending
  scoredStories.sort((a, b) => b.score - a.score);

  return scoredStories.map((item) => item.story);
}

/**
 * Prioritize Nigeria stories when user is in Nigeria
 * Returns stories with Nigeria content first, then other preferences
 */
export function prioritizeNigeriaStories(
  stories: NewsStory[],
  location: LocationData,
  userCategories: string[],
): NewsStory[] {
  if (!isInNigeria(location.countryCode)) {
    // If not in Nigeria, use standard location-based ranking
    return rankStoriesByLocation(stories, location, userCategories);
  }

  // Separate Nigeria stories from others
  const nigeriaStories: NewsStory[] = [];
  const otherStories: NewsStory[] = [];

  for (const story of stories) {
    const locationRelevance = calculateLocationRelevance(story, location);
    // Consider it a Nigeria story if location relevance is high (>60)
    if (locationRelevance > 60) {
      nigeriaStories.push(story);
    } else {
      otherStories.push(story);
    }
  }

  // Sort each group by overall ranking
  const rankedNigeria = rankStoriesByLocation(
    nigeriaStories,
    location,
    userCategories,
  );
  const rankedOther = rankStoriesByLocation(
    otherStories,
    location,
    userCategories,
  );

  // Return Nigeria stories first (70% of results), then other stories (30%)
  const totalStories = stories.length;
  const nigeriaCount = Math.ceil(totalStories * 0.7);

  return [
    ...rankedNigeria.slice(0, nigeriaCount),
    ...rankedOther.slice(0, totalStories - nigeriaCount),
  ];
}

/**
 * Get location-based news curation summary
 */
export function getLocationCurationSummary(
  location: LocationData,
  userCategories: string[],
): string {
  let summary = `Curating news for ${location.countryName}`;

  if (userCategories.length > 0) {
    summary += ` with focus on ${userCategories.join(", ")}`;
  }

  if (isInNigeria(location.countryCode)) {
    summary += " — Nigeria stories prioritized";
  }

  return summary;
}
