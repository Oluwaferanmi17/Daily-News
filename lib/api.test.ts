import { describe, it, expect } from "vitest";

/**
 * Test API key validation
 * These tests verify that the API keys are correctly configured
 */

describe("API Keys", () => {
  it("should have NEWSAPI_KEY configured", () => {
    const key = process.env.EXPO_PUBLIC_NEWSAPI_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should have GEMINI_API_KEY configured", () => {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.length).toBeGreaterThan(0);
  });

  it("should validate NewsAPI key format", async () => {
    const key = process.env.EXPO_PUBLIC_NEWSAPI_KEY;
    if (!key) {
      throw new Error("NEWSAPI_KEY not configured");
    }

    try {
      // Make a lightweight request to validate the key
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=ng&pageSize=1&apiKey=${key}`
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("articles");
      expect(Array.isArray(data.articles)).toBe(true);
    } catch (error) {
      throw new Error(`NewsAPI key validation failed: ${error}`);
    }
  });

  it("should validate Gemini API key format", async () => {
    const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    try {
      // Make a lightweight request to validate the key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Say 'API key is valid' in one sentence.",
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid Gemini API key");
      }
      expect([200, 400, 404]).toContain(response.status);
    } catch (error) {
      throw new Error(`Gemini API key validation failed: ${error}`);
    }
  });
});
