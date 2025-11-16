import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { checkLocationPermission, requestLocationPermission as requestPermission, getCurrentLocation, getPlatformInfo } from '../utils/locationUtils';

type LocationContextType = {
  hasLocationPermission: boolean;
  setLocationPermission: (permission: boolean) => void;
  requestLocationPermission: () => Promise<boolean>;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Sayfa yüklendiğinde permission durumunu kontrol et
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        // Önce localStorage'dan kontrol et
        const savedPermission = localStorage.getItem('locationPermission');
        if (savedPermission === 'true') {
          setHasLocationPermission(true);
          return;
        }

        // Gerçek permission durumunu kontrol et
        try {
          const permissionStatus = await checkLocationPermission();
          if (permissionStatus.granted) {
            setLocationPermission(true);
          }
        } catch (error) {
          console.log('Error checking initial permissions:', error);
        }
      } catch (error) {
        console.log('Error in initial permission check:', error);
      }
    };

    checkInitialPermission();
  }, []);

  const setLocationPermission = (permission: boolean) => {
    setHasLocationPermission(permission);
    try {
      localStorage.setItem('locationPermission', permission.toString());
    } catch (error) {
      console.log('localStorage not available');
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const platformInfo = getPlatformInfo();
      console.log('Platform info:', platformInfo);
      
      // Permission iste
      const granted = await requestPermission();
      console.log('Permission request result:', granted);
      
      if (granted) {
        // Test için konum al
        const location = await getCurrentLocation();
        if (location) {
          console.log('Location obtained:', location);
          setLocationPermission(true);
          return true;
        } else {
          console.log('Could not get location despite permission');
          setLocationPermission(false);
          return false;
        }
      } else {
        console.log('Location permission denied');
        setLocationPermission(false);
        return false;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
      return false;
    }
  };



  return (
    <LocationContext.Provider value={{
      hasLocationPermission,
      setLocationPermission,
      requestLocationPermission,
      showLocationModal,
      setShowLocationModal
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}