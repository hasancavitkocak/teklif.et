import { MapPin, Shield, X } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useState } from 'react';

export default function LocationPermissionModal() {
  const { showLocationModal, setShowLocationModal, requestLocationPermission, setLocationPermission } = useLocation();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  if (!showLocationModal) return null;

  const handleAllowLocation = async () => {
    setIsRequesting(true);
    setError('');
    
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        setShowLocationModal(false);
      } else {
        setError('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini manuel olarak verebilirsiniz.');
      }
    } catch (err) {
      setError('Konum izni alınırken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDenyLocation = () => {
    setLocationPermission(false);
    setShowLocationModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDenyLocation();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={handleDenyLocation}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Konum İzni</h2>
          <p className="text-gray-600 mb-6">Yakınındaki etkinlikleri gösterebilmemiz için konum iznine ihtiyacımız var</p>
          
          <div className="bg-violet-50 rounded-xl p-6 mb-6">
            <Shield className="w-8 h-8 text-violet-500 mx-auto mb-2" />
            <p className="text-sm text-violet-700">Konum bilgin güvende. Sadece yakınındaki etkinlikleri göstermek için kullanılır.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDenyLocation}
              disabled={isRequesting}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all disabled:opacity-50"
            >
              Şimdi Değil
            </button>
            <button
              onClick={handleAllowLocation}
              disabled={isRequesting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRequesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  İzin İsteniyor...
                </>
              ) : (
                'İzin Ver'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Mobil cihazlarda tarayıcı ayarlarından konum iznini manuel olarak vermeniz gerekebilir.
          </p>
        </div>
      </div>
    </div>
  );
}