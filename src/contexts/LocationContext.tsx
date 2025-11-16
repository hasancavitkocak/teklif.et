import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

  // Sayfa yüklendiğinde localStorage'dan kontrol et
  useEffect(() => {
    try {
      const savedPermission = localStorage.getItem('locationPermission');
      if (savedPermission === 'true') {
        setHasLocationPermission(true);
      }
    } catch (error) {
      console.log('localStorage not available');
    }
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
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        setLocationPermission(false);
        resolve(false);
        return;
      }

      // Mobil cihazlar için daha detaylı options
      const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 dakika cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location permission granted:', position.coords);
          setLocationPermission(true);
          resolve(true);
        },
        (error) => {
          console.log('Location permission denied:', error.message);
          // Hata koduna göre farklı mesajlar
          switch(error.code) {
            case error.PERMISSION_DENIED:
              console.log('User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              console.log('The request to get user location timed out.');
              break;
          }
          setLocationPermission(false);
          resolve(false);
        },
        options
      );
    });
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