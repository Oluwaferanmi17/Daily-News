import { useEffect, useState, useCallback } from "react";
import {
  LocationData,
  getCurrentLocation,
  checkLocationPermission,
} from "@/lib/geolocation-service";
import { generateLocationAwareDailyCard } from "@/lib/news-service-location";
import { DailyCard, NewsCategory } from "@/lib/types";

export interface UseLocationNewsState {
  location: LocationData | null;
  locationLoading: boolean;
  locationError: string | null;
  dailyCard: DailyCard | null;
  cardLoading: boolean;
  cardError: string | null;
  permissionGranted: boolean;
}

/**
 * Hook for managing location-based news curation
 */
export function useLocationNews(categories: NewsCategory[]) {
  const [state, setState] = useState<UseLocationNewsState>({
    location: null,
    locationLoading: false,
    locationError: null,
    dailyCard: null,
    cardLoading: false,
    cardError: null,
    permissionGranted: false,
  });

  // Check location permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await checkLocationPermission();
      setState((prev) => ({
        ...prev,
        permissionGranted: permission.granted,
      }));
    };

    checkPermission();
  }, []);

  // Fetch location
  const fetchLocation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      locationLoading: true,
      locationError: null,
    }));

    try {
      const location = await getCurrentLocation();
      setState((prev) => ({
        ...prev,
        location,
        locationLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        locationError:
          error instanceof Error ? error.message : "Failed to get location",
        locationLoading: false,
      }));
    }
  }, []);

  // Generate location-aware daily card
  const generateCard = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      cardLoading: true,
      cardError: null,
    }));

    try {
      const card = await generateLocationAwareDailyCard(
        categories,
        state.location,
      );
      setState((prev) => ({
        ...prev,
        dailyCard: card,
        cardLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        cardError:
          error instanceof Error ? error.message : "Failed to generate card",
        cardLoading: false,
      }));
    }
  }, [categories, state.location]);

  return {
    ...state,
    fetchLocation,
    generateCard,
  };
}
