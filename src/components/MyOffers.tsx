import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Trash2, Eye } from 'lucide-react';
import { supabase, ActivityOffer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type OfferWithCount = ActivityOffer & { pendingRequestCount?: number };

type MyOffersProps = {
  onViewRequests?: (offerId: string) => void;
};

export default function MyOffers({ onViewRequests }: MyOffersProps) {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<OfferWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; offerId: string | null }>({
    show: false,
    offerId: null,
  });

  useEffect(() => {
    if (profile) {
      fetchMyOffers();
    }
  }, [profile?.id]); // Only re-fetch when profile ID changes

  const fetchMyOffers = async () => {
    if (!profile) return;

    try {
      // Expire past offers first
      await supabase.rpc('expire_past_offers').catch(() => {});

      const { data, error } = await supabase
        .from('activity_offers')
        .select('*')
        .eq('creator_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get request counts for each offer
      const offersWithCounts = await Promise.all(
        (data || []).map(async (offer) => {
          const { count } = await supabase
            .from('offer_requests')
            .select('*', { count: 'exact', head: true })
            .eq('offer_id', offer.id)
            .eq('status', 'pending');

          return { ...offer, pendingRequestCount: count || 0 };
        })
      );

      setOffers(offersWithCounts);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (offerId: string) => {
    setDeleteConfirm({ show: true, offerId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.offerId) return;

    try {
      const { error } = await supabase
        .from('activity_offers')
        .delete()
        .eq('id', deleteConfirm.offerId);

      if (error) throw error;

      setDeleteConfirm({ show: false, offerId: null });
      fetchMyOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Teklif silinirken bir hata oluştu');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, offerId: null });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { 
        text: 'Aktif', 
        class: 'bg-green-50 text-green-600 border border-green-200', 
        icon: '●',
        iconClass: 'text-green-500 animate-pulse'
      },
      completed: { 
        text: 'Tamamlandı', 
        class: 'bg-blue-50 text-blue-600 border border-blue-200', 
        icon: '✓',
        iconClass: 'text-blue-500'
      },
      cancelled: { 
        text: 'İptal', 
        class: 'bg-gray-50 text-gray-500 border border-gray-200', 
        icon: '×',
        iconClass: 'text-gray-400'
      },
      expired: { 
        text: 'Süresi Doldu', 
        class: 'bg-orange-50 text-orange-600 border border-orange-200', 
        icon: '⏱',
        iconClass: 'text-orange-500'
      },
    };
    const badge = badges[status as keyof typeof badges] || badges.active;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <span className={badge.iconClass}>{badge.icon}</span>
        {badge.text}
      </span>
    );
  };

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

  if (offers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Henüz talep oluşturmadınız
        </h3>
        <p className="text-gray-600">
          "Talep Oluştur" sekmesinden yeni bir talep oluşturun
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <div
          key={offer.id}
          className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${
            offer.status === 'completed' ? 'opacity-60' : ''
          }`}
        >
          <div className="p-6">
            {/* Profile Section - Prominent */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
              {profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-pink-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center border-4 border-pink-200">
                  <span className="text-white text-2xl font-bold">
                    {profile?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {profile?.name}, {profile?.age}
                </h3>
                <p className="text-gray-600">{profile?.city}</p>
                {getStatusBadge(offer.status)}
              </div>
            </div>

            {/* Offer Details */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getCategoryEmoji(offer.category)}</span>
                <h4 className="text-lg font-bold text-gray-800">{offer.title}</h4>
              </div>
              <p className="text-gray-600 text-sm">{offer.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span>{formatDate(offer.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span>{offer.city}{offer.district && `, ${offer.district}`}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-pink-500" />
                <span>
                  {offer.offer_type === 'birebir' ? 'Birebir' : `${offer.participant_count} kişi`}
                </span>
              </div>
              {(offer.pendingRequestCount || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                    {offer.pendingRequestCount} yeni talep
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDeleteClick(offer.id)}
                disabled={offer.status === 'completed'}
                className="flex-1 py-2 px-4 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Sil
              </button>
              <button
                onClick={() => onViewRequests?.(offer.id)}
                disabled={offer.status === 'completed'}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                {offer.status === 'completed' ? 'Tamamlandı' : 'Talepleri Gör'}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Talebi Sil
              </h3>
              <p className="text-gray-600 mb-6">
                Bu talebi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
