import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Supported countries for location-based news curation
 */
export const SUPPORTED_COUNTRIES = {
  NG: { name: "Nigeria", code: "NG", priority: 1 },
  KE: { name: "Kenya", code: "KE", priority: 2 },
  ZA: { name: "South Africa", code: "ZA", priority: 2 },
  GH: { name: "Ghana", code: "GH", priority: 2 },
  US: { name: "United States", code: "US", priority: 3 },
  GB: { name: "United Kingdom", code: "GB", priority: 3 },
  CA: { name: "Canada", code: "CA", priority: 3 },
  AU: { name: "Australia", code: "AU", priority: 3 },
};

export type CountryCode = keyof typeof SUPPORTED_COUNTRIES;

export interface LocationData {
  latitude: number;
  longitude: number;
  countryCode: CountryCode;
  countryName: string;
  city?: string;
  region?: string;
  timestamp: string;
}

export interface LocationPermissionStatus {
  status: Location.PermissionStatus;
  granted: boolean;
}

const LOCATION_CACHE_KEY = "daily_brief_location_cache";
const LOCATION_PERMISSION_KEY = "daily_brief_location_permission";
const LOCATION_CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Request location permissions from the user
 */
export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";

    await AsyncStorage.setItem(
      LOCATION_PERMISSION_KEY,
      JSON.stringify({ status, granted, timestamp: new Date().toISOString() }),
    );

    return { status, granted };
  } catch (error) {
    console.error("Failed to request location permission:", error);
    return { status: Location.PermissionStatus.DENIED, granted: false };
  }
}

/**
 * Check if location permissions are granted
 */
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === "granted";
    return { status, granted };
  } catch (error) {
    console.error("Failed to check location permission:", error);
    return { status: Location.PermissionStatus.DENIED, granted: false };
  }
}

/**
 * Get current user location
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    // Check permissions first
    const permission = await checkLocationPermission();
    if (!permission.granted) {
      console.warn("Location permission not granted");
      return null;
    }

    // Check cache first
    const cached = await getLocationFromCache();
    if (cached) {
      return cached;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    // Reverse geocode to get country information
    const geocoded = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const address = geocoded[0];
    const countryCode = (address?.isoCountryCode?.toUpperCase() ||
      "US") as CountryCode;
    const country = SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.US;

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      countryCode,
      countryName: country.name,
      city: address?.city || undefined,
      region: address?.region || undefined,
      timestamp: new Date().toISOString(),
    };

    // Cache the location
    await cacheLocation(locationData);

    return locationData;
  } catch (error) {
    console.error("Failed to get current location:", error);
    return null;
  }
}

/**
 * Get location from cache if still valid
 */
async function getLocationFromCache(): Promise<LocationData | null> {
  try {
    const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const locationData: LocationData = JSON.parse(cached);
    const cacheAge = Date.now() - new Date(locationData.timestamp).getTime();

    // Return cached location if less than 1 hour old
    if (cacheAge < LOCATION_CACHE_DURATION) {
      return locationData;
    }

    // Cache expired, remove it
    await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Failed to get location from cache:", error);
    return null;
  }
}

/**
 * Cache location data
 */
async function cacheLocation(location: LocationData): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error("Failed to cache location:", error);
  }
}

/**
 * Clear cached location
 */
export async function clearLocationCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear location cache:", error);
  }
}

/**
 * Get country priority for news curation (1 = highest priority)
 */
export function getCountryPriority(countryCode: CountryCode): number {
  return SUPPORTED_COUNTRIES[countryCode]?.priority || 999;
}

/**
 * Check if user is in Nigeria
 */
export function isInNigeria(countryCode: CountryCode): boolean {
  return countryCode === "NG";
}

/**
 * Get location display name
 */
export function getLocationDisplayName(location: LocationData): string {
  if (location.city && location.region) {
    return `${location.city}, ${location.region}, ${location.countryName}`;
  }
  if (location.city) {
    return `${location.city}, ${location.countryName}`;
  }
  if (location.region) {
    return `${location.region}, ${location.countryName}`;
  }
  return location.countryName;
}

/**
 * Set manual location override (for testing or user preference)
 */
export async function setManualLocation(
  countryCode: CountryCode,
): Promise<void> {
  try {
    const country = SUPPORTED_COUNTRIES[countryCode];
    if (!country) {
      throw new Error(`Unsupported country code: ${countryCode}`);
    }

    const locationData: LocationData = {
      latitude: 0,
      longitude: 0,
      countryCode,
      countryName: country.name,
      timestamp: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      LOCATION_CACHE_KEY,
      JSON.stringify(locationData),
    );
  } catch (error) {
    console.error("Failed to set manual location:", error);
  }
}

/**
 * Get manual location override if set
 */
export async function getManualLocation(): Promise<LocationData | null> {
  try {
    const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const locationData: LocationData = JSON.parse(cached);
    // Return if latitude and longitude are 0 (manual override)
    if (locationData.latitude === 0 && locationData.longitude === 0) {
      return locationData;
    }

    return null;
  } catch (error) {
    console.error("Failed to get manual location:", error);
    return null;
  }
}
