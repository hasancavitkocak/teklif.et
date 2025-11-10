import { useEffect, useState } from 'react';
import { MapPin, Calendar, Users, Heart, Filter, Zap, Send, CheckCircle, ArrowRight, Plus } from 'lucide-react';
import { supabase, ActivityOffer, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OfferRequestModal from './OfferRequestModal';
import ProfileView from './ProfileView';
import BoostModal from './BoostModal';
import CreateOfferWizard from './CreateOfferWizard';

type Props = {
  onNavigate?: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile') => void;
};

export default function DiscoverOffers({ onNavigate }: Props = {}) {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<(ActivityOffer & { creator: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<ActivityOffer | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [showOfferCreatedPopup, setShowOfferCreatedPopup] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    category: 'all' as string,
    offerType: 'all' as 'all' | 'birebir' | 'grup',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchOffers();
    }
  }, [profile?.id]); // Only re-fetch when profile ID changes

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOffers();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart > 0 && window.scrollY === 0) {
      const distance = e.touches[0].clientY - pullStart;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      handleRefresh();
    }
    setPullStart(0);
    setPullDistance(0);
  };

  const fetchOffers = async () => {
    if (!profile) return;

    try {
      // First, expire past offers
      try {
        await supabase.rpc('expire_past_offers');
      } catch (e) {
        // Ignore errors from expire function
      }

      let query = supabase
        .from('activity_offers')
        .select('*, creator:creator_id(*)')
        .eq('status', 'active')
        .neq('creator_id', profile.id)
        .gte('event_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      // Varsayılan olarak kullanıcının şehrindeki talepleri göster
      // Eğer filtre uygulanmışsa, filtreyi kullan
      const cityFilter = filters.city || profile.city;
      if (cityFilter) {
        query = query.ilike('city', `%${cityFilter}%`);
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters.offerType !== 'all') {
        query = query.eq('offer_type', filters.offerType);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Filter out offers user already requested OR that have been accepted by someone else
      const { data: myRequests } = await supabase
        .from('offer_requests')
        .select('offer_id, status')
        .eq('requester_id', profile.id);

      // Get all accepted offers (by anyone)
      const { data: acceptedRequests } = await supabase
        .from('offer_requests')
        .select('offer_id')
        .eq('status', 'accepted');

      const requestedOfferIds = myRequests?.map(r => r.offer_id) || [];
      const acceptedOfferIds = acceptedRequests?.map(r => r.offer_id) || [];
      
      let filteredOffers = (data || []).filter(
        offer => !requestedOfferIds.includes(offer.id) && !acceptedOfferIds.includes(offer.id)
      );

      // Sort: Boosted profiles first, then by created_at
      filteredOffers.sort((a, b) => {
        // Boosted profiles first
        const aBoost = a.creator.is_boosted && a.creator.boost_expires_at && new Date(a.creator.boost_expires_at) > new Date();
        const bBoost = b.creator.is_boosted && b.creator.boost_expires_at && new Date(b.creator.boost_expires_at) > new Date();
        
        if (aBoost && !bBoost) return -1;
        if (!aBoost && bBoost) return 1;
        
        // Then by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setOffers(filteredOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
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
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Teklifler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-4xl mx-auto pb-24"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 flex justify-center items-center z-50 transition-all"
          style={{ 
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <div className="bg-white rounded-full p-3 shadow-lg">
            <div 
              className={`w-6 h-6 border-3 border-pink-500 border-t-transparent rounded-full ${
                refreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullDistance * 3}deg)`
              }}
            />
          </div>
        </div>
      )}

      {refreshing && (
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Yenileniyor...</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-800">Keşfet</h2>
        </div>
        
        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setShowCreateOffer(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Talep Oluştur
          </button>
          <button
            onClick={() => setShowBoostModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            Boost
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              showFilters
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtrele
          </button>
        </div>
        
        <p className="text-gray-600 text-sm">Yakınınızdaki etkinlik talepleri</p>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Şehir</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Şehir ara..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-400 outline-none"
              >
                <option value="all">Tümü</option>
                <option value="kahve">☕ Kahve</option>
                <option value="yemek">🍽️ Yemek</option>
                <option value="spor">⚽ Spor</option>
                <option value="sinema">🎬 Sinema</option>
                <option value="gezi">🗺️ Gezi</option>
                <option value="konser">🎵 Konser</option>
                <option value="diger">✨ Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tür</label>
              <select
                value={filters.offerType}
                onChange={(e) => setFilters({ ...filters, offerType: e.target.value as any })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pink-400 outline-none"
              >
                <option value="all">Tümü</option>
                <option value="birebir">Birebir</option>
                <option value="grup">Grup</option>
              </select>
            </div>
          </div>
          <button
            onClick={fetchOffers}
            className="mt-4 w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Filtreleri Uygula
          </button>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Henüz talep yok
          </h3>
          <p className="text-gray-600">
            Yakınınızda yeni talepler olduğunda bildireceğiz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              {/* Profile Header - Prominent */}
              <div 
                className="relative h-48 bg-gradient-to-br from-pink-200 to-rose-200 cursor-pointer"
                onClick={() => setSelectedProfile(offer.creator)}
              >
                {offer.creator.photo_url ? (
                  <img
                    src={offer.creator.photo_url}
                    alt={offer.creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-8xl font-bold">
                      {offer.creator.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-bold mb-1">
                        {offer.creator.name}, {offer.creator.age}
                      </h3>
                      <p className="text-white/90 text-sm">{offer.creator.city}</p>
                    </div>
                  </div>
                </div>

                {/* Offer type badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                  {offer.offer_type === 'birebir' ? '👥 Birebir' : '👨‍👩‍👧‍👦 Grup'}
                </div>

                {/* Category badge */}
                <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                  {getCategoryEmoji(offer.category)}
                </div>

                {/* Boost badge - positioned at top right to not overlap profile info */}
                {offer.creator.is_boosted && offer.creator.boost_expires_at && new Date(offer.creator.boost_expires_at) > new Date() && (
                  <div className="absolute top-14 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                    <Zap className="w-3 h-3" />
                    BOOST
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 cursor-pointer" onClick={() => setSelectedOffer(offer)}>
                {/* Offer Title & Description */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {offer.description}
                  </p>
                </div>



                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>{formatDate(offer.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{offer.city}{offer.district && `, ${offer.district}`}</span>
                  </div>
                  {offer.offer_type === 'grup' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-pink-500" />
                      <span>{offer.participant_count} kişi</span>
                    </div>
                  )}
                </div>

                {/* Action button - full width and properly sized */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOffer(offer);
                  }}
                  className="mt-4 w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Teklif Gönder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offer Created Success Popup */}
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
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
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

      {/* Success Popup Modal */}
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
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Gönderilen Tekliflerime Git
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setShowSuccessPopup(false);
                    onNavigate?.('matches');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Eşleşmelerime Git
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

      {/* Offer Request Modal */}
      {selectedOffer && (
        <OfferRequestModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSuccess={() => {
            setSelectedOffer(null);
            setShowSuccessPopup(true);
            fetchOffers();
          }}
        />
      )}

      {/* Create Offer Modal */}
      {showCreateOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-pink-50 via-white to-rose-50 rounded-3xl shadow-2xl max-w-2xl w-full my-8">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-800">Yeni Talep Oluştur</h2>
                <button
                  onClick={() => setShowCreateOffer(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <Plus className="w-6 h-6 text-gray-600 rotate-45" />
                </button>
              </div>
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <CreateOfferWizard 
                  onSuccess={() => {
                    setShowCreateOffer(false);
                    setShowOfferCreatedPopup(true); // Show offer created popup
                    fetchOffers(); // Refresh offers list
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

      {/* Boost Modal */}
      {showBoostModal && (
        <BoostModal
          onClose={() => setShowBoostModal(false)}
          onSuccess={() => {
            fetchOffers(); // Refresh to show boosted profiles
          }}
        />
      )}
    </div>
  );
}
