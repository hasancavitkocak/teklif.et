import { useEffect, useState } from 'react';
import { Calendar, MapPin, Check, X, MessageCircle, User } from 'lucide-react';
import { supabase, OfferRequest, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProfileView from './ProfileView';

export default function IncomingRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<(OfferRequest & { requester: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) {
      fetchRequests();
    }
  }, [profile?.id]); // Only re-fetch when profile ID changes

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      // Get all offers created by user
      const { data: myOffers } = await supabase
        .from('activity_offers')
        .select('id')
        .eq('creator_id', profile.id);

      if (!myOffers || myOffers.length === 0) {
        setLoading(false);
        return;
      }

      const offerIds = myOffers.map(o => o.id);

      // Get requests for those offers
      const { data, error } = await supabase
        .from('offer_requests')
        .select('*, requester:requester_id(*), offer:offer_id(*)')
        .in('offer_id', offerIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request || !profile) return;

      // Update request status
      const { error } = await supabase
        .from('offer_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      // If accepted, create a match/conversation (only if not already exists)
      if (status === 'accepted') {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('offers')
          .select('*')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${request.requester_id}),and(sender_id.eq.${request.requester_id},receiver_id.eq.${profile.id})`)
          .limit(1);

        if (!existingMatch || existingMatch.length === 0) {
          // Create mutual offers for matching
          await supabase.from('offers').insert([
            {
              sender_id: profile.id,
              receiver_id: request.requester_id,
              status: 'matched',
            },
            {
              sender_id: request.requester_id,
              receiver_id: profile.id,
              status: 'matched',
            },
          ]);
        }

        // Mark the activity offer as completed
        if (request.offer_id) {
          await supabase
            .from('activity_offers')
            .update({ status: 'completed' })
            .eq('id', request.offer_id);
        }
      }

      fetchRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      alert('İşlem sırasında bir hata oluştu');
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
      pending: { text: 'Bekliyor', class: 'bg-yellow-100 text-yellow-700' },
      accepted: { text: 'Kabul Edildi', class: 'bg-green-100 text-green-700' },
      rejected: { text: 'Reddedildi', class: 'bg-red-100 text-red-700' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
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
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Talepler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📬</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Henüz teklif yok
        </h3>
        <p className="text-gray-600">
          Taleplerinize gelen teklifler burada görünecek
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
        >
          <div className="p-6">
            {/* Offer Info */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-800 mb-1">{request.offer?.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {request.offer?.event_date && new Date(request.offer.event_date).toLocaleDateString('tr-TR')}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {request.offer?.city}
                </div>
              </div>
            </div>

            {/* Requester Info */}
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setSelectedProfile(request.requester)}
                title="Profili Görüntüle"
              >
                {request.requester.photo_url ? (
                  <img
                    src={request.requester.photo_url}
                    alt={request.requester.name}
                    className="w-16 h-16 rounded-full object-cover group-hover:ring-4 group-hover:ring-pink-300 transition-all"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center group-hover:ring-4 group-hover:ring-pink-300 transition-all">
                    <span className="text-white text-xl font-bold">
                      {request.requester.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Profile icon overlay on hover */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {request.requester.name}, {request.requester.age}
                    </h3>
                    <p className="text-sm text-gray-500">{request.requester.city}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                {request.suggested_date && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Önerilen Tarih:</strong>{' '}
                    {new Date(request.suggested_date).toLocaleString('tr-TR')}
                  </div>
                )}

                {request.suggested_location && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Önerilen Konum:</strong> {request.suggested_location}
                  </div>
                )}

                <p className="text-xs text-gray-400">{formatDate(request.created_at)}</p>
              </div>
            </div>

            {/* Actions */}
            {request.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleRequest(request.id, 'rejected')}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Reddet
                </button>
                <button
                  onClick={() => handleRequest(request.id, 'accepted')}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Kabul Et
                </button>
              </div>
            )}

            {request.status === 'accepted' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-green-700 font-medium">
                  ✅ Teklif kabul edildi! Artık mesajlaşabilirsiniz.
                </span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Mesaj Gönder
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
