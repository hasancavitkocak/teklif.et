import { useEffect, useState } from 'react';
import { Heart, MessageCircle, MapPin, Trash2, Ban, User } from 'lucide-react';
import { supabase, Offer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Chat from './Chat';
import ProfileView from './ProfileView';

type MatchWithDetails = Offer & {
  matchedUser: any;
  lastMessage?: any;
  unreadCount?: number;
};

export default function Matches() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [profile]);

  const fetchMatches = async () => {
    if (!profile) return;

    try {
      // Get matches where user is either sender or receiver
      const { data: sentMatches, error: sentError } = await supabase
        .from('offers')
        .select('*, receiver:receiver_id(id, name, age, city, photo_url, bio, gender)')
        .eq('sender_id', profile.id)
        .eq('status', 'matched')
        .order('created_at', { ascending: false });

      const { data: receivedMatches, error: receivedError } = await supabase
        .from('offers')
        .select('*, sender:sender_id(id, name, age, city, photo_url, bio, gender)')
        .eq('receiver_id', profile.id)
        .eq('status', 'matched')
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;
      if (receivedError) throw receivedError;

      // Combine and format matches
      const allMatches = [
        ...(sentMatches || []).map(match => ({
          ...match,
          matchedUser: match.receiver,
          type: 'sent' as const
        })),
        ...(receivedMatches || []).map(match => ({
          ...match,
          matchedUser: match.sender,
          type: 'received' as const
        }))
      ];

      // Get last message and unread count for each match
      for (const match of allMatches) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${match.matchedUser.id}),and(sender_id.eq.${match.matchedUser.id},receiver_id.eq.${profile.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        match.lastMessage = lastMessage;

        // Count unread messages (messages from other user that haven't been read)
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', match.matchedUser.id)
          .eq('receiver_id', profile.id)
          .is('read_at', null);

        match.unreadCount = unreadCount || 0;
      }

      // Sort by last message time or match time
      allMatches.sort((a, b) => {
        const aTime = a.lastMessage?.created_at || a.created_at;
        const bTime = b.lastMessage?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setMatches(allMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
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

  const unmatchUser = async (matchId: string) => {
    if (!profile) return;

    try {
      // Delete the match
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', matchId);

      if (error) throw error;

      // Refresh matches
      setShowDeleteModal(null);
      fetchMatches();
    } catch (error) {
      console.error('Error unmatching:', error);
      alert('Eşleşme kaldırılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Eşleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Henüz eşleşmeniz yok
          </h3>
          <p className="text-gray-600 mb-4">
            Keşfet sayfasından teklif gönderin veya size gelen teklifleri kabul edin!
          </p>
        </div>
      </div>
    );
  }

  // Show profile view if user selected to view profile
  if (selectedProfile) {
    return (
      <ProfileView
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onMessage={() => {
          // Direkt chat'i aç - zaten eşleşme var çünkü Matches sayfasındayız
          setSelectedProfile(null);
          setSelectedChat(selectedProfile);
        }}
        showMessageButton={true}
      />
    );
  }

  // Show chat if user selected someone to chat with
  if (selectedChat) {
    return (
      <Chat 
        matchedUser={selectedChat} 
        onBack={() => {
          setSelectedChat(null);
          fetchMatches(); // Refresh to update unread counts
        }} 
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Eşleşmeler</h2>
        <p className="text-gray-600">{matches.length} eşleşmeniz var</p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedProfile(match.matchedUser)}
                  title="Profili Görüntüle"
                >
                  {match.matchedUser.photo_url ? (
                    <img
                      src={match.matchedUser.photo_url}
                      alt={match.matchedUser.name}
                      className="w-16 h-16 rounded-full object-cover group-hover:ring-4 group-hover:ring-pink-300 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center group-hover:ring-4 group-hover:ring-pink-300 transition-all">
                      <span className="text-white text-xl font-bold">
                        {match.matchedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                  {/* Profile icon overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 cursor-pointer" onClick={() => setSelectedChat(match.matchedUser)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {match.matchedUser.name}, {match.matchedUser.age}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {match.lastMessage ? formatDate(match.lastMessage.created_at) : formatDate(match.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.matchedUser.city}
                    </div>
                    <div className="capitalize">
                      {match.matchedUser.gender}
                    </div>
                  </div>

                  {match.lastMessage ? (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {match.lastMessage.sender_id === profile?.id ? 'Sen: ' : ''}
                        {match.lastMessage.content}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-pink-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-pink-700">
                        🎉 Yeni eşleşme! İlk mesajı gönderin
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Mesajlaşmak için tıklayın
                    </span>
                    <div className="flex items-center gap-2">
                      {(match.unreadCount || 0) > 0 && (
                        <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                          {match.unreadCount}
                        </span>
                      )}
                      <MessageCircle className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(match.id);
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eşleşmeyi Kaldır"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Eşleşmeyi Kaldır
              </h3>
              <p className="text-gray-600 mb-6">
                Bu eşleşmeyi kaldırmak istediğinizden emin misiniz? Tüm mesaj geçmişi silinecek ve bu işlem geri alınamaz.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => unmatchUser(showDeleteModal)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}