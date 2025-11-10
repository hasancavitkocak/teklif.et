import { ReactNode, useEffect, useState } from 'react';
import { Heart, Search, Gift, Users, Crown, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type LayoutProps = {
  children: ReactNode;
  currentPage: 'discover' | 'offers' | 'matches' | 'premium' | 'profile';
  onNavigate: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile') => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchUnreadCount();
      // Poll every 10 seconds for new messages
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const fetchUnreadCount = async () => {
    if (!profile) return;

    try {
      // Get all matches
      const { data: sentMatches } = await supabase
        .from('offers')
        .select('receiver_id')
        .eq('sender_id', profile.id)
        .eq('status', 'matched');

      const { data: receivedMatches } = await supabase
        .from('offers')
        .select('sender_id')
        .eq('receiver_id', profile.id)
        .eq('status', 'matched');

      const matchedUserIds = [
        ...(sentMatches?.map(m => m.receiver_id) || []),
        ...(receivedMatches?.map(m => m.sender_id) || [])
      ];

      if (matchedUserIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      // Count how many PEOPLE have sent unread messages (not total messages)
      // Get distinct sender_ids who have unread messages
      const { data: unreadSenders } = await supabase
        .from('messages')
        .select('sender_id')
        .in('sender_id', matchedUserIds)
        .eq('receiver_id', profile.id)
        .is('read_at', null);

      // Count unique senders
      const uniqueSenders = new Set(unreadSenders?.map(m => m.sender_id) || []);
      setUnreadCount(uniqueSenders.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-7 h-7 text-pink-500 fill-pink-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Teklif.et
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {profile?.is_premium && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                <Crown className="w-4 h-4" />
                Premium
              </div>
            )}
            <span className="text-gray-700 font-medium hidden sm:inline">{profile?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => onNavigate('discover')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                currentPage === 'discover'
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">Keşfet</span>
            </button>

            <button
              onClick={() => onNavigate('offers')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                currentPage === 'offers'
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Gift className="w-6 h-6" />
              <span className="text-xs font-medium">Talepler</span>
            </button>

            <button
              onClick={() => onNavigate('matches')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                currentPage === 'matches'
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Eşleşmeler</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('premium')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                currentPage === 'premium'
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Crown className="w-6 h-6" />
              <span className="text-xs font-medium">Premium</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                currentPage === 'profile'
                  ? 'text-pink-500'
                  : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profil</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
