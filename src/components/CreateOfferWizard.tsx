import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Calendar, MapPin, Users, Loader } from 'lucide-react';
import { supabase, ActivityOffer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation } from '../utils/locationUtils';

const categories = [
  { value: 'kahve', label: 'Kahve', emoji: '☕' },
  { value: 'yemek', label: 'Yemek', emoji: '🍽️' },
  { value: 'spor', label: 'Spor', emoji: '⚽' },
  { value: 'sinema', label: 'Sinema', emoji: '🎬' },
  { value: 'gezi', label: 'Gezi', emoji: '🗺️' },
  { value: 'konser', label: 'Konser', emoji: '🎵' },
  { value: 'diger', label: 'Diğer', emoji: '✨' },
];

type Props = {
  onNavigate: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile') => void;
  onSuccess?: () => void;
};

export default function CreateOfferWizard({ onSuccess }: Props) {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const [formData, setFormData] = useState({
    category: '' as ActivityOffer['category'] | '',
    title: '',
    description: '',
    city: profile?.city || '',
    district: '',
    event_date: '',
    event_time: '',
    offer_type: 'birebir' as 'birebir' | 'grup',
    participant_count: 2,
  });

  const totalSteps = 4;

  // Konum bilgisini al
  const getCurrentCity = async () => {
    setLocationLoading(true);
    setLocationError('');
    
    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        throw new Error('Konum alınamadı');
      }

      // Reverse geocoding ile şehir bilgisini al
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=tr`
      );
      
      if (!response.ok) {
        throw new Error('Şehir bilgisi alınamadı');
      }
      
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Bilinmeyen Şehir';
      
      setFormData(prev => ({ ...prev, city }));
      
    } catch (error) {
      console.error('❌ Location error:', error);
      setLocationError('Konum alınamadı. Lütfen manuel olarak girin.');
      // Fallback olarak profil şehrini kullan
      setFormData(prev => ({ ...prev, city: profile?.city || '' }));
    } finally {
      setLocationLoading(false);
    }
  };

  // 3. adıma geçildiğinde konum al
  useEffect(() => {
    if (currentStep === 3 && !formData.city) {
      getCurrentCity();
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !formData.category) {
      console.error('Missing profile or category:', { profile: !!profile, category: formData.category });
      alert('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}`);
      
      const offerData = {
        creator_id: profile.id,
        title: formData.title,
        description: formData.description,
        city: formData.city,
        district: formData.district || null,
        event_date: eventDateTime.toISOString(),
        participant_count: formData.participant_count,
        offer_type: formData.offer_type,
        category: formData.category,
        image_url: null,
        status: 'active' as const,
      };

      const { data, error: insertError } = await supabase
        .from('activity_offers')
        .insert(offerData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      onSuccess?.(); // Call onSuccess callback to refresh parent
    } catch (err: any) {
      console.error('Error creating offer:', err);
      alert(`Teklif oluşturulurken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category !== '';
      case 2:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 3:
        return formData.city.trim() !== '' && formData.event_date !== '' && formData.event_time !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Success is handled by parent component via onSuccess callback

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Adım {currentStep} / {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Ne yapmak istersiniz?
              </h2>
              <p className="text-sm text-gray-600">Bir kategori seçin</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value as ActivityOffer['category'] })}
                  className={`p-4 rounded-xl font-semibold transition-all text-sm ${
                    formData.category === cat.value
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-3xl mb-1 block">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Title & Description */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Talebinizi tanımlayın
              </h2>
              <p className="text-sm text-gray-600">Başlık ve açıklama ekleyin</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Başlık
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Örn: Bu akşam kahve içelim"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Açıklama
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Etkinlik hakkında detaylı bilgi..."
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Date & Location */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Nerede ve ne zaman?
              </h2>
              <p className="text-sm text-gray-600">Tarih ve konum bilgileri</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tarih
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="w-full px-3 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Şehir
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Konum alınıyor..."
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all pr-10"
                  disabled={locationLoading}
                />
                {locationLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                )}
              </div>
              {locationError && (
                <p className="text-xs text-red-500 mt-1">{locationError}</p>
              )}
              <button
                type="button"
                onClick={getCurrentCity}
                disabled={locationLoading}
                className="text-xs text-violet-600 hover:text-violet-700 mt-1 disabled:opacity-50 mb-3"
              >
                {locationLoading ? 'Konum alınıyor...' : '📍 Mevcut konumu kullan'}
              </button>
              
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Mekan İsmi
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Lens Avm - Starbucks"
                className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 4: Offer Type & Summary */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Son adım!
              </h2>
              <p className="text-sm text-gray-600">Teklif türü ve özet</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Teklif Türü
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, offer_type: 'birebir', participant_count: 2 })}
                  className={`p-3 rounded-xl font-semibold transition-all text-sm ${
                    formData.offer_type === 'birebir'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  Birebir
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, offer_type: 'grup' })}
                  className={`p-3 rounded-xl font-semibold transition-all text-sm ${
                    formData.offer_type === 'grup'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  Grup
                </button>
              </div>
            </div>

            {formData.offer_type === 'grup' && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Katılımcı: {formData.participant_count} kişi
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={formData.participant_count}
                  onChange={(e) => setFormData({ ...formData, participant_count: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}

            {/* Summary */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border-2 border-violet-200">
              <h3 className="font-bold text-gray-800 mb-2 text-sm">Özet</h3>
              <div className="space-y-1 text-xs">
                <p><strong>Kategori:</strong> {categories.find(c => c.value === formData.category)?.label}</p>
                <p><strong>Başlık:</strong> {formData.title}</p>
                <p><strong>Tarih:</strong> {formData.event_date} {formData.event_time}</p>
                <p><strong>Konum:</strong> {formData.city}{formData.district && ` - ${formData.district}`}</p>
                <p><strong>Tür:</strong> {formData.offer_type === 'birebir' ? 'Birebir' : `Grup (${formData.participant_count} kişi)`}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-4">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            İleri
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Oluşturuluyor...' : (
              <>
                <Check className="w-4 h-4" />
                Yayınla
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
