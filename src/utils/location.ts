export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CachedLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

const DEFAULT_COORDS: Coordinates = {
  lat: 12.9784, // Sector 62 / Indiranagar
  lng: 77.6408,
};

const LOCATION_CACHE_KEY = 'neighborly_user_gps_coords';

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
 * Get cached location or default
 */
export function getCachedLocation(): Coordinates {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const parsed: CachedLocation = JSON.parse(cached);
      // Cache valid for 1 hour
      if (Date.now() - parsed.timestamp < 3600000) {
        return { lat: parsed.lat, lng: parsed.lng };
      }
    }
  } catch (e) {
    console.warn('Location cache parse error:', e);
  }
  return DEFAULT_COORDS;
}

/**
 * Request high-accuracy GPS position from browser navigator
 */
export function getCurrentGpsPosition(): Promise<Coordinates> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(getCachedLocation());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          localStorage.setItem(
            LOCATION_CACHE_KEY,
            JSON.stringify({
              lat: coords.lat,
              lng: coords.lng,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          // ignore cache write error
        }
        resolve(coords);
      },
      (error) => {
        console.warn('GPS location acquisition notice:', error.message);
        resolve(getCachedLocation());
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  });
}
