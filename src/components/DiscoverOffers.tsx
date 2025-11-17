import { useEffect, useState, useRef } from 'react';
import { MapPin, Calendar, Users, Heart, Zap, CheckCircle, ArrowRight, Plus, X, RotateCcw } from 'lucide-react';
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

  // Swipe functionality
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [lastMoveTime, setLastMoveTime] = useState(0);

  useEffect(() => {
    if (profile) {
      if (!hasLocationPermission) {
        setShowLocationModal(true);
      } else {
        fetchNextOffer();
      }
    }
  }, [profile?.id, hasLocationPermission]);

  // Real-time subscription for profile updates
  useEffect(() => {
    if (!profile) return;

    // Profiles tablosundaki değişiklikleri dinle
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          console.log('👤 Profile updated:', payload);
          // Eğer mevcut teklifteki creator güncellendiyse, teklifi yenile
          if (currentOffer && payload.new.id === currentOffer.creator_id) {
            console.log('🔄 Refreshing current offer due to creator profile update');
            fetchNextOffer();
          }
        }
      )
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [profile?.id, currentOffer?.creator_id]);

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

  const handleLike = () => {
    if (currentOffer) {
      setSelectedOffer(currentOffer);
    }
  };

  // Swipe handlers - Optimized for performance
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!currentOffer) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !currentOffer) return;
    e.preventDefault();

    // Throttle move events for better performance
    const now = Date.now();
    if (now - lastMoveTime < 16) return; // ~60fps
    setLastMoveTime(now);

    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;

    // Sadece yatay hareketi izin ver, dikey hareketi sınırla
    const constrainedDeltaX = Math.max(-200, Math.min(200, deltaX));
    const constrainedDeltaY = Math.max(-30, Math.min(30, deltaY));

    setDragOffset({ x: constrainedDeltaX, y: constrainedDeltaY });

    // Swipe direction - daha hassas threshold
    if (Math.abs(constrainedDeltaX) > 40) {
      const newDirection = constrainedDeltaX > 0 ? 'right' : 'left';
      if (swipeDirection !== newDirection) {
        setSwipeDirection(newDirection);
      }
    } else if (swipeDirection !== null) {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !currentOffer) return;
    e.preventDefault();

    const threshold = 80; // Daha düşük threshold
    const velocity = Math.abs(dragOffset.x);

    if (velocity > threshold) {
      if (dragOffset.x > 0) {
        // Swipe right - Like
        handleLike();
      } else {
        // Swipe left - Skip
        handleSkip();
      }
    }

    resetDrag();
  };

  const resetDrag = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setSwipeDirection(null);
  };

  const fetchNextOffer = async () => {
    if (!profile) return;

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
            photo_url, photos, is_boosted, boost_expires_at
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

      console.log('📋 Fetched offer:', data);
      if (data?.creator) {
        console.log('👤 Creator info:', {
          id: data.creator.id,
          name: data.creator.name,
          photo_url: data.creator.photo_url,
          photos: data.creator.photos,
          hasPhoto: !!data.creator.photo_url,
          hasPhotos: !!(data.creator.photos && data.creator.photos.length > 0)
        });
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
    <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col overflow-hidden">
      {refreshing && (
        <div className="fixed top-20 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Yenileniyor...</span>
          </div>
        </div>
      )}



      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-24 overflow-hidden">
        {!currentOffer ? (
          <div className="text-center">
            <Heart className="w-20 h-20 text-violet-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Henüz talep yok
            </h3>
            <p className="text-gray-600 mb-6">
              Yakınınızda yeni talepler olduğunda bildireceğiz
            </p>
            <button
              onClick={handleRefresh}
              className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Yenile
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-md mx-auto">
            {/* Top Action Buttons */}
            <div className="flex items-center justify-end gap-2 mb-2">
              <button
                onClick={() => setShowCreateOffer(true)}
                className="p-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowBoostModal(true)}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>

            {/* Swipeable Card */}
            <div
              ref={cardRef}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden touch-pan-y"
              style={{
                maxHeight: '75vh',
                transform: isDragging
                  ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.5}px, 0) rotate(${dragOffset.x * 0.05}deg)`
                  : 'translate3d(0, 0, 0) rotate(0deg)',
                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isDragging ? Math.max(0.8, 1 - Math.abs(dragOffset.x) / 250) : 1,
                willChange: isDragging ? 'transform, opacity' : 'auto'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Swipe Indicators - Optimized */}
              {swipeDirection && (
                <div
                  className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-150 ${swipeDirection === 'left' ? 'bg-red-500/15' : 'bg-violet-500/15'
                    }`}
                >
                  <div
                    className={`px-4 py-2 rounded-full font-bold text-lg transform transition-transform duration-150 ${swipeDirection === 'left'
                      ? 'bg-red-500 text-white rotate-12'
                      : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white -rotate-12'
                      }`}
                  >
                    {swipeDirection === 'left' ? 'GEÇ' : 'TEKLİF GÖNDER'}
                  </div>
                </div>
              )}

              {/* Profile Image */}
              <div
                className="relative h-3/5 bg-gradient-to-br from-violet-200 to-purple-200"
                onClick={() => setSelectedProfile(currentOffer.creator)}
              >
                {(() => {
                  // Profil resmini al: önce photo_url, sonra photos array'inden ilki
                  const profileImage = currentOffer.creator.photo_url ||
                    (currentOffer.creator.photos && currentOffer.creator.photos.length > 0
                      ? currentOffer.creator.photos[0]
                      : null);

                  console.log('🖼️ Profile image to display:', profileImage);

                  return profileImage ? (
                    <img
                      src={profileImage}
                      alt={currentOffer.creator.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                      onLoad={() => console.log('✅ Profile image loaded:', profileImage)}
                      onError={() => console.log('❌ Profile image failed to load:', profileImage)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-500">
                      <div className="text-white text-8xl font-bold">
                        {currentOffer.creator.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  );
                })()}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Profile info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white text-2xl font-bold mb-1">
                    {currentOffer.creator.name}, {currentOffer.creator.age}
                  </h3>
                  <p className="text-white/90 text-base">{currentOffer.creator.city}</p>
                </div>

                {/* Badges */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700">
                  {currentOffer.offer_type === 'birebir' ? '👥 Birebir' : '👨‍👩‍👧‍👦 Grup'}
                </div>

                <div className="absolute top-4 left-4 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl">
                  {getCategoryEmoji(currentOffer.category)}
                </div>

                {/* Boost badge */}
                {currentOffer.creator.is_boosted && currentOffer.creator.boost_expires_at && new Date(currentOffer.creator.boost_expires_at) > new Date() && (
                  <div className="absolute top-20 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full text-sm font-bold flex items-center gap-1 shadow-lg animate-pulse">
                    <Zap className="w-4 h-4" />
                    BOOST
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-shrink-0 p-4 flex flex-col bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {currentOffer.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {currentOffer.description}
                </p>

                {/* Details */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    <span>{formatDate(currentOffer.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-violet-500" />
                    <span>{currentOffer.city}{currentOffer.district && `, ${currentOffer.district}`}</span>
                  </div>
                  {currentOffer.offer_type === 'grup' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-violet-500" />
                      <span>{currentOffer.participant_count} kişi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed above navigation */}
            <div className="fixed bottom-[136px] left-0 right-0 flex items-center justify-center gap-3 px-4 z-10 max-w-md mx-auto">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-2 bg-white border-2 border-red-500 text-red-500 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1 hover:scale-105 font-semibold min-h-[48px] text-sm whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                Geç
              </button>

              <button
                onClick={handleLike}
                className="flex-1 py-3 px-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1 hover:scale-105 font-semibold min-h-[48px] text-sm whitespace-nowrap"
              >
                <Heart className="w-4 h-4 fill-current" />
                Teklif Gönder
              </button>
            </div>
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Yeni Talep Oluştur</h2>
              <button
                onClick={() => setShowCreateOffer(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
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