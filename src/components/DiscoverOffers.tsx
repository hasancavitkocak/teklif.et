import { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, Heart, Zap, Send, CheckCircle, ArrowRight, Plus, X } from 'lucide-react';
import { supabase, ActivityOffer, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import OfferRequestModal from './OfferRequestModal';
import ProfileView from './ProfileView';
import BoostModal from './BoostModal';
import CreateOfferWizard from './CreateOfferWizard';

type Props = {
  onNavigate?: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile') => void;
};

export default function DiscoverOffers({ onNavigate }: Props = {}) {
  const { profile } = useAuth();
  const { hasLocationPermission, setShowLocationModal } = useLocation();
  const [currentOffer, setCurrentOffer] = useState<(ActivityOffer & { creator: Profile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<ActivityOffer | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showOfferCreatedPopup, setShowOfferCreatedPopup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [skippedOfferIds, setSkippedOfferIds] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      if (!hasLocationPermission) {
        setShowLocationModal(true);
      } else {
        fetchNextOffer();
      }
    }
  }, [profile?.id, hasLocationPermission]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setSkippedOfferIds([]);
    await fetchNextOffer();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSkip = () => {
    if (currentOffer) {
      setSkippedOfferIds(prev => [...prev, currentOffer.id]);
      fetchNextOffer();
    }
  };

  const fetchNextOffer = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Expire past offers
      try {
        await supabase.rpc('expire_past_offers');
      } catch (e) {
        // Ignore errors
      }

      // Get user's requests and accepted offers
      const [myRequestsResult, acceptedRequestsResult] = await Promise.all([
        supabase
          .from('offer_requests')
          .select('offer_id, status')
          .eq('requester_id', profile.id),
        supabase
          .from('offer_requests')
          .select('offer_id')
          .eq('status', 'accepted')
      ]);

      const requestedOfferIds = myRequestsResult.data?.map(r => r.offer_id) || [];
      const acceptedOfferIds = acceptedRequestsResult.data?.map(r => r.offer_id) || [];
      const excludedIds = [...requestedOfferIds, ...acceptedOfferIds, ...skippedOfferIds];

      // Fetch single offer with optimized query
      const query = supabase
        .from('activity_offers')
        .select(`
          *,
          creator:creator_id(
            id, name, age, city, 
            photo_url, is_boosted, boost_expires_at
          )
        `)
        .eq('status', 'active')
        .neq('creator_id', profile.id)
        .gte('event_date', new Date().toISOString());

      if (excludedIds.length > 0) {
        query.not('id', 'in', `(${excludedIds.join(',')})`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setCurrentOffer(data || null);
    } catch (error) {
      console.error('Error fetching offer:', error);
      setCurrentOffer(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Bugün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Yarın ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getCategoryEmoji = (category?: string) => {
    const emojis: Record<string, string> = {
      kahve: '☕',
      yemek: '🍽️',
      spor: '⚽',
      sinema: '🎬',
      gezi: '🗺️',
      konser: '🎵',
      diger: '✨',
    };
    return emojis[category || 'diger'] || '✨';
  };

  // Show profile view if selected
  if (selectedProfile) {
    return (
      <ProfileView
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        showMessageButton={false}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Teklifler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Location permission check
  if (!hasLocationPermission) {
    return (
      <div className="max-w-md mx-auto pb-24 px-4">
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Konum İzni Gerekli</h3>
          <p className="text-gray-600 mb-6">
            Yakınındaki etkinlikleri gösterebilmemiz için konum iznine ihtiyacımız var.
          </p>
          <button
            onClick={() => setShowLocationModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Konum İzni Ver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24 px-4">
      {refreshing && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Yenileniyor...</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Keşfet</h2>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowCreateOffer(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Talep Oluştur
          </button>
          <button
            onClick={() => setShowBoostModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Zap className="w-4 h-4" />
            Boost
          </button>
        </div>
        
        <p className="text-gray-600 text-sm">Yakınınızdaki etkinlik talepleri</p>
      </div>

      {!currentOffer ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Henüz talep yok
          </h3>
          <p className="text-gray-600 mb-4">
            Yakınınızda yeni talepler olduğunda bildireceğiz
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-all"
          >
            Yenile
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Single Offer Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div 
              className="relative h-64 bg-gradient-to-br from-violet-200 to-purple-200 cursor-pointer"
              onClick={() => setSelectedProfile(currentOffer.creator)}
            >
              {currentOffer.creator.photo_url ? (
                <img
                  src={currentOffer.creator.photo_url}
                  alt={currentOffer.creator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-8xl font-bold">
                    {currentOffer.creator.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Profile info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-2xl font-bold mb-1">
                  {currentOffer.creator.name}, {currentOffer.creator.age}
                </h3>
                <p className="text-white/90">{currentOffer.creator.city}</p>
              </div>

              {/* Badges */}
              <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                {currentOffer.offer_type === 'birebir' ? '👥 Birebir' : '👨‍👩‍👧‍👦 Grup'}
              </div>

              <div className="absolute top-3 left-3 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl">
                {getCategoryEmoji(currentOffer.category)}
              </div>

              {/* Boost badge */}
              {currentOffer.creator.is_boosted && currentOffer.creator.boost_expires_at && new Date(currentOffer.creator.boost_expires_at) > new Date() && (
                <div className="absolute top-16 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                  <Zap className="w-3 h-3" />
                  BOOST
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {currentOffer.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {currentOffer.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <span>{formatDate(currentOffer.event_date)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-violet-500" />
                  <span>{currentOffer.city}{currentOffer.district && `, ${currentOffer.district}`}</span>
                </div>
                {currentOffer.offer_type === 'grup' && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="w-5 h-5 text-violet-500" />
                    <span>{currentOffer.participant_count} kişi</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all"
                >
                  Geç
                </button>
                <button
                  onClick={() => setSelectedOffer(currentOffer)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Teklif Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedOffer && (
        <OfferRequestModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSuccess={() => {
            setSelectedOffer(null);
            setShowSuccessPopup(true);
            fetchNextOffer();
          }}
        />
      )}

      {showCreateOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-3xl shadow-2xl max-w-2xl w-full my-8">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-800">Yeni Talep Oluştur</h2>
                <button
                  onClick={() => setShowCreateOffer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <CreateOfferWizard 
                  onSuccess={() => {
                    setShowCreateOffer(false);
                    setShowOfferCreatedPopup(true);
                    fetchNextOffer();
                  }}
                  onNavigate={(page) => {
                    setShowCreateOffer(false);
                    onNavigate?.(page);
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showBoostModal && (
        <BoostModal
          onClose={() => setShowBoostModal(false)}
          onSuccess={() => {
            fetchNextOffer();
          }}
        />
      )}

      {/* Success Popups */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Teklif Başarıyla Gönderildi! 🎉
              </h3>
              <p className="text-gray-600 mb-8">
                Teklifiniz karşı tarafa iletildi. Yanıt geldiğinde sizi bilgilendireceğiz.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    onNavigate?.('offers');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Gönderilen Tekliflerime Git
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Keşfetmeye Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOfferCreatedPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Talep Oluşturuldu! 🎉
              </h3>
              <p className="text-gray-600 mb-8">
                Talebiniz artık "Keşfet" sayfasında görünüyor. Diğer kullanıcılar size teklif gönderebilir.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowOfferCreatedPopup(false);
                    onNavigate?.('offers');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Taleplerime Git
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowOfferCreatedPopup(false)}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Keşfetmeye Devam Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}