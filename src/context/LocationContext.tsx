import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GeocodedLocation } from '../types';
import {
  DEFAULT_LOCATION,
  getCachedLocation,
  saveCachedLocation,
  getCurrentGpsPosition,
  reverseGeocodeCoordinates,
  LOCATION_BANNER_DISMISSED_KEY,
} from '../utils/location';

interface LocationContextType {
  location: GeocodedLocation;
  isDetecting: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unavailable';
  error: string | null;
  showPermissionBanner: boolean;
  dismissBanner: () => void;
  refreshLocation: () => Promise<void>;
  setCustomLocation: (neighborhood: string, fullAddress: string, coords?: { lat: number; lng: number }) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<GeocodedLocation>(() => getCachedLocation());
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [showPermissionBanner, setShowPermissionBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCATION_BANNER_DISMISSED_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const detectLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unavailable');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      // 1. Fetch GPS coordinates
      const coords = await getCurrentGpsPosition();
      setPermissionStatus('granted');

      // 2. Reverse geocode into readable neighborhood & city
      const geocoded = await reverseGeocodeCoordinates(coords.lat, coords.lng);

      const resolvedLocation: GeocodedLocation = {
        lat: coords.lat,
        lng: coords.lng,
        neighborhood: geocoded.neighborhood,
        fullAddress: geocoded.fullAddress,
        city: geocoded.city,
        state: geocoded.state,
        country: geocoded.country,
        timestamp: Date.now(),
        source: 'gps',
      };

      setLocation(resolvedLocation);
      saveCachedLocation(resolvedLocation);
    } catch (err: any) {
      console.warn('Location detection notice:', err?.message || err);
      if (err?.code === 1 || err?.message?.includes('denied')) {
        setPermissionStatus('denied');
        setError('Location permission denied. Using standard circle.');
      } else {
        setPermissionStatus('unavailable');
        setError('Could not determine exact location.');
      }
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Check browser permissions and prompt on first mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission) => {
          setPermissionStatus(permission.state as 'prompt' | 'granted' | 'denied');
          permission.onchange = () => {
            setPermissionStatus(permission.state as 'prompt' | 'granted' | 'denied');
            if (permission.state === 'granted') {
              detectLocation();
            }
          };
        })
        .catch(() => {
          // Permissions query not supported or failed
        });
    }

    // Automatically request location on load
    detectLocation();
  }, [detectLocation]);

  const dismissBanner = () => {
    setShowPermissionBanner(false);
    try {
      localStorage.setItem(LOCATION_BANNER_DISMISSED_KEY, 'true');
    } catch (e) {
      console.warn('Could not save banner dismiss state', e);
    }
  };

  const setCustomLocation = (
    neighborhood: string,
    fullAddress: string,
    coords?: { lat: number; lng: number }
  ) => {
    const custom: GeocodedLocation = {
      lat: coords?.lat ?? location.lat,
      lng: coords?.lng ?? location.lng,
      neighborhood: neighborhood.trim() || 'Local Neighborhood',
      fullAddress: fullAddress.trim() || neighborhood.trim() || 'Local Area',
      city: fullAddress.split(',')[1]?.trim() || location.city,
      timestamp: Date.now(),
      source: 'custom',
    };
    setLocation(custom);
    saveCachedLocation(custom);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        permissionStatus,
        error,
        showPermissionBanner,
        dismissBanner,
        refreshLocation: detectLocation,
        setCustomLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
