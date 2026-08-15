import { GeocodedLocation } from '../types';

export interface Coordinates {
  lat: number;
  lng: number;
}

export const DEFAULT_LOCATION: GeocodedLocation = {
  lat: 12.9784,
  lng: 77.6408,
  neighborhood: 'Indiranagar',
  fullAddress: 'Indiranagar, Bengaluru',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  timestamp: Date.now(),
  source: 'fallback',
};

export const LOCATION_CACHE_KEY = 'circles_user_live_location_v2';
export const LOCATION_BANNER_DISMISSED_KEY = 'circles_location_banner_dismissed';

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats meter distance into precise human readable string (e.g. 120 m away, 450 m away, 1.2 km away)
 */
export function formatDistance(meters: number): string {
  if (isNaN(meters) || meters < 0) return 'Nearby';
  if (meters < 50) return '50 m away';
  if (meters < 1000) {
    const roundedMeters = Math.round(meters / 10) * 10;
    return `${roundedMeters} m away`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km away`;
}

/**
 * Clean & format human-readable neighborhood and city names
 */
function cleanLocationName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(Sector\s*\d+)\s*(.*)/i, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reverse geocode latitude & longitude to human-friendly neighborhood & city
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ neighborhood: string; fullAddress: string; city: string; state?: string; country?: string }> {
  // Method 1: Try BigDataCloud (Free, high-rate-limit, very accurate for client locality & neighborhood)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = cleanLocationName(
        data.locality || data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[2]?.name || ''
      );
      const city = cleanLocationName(data.city || data.principalSubdivision || data.locality || '');
      const state = cleanLocationName(data.principalSubdivision || '');
      const country = cleanLocationName(data.countryName || '');

      let neighborhood = locality;
      if (!neighborhood || neighborhood.toLowerCase() === city.toLowerCase()) {
        const subLocality = data.localityInfo?.informative?.[0]?.name || data.localityInfo?.administrative?.[4]?.name;
        if (subLocality) neighborhood = cleanLocationName(subLocality);
      }

      if (!neighborhood) neighborhood = city || 'Local Neighborhood';

      let fullAddress = neighborhood;
      if (city && city.toLowerCase() !== neighborhood.toLowerCase()) {
        fullAddress = `${neighborhood}, ${city}`;
      } else if (state && state.toLowerCase() !== neighborhood.toLowerCase()) {
        fullAddress = `${neighborhood}, ${state}`;
      }

      if (neighborhood && fullAddress) {
        return {
          neighborhood,
          fullAddress,
          city: city || neighborhood,
          state,
          country,
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud geocode failed, trying Nominatim fallback:', err);
  }

  // Method 2: Try OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const neighborhood =
        cleanLocationName(
          addr.neighbourhood ||
          addr.suburb ||
          addr.quarter ||
          addr.residential ||
          addr.city_district ||
          addr.subdistrict ||
          addr.hamlet ||
          addr.village ||
          addr.road ||
          addr.town ||
          addr.city
        ) || 'Local Neighborhood';

      const city =
        cleanLocationName(
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.state_district ||
          addr.county ||
          addr.state
        ) || neighborhood;

      const state = cleanLocationName(addr.state || '');
      const country = cleanLocationName(addr.country || '');

      let fullAddress = neighborhood;
      if (city && city.toLowerCase() !== neighborhood.toLowerCase()) {
        fullAddress = `${neighborhood}, ${city}`;
      } else if (state && state.toLowerCase() !== neighborhood.toLowerCase()) {
        fullAddress = `${neighborhood}, ${state}`;
      }

      return {
        neighborhood,
        fullAddress,
        city,
        state,
        country,
      };
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err);
  }

  // Method 3: Coordinate Fallback
  return {
    neighborhood: 'Local Neighborhood',
    fullAddress: `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`,
    city: 'Local Area',
  };
}

/**
 * Get cached location from localStorage
 */
export function getCachedLocation(): GeocodedLocation {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const parsed: GeocodedLocation = JSON.parse(cached);
      // Valid if less than 24 hours old and has neighborhood
      if (parsed && parsed.neighborhood && Date.now() - parsed.timestamp < 86400000) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Location cache parse error:', e);
  }
  return DEFAULT_LOCATION;
}

/**
 * Save location to localStorage cache
 */
export function saveCachedLocation(location: GeocodedLocation): void {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
  } catch (e) {
    console.warn('Failed to cache location:', e);
  }
}

/**
 * Request high-accuracy GPS position from browser navigator
 */
export function getCurrentGpsPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
