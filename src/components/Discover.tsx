import { useEffect, useState } from 'react';
import { MapPin, Heart, X, Sparkles, Filter, Settings } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Discover() {
  const { profile: currentProfile, refreshProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 50,
    gender: 'all' as 'all' | 'erkek' | 'kadın',
    maxDistance: 100
  });

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    fetchProfiles();
  }, [currentProfile, filters]);

  const fetchProfiles = async () => {
    if (!currentProfile) {
      setLoading(false);
      return;
    }

    try {
      // Get sent/rejected offers to exclude them
      const { data: sentOffers } = await supabase
        .from('offers')
        .select('receiver_id')
        .eq('sender_id', currentProfile.id);

      const excludeIds = sentOffers?.map(o => o.receiver_id) || [];

      // Get profiles excluding already interacted ones
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentProfile.id)
        .gte('age', filters.minAge)
        .lte('age', filters.maxAge);

      if (filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Filter by distance if user has coordinates
      let filteredData = data || [];
      
      if (currentProfile.latitude && currentProfile.longitude) {
        filteredData = filteredData.filter(profile => {
          if (!profile.latitude || !profile.longitude) return true;
          const distance = calculateDistance(
            currentProfile.latitude!,
            currentProfile.longitude!,
            profile.latitude,
            profile.longitude
          );
          return distance <= filters.maxDistance;
        });

        // Add distance to profiles
        filteredData = filteredData.map(profile => ({
          ...profile,
          distance: profile.latitude && profile.longitude 
            ? calculateDistance(
                currentProfile.latitude!,
                currentProfile.longitude!,
                profile.latitude,
                profile.longitude
              )
            : null
        }));

        // Sort by distance
        filteredData.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      setProfiles(filteredData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    if (!currentProfile) return false;
    if (currentProfile.is_premium) return true;

    const lastReset = new Date(currentProfile.last_offer_reset);
    const now = new Date();
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      await supabase
        .from('profiles')
        .update({
          daily_offers_count: 0,
          last_offer_reset: now.toISOString(),
        })
        .eq('id', currentProfile.id);
      await refreshProfile();
      return true;
    }

    if (currentProfile.daily_offers_count >= 3) {
      setMessage('Günlük 3 teklif hakkınızı kullandınız. Sınırsız teklif için Premium üye olun!');
      return false;
    }

    return true;
  };

  const sendOffer = async () => {
    if (!currentProfile || currentIndex >= profiles.length) return;

    const canSend = await checkDailyLimit();
    if (!canSend) return;

    const targetProfile = profiles[currentIndex];
    setSending(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('offers')
        .insert({
          sender_id: currentProfile.id,
          receiver_id: targetProfile.id,
          status: 'pending',
        });

      if (error) throw error;

      if (!currentProfile.is_premium) {
        await supabase
          .from('profiles')
          .update({
            daily_offers_count: currentProfile.daily_offers_count + 1,
          })
          .eq('id', currentProfile.id);
        await refreshProfile();
      }

      setMessage('Teklif gönderildi!');
      setTimeout(() => {
        setMessage('');
        setCurrentIndex(currentIndex + 1);
      }, 1000);
    } catch (error) {
      console.error('Error sending offer:', error);
      setMessage('Bir hata oluştu, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  const skipProfile = async () => {
    if (!currentProfile || currentIndex >= profiles.length) return;

    const targetProfile = profiles[currentIndex];
    
    try {
      const { error } = await supabase
        .from('offers')
        .insert({
          sender_id: currentProfile.id,
          receiver_id: targetProfile.id,
          status: 'rejected',
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Error skipping profile:', error);
      }
    } catch (error) {
      console.error('Skip error:', error);
    }

    setMessage('');
    setCurrentIndex(currentIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Profiller yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Şimdilik bu kadar!
          </h3>
          <p className="text-gray-600 mb-4">
            Yakınınızda yeni profiller olduğunda bildireceğiz.
          </p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              fetchProfiles();
            }}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            Yenile
          </button>
        </div>
      </div>
    );
  }

  const currentCard = profiles[currentIndex];

  return (
    <div className="max-w-md mx-auto pb-24">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Keşfet</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                showFilters
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-300 hover:bg-pink-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
            </button>
            {!currentProfile?.is_premium && (
              <div className="text-sm text-gray-600">
                Kalan: <span className="font-semibold text-pink-500">
                  {3 - (currentProfile?.daily_offers_count || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-600">Sizin için seçilen profiller</p>
        
        {/* Hızlı Filtre Butonları */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setFilters({...filters, maxDistance: 10});
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.maxDistance === 10
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            📍 Yakınlarımda (10km)
          </button>
          <button
            onClick={() => {
              setFilters({...filters, maxDistance: 50});
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.maxDistance === 50
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            🚗 Şehrimde (50km)
          </button>
          <button
            onClick={() => {
              setFilters({...filters, maxDistance: 100});
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.maxDistance === 100
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            🌍 Tüm Bölge (100km)
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Arama Filtreleri</h3>
              <p className="text-sm text-gray-500">Tercihlerinize göre profilleri filtreleyin</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Yaş Aralığı
                </label>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">Min: {filters.minAge}</span>
                    <span className="text-sm font-medium text-gray-600">Max: {filters.maxAge}</span>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={filters.minAge}
                      onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={filters.maxAge}
                      onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Cinsiyet</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'erkek', 'kadın'].map((gender) => (
                    <button
                      key={gender}
                      onClick={() => setFilters({...filters, gender: gender as any})}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        filters.gender === gender
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {gender === 'all' ? 'Hepsi' : gender === 'erkek' ? 'Erkek' : 'Kadın'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Maksimum Mesafe: {filters.maxDistance} km
                </label>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>5 km</span>
                    <span>Yakın</span>
                    <span>Orta</span>
                    <span>Uzak</span>
                    <span>500 km</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFilters({
                      minAge: 18,
                      maxAge: 50,
                      gender: 'all',
                      maxDistance: 100
                    });
                  }}
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Sıfırla
                </button>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    fetchProfiles();
                    setShowFilters(false);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-4 rounded-xl ${
          message.includes('hakkınızı')
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-pink-200 to-rose-200">
          {currentCard.photo_url ? (
            <img
              src={currentCard.photo_url}
              alt={currentCard.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-6xl font-bold">
                {currentCard.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <h3 className="text-3xl font-bold mb-1">
              {currentCard.name}, {currentCard.age}
            </h3>
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-4 h-4" />
              {currentCard.city}
              {currentCard.distance && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {Math.round(currentCard.distance)} km
                </span>
              )}
            </div>
          </div>
        </div>

        {currentCard.bio && (
          <div className="p-6">
            <p className="text-gray-700 leading-relaxed">{currentCard.bio}</p>
          </div>
        )}

        <div className="p-6 flex gap-4">
          <button
            onClick={skipProfile}
            disabled={sending}
            className="flex-1 py-4 border-2 border-gray-200 rounded-full font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-6 h-6" />
            Geç
          </button>
          <button
            onClick={sendOffer}
            disabled={sending}
            className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Heart className="w-6 h-6 fill-white" />
            {sending ? 'Gönderiliyor...' : 'Teklif Et'}
          </button>
        </div>
      </div>
    </div>
  );
}