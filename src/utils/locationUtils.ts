import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

/**
 * Konum izni durumunu kontrol eder
 */
export const checkLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Geolocation.checkPermissions();
      return {
        granted: permissions.location === 'granted',
        denied: permissions.location === 'denied',
        prompt: permissions.location === 'prompt'
      };
    } else {
      // Web için navigator.permissions API kullan
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return {
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt'
        };
      }
      
      // Fallback: localStorage kontrol et
      const saved = localStorage.getItem('locationPermission');
      return {
        granted: saved === 'true',
        denied: saved === 'false',
        prompt: saved === null
      };
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return {
      granted: false,
      denied: false,
      prompt: true
    };
  }
};

/**
 * Konum izni ister
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const result = await Geolocation.requestPermissions();
      return result.location === 'granted';
    } else {
      // Web için getCurrentPosition kullan (permission trigger eder)
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 5000 }
        );
      });
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Mevcut konumu alır
 */
export const getCurrentLocation = async (): Promise<LocationInfo | null> => {
  try {
    if (Capacitor.isNativePlatform()) {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000
      });
      
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } else {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            console.error('Error getting location:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });
    }
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Cihazın mobil olup olmadığını kontrol eder
 */
export const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Platform bilgisini döner
 */
export const getPlatformInfo = () => {
  return {
    isNative: Capacitor.isNativePlatform(),
    isMobile: isMobileDevice(),
    platform: Capacitor.getPlatform(),
    isWeb: !Capacitor.isNativePlatform()
  };
};