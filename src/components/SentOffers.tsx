import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { supabase, OfferRequest, ActivityOffer, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileView from './ProfileView';

type SentOfferWithDetails = OfferRequest & {
  offer: ActivityOffer & { creator: Profile };
};

export default function SentOffers() {
  const { profile } = useAuth();
  const [sentOffers, setSentOffers] = useState<SentOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) {
      fetchSentOffers();
    }
  }, [profile?.id]);

  const fetchSentOffers = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('offer_requests')
        .select('*, offer:offer_id(*, creator:creator_id(*))')
        .eq('requester_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSentOffers(data || []);
    } catch (error) {
      console.error('Error fetching sent offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    return date.toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Bekliyor', class: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
      accepted: { text: 'Kabul Edildi', class: 'bg-green-100 text-green-700', icon: '✅' },
      rejected: { text: 'Reddedildi', class: 'bg-red-100 text-red-700', icon: '❌' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class} flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.text}
      </span>
    );
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

  if (sentOffers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📤</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Henüz teklif göndermediniz
        </h3>
        <p className="text-gray-600">
          "Keşfet" sekmesinden taleplere teklif gönderin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sentOffers.map((request) => (
        <div
          key={request.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
        >
          <div className="p-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              {getStatusBadge(request.status)}
              <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
            </div>

            {/* Offer Info */}
            <div className="mb-4">
              <h4 className="font-bold text-gray-800 text-lg mb-2">{request.offer?.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{request.offer?.description}</p>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  {request.offer?.event_date && new Date(request.offer.event_date).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  {request.offer?.city}
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div 
              className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-6 px-6 py-2 rounded-lg transition-colors group"
              onClick={() => request.offer?.creator && setSelectedProfile(request.offer.creator)}
              title="Profili Görüntüle"
            >
              <div className="relative">
                {request.offer?.creator?.photo_url ? (
                  <img
                    src={request.offer.creator.photo_url}
                    alt={request.offer.creator.name}
                    className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-violet-300 transition-all"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center group-hover:ring-2 group-hover:ring-violet-300 transition-all">
                    <span className="text-white font-bold">
                      {request.offer?.creator?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  {request.offer?.creator?.name}, {request.offer?.creator?.age}
                  <User className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-xs text-gray-500">{request.offer?.creator?.city}</p>
              </div>
            </div>

            {/* Your Message */}
            {request.message && (
              <div className="bg-violet-50 rounded-lg p-3 mb-3 border border-violet-100">
                <p className="text-xs text-violet-600 font-semibold mb-1">Gönderdiğiniz Mesaj:</p>
                <p className="text-sm text-gray-700">{request.message}</p>
              </div>
            )}

            {/* Your Suggestions */}
            {(request.suggested_date || request.suggested_location) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-semibold mb-2">Önerileriniz:</p>
                {request.suggested_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {new Date(request.suggested_date).toLocaleString('tr-TR')}
                  </div>
                )}
                {request.suggested_location && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {request.suggested_location}
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            {request.status === 'accepted' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-medium">
                  🎉 Teklifiniz kabul edildi! "Eşleşmeler" sekmesinden mesajlaşabilirsiniz.
                </p>
              </div>
            )}
            {request.status === 'rejected' && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700 font-medium">
                  Teklifiniz reddedildi. Başka taleplere teklif gönderebilirsiniz.
                </p>
              </div>
            )}
            {request.status === 'pending' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-700 font-medium">
                  ⏳ Teklifiniz değerlendiriliyor. Yanıt bekleniyor...
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
