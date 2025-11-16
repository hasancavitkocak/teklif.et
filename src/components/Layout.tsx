import { ReactNode, useEffect, useState } from 'react';
import { Heart, Search, Gift, Users, Crown, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Page = 'discover' | 'offers' | 'matches' | 'premium' | 'profile' | 'faq' | 'help' | 'report' | 'privacy' | 'terms' | 'kvkk' | 'cookies';

type LayoutProps = {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isLegalPage = ['faq', 'help', 'report', 'privacy', 'terms', 'kvkk', 'cookies'].includes(currentPage);

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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {isLegalPage ? (
        // Legal pages header with back button
        <header 
          className="fixed-header bg-white border-b border-gray-100 shadow-sm"
          style={{
            paddingTop: 'max(16px, env(safe-area-inset-top))'
          }}
        >
          <div className="w-full px-4 pb-4">
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Geri Dön</span>
            </button>
          </div>
        </header>
      ) : (
        // Normal header - White background with colored text - FIXED for mobile
        <header 
          className="fixed-header bg-white border-b border-gray-100 shadow-sm"
          style={{
            paddingTop: 'max(16px, env(safe-area-inset-top))',
            paddingBottom: '16px'
          }}
        >
          <div className="w-full mx-auto px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-violet-500 fill-violet-500" />
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                Teklif.et
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {profile?.is_premium && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                  <Crown className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Premium</span>
                </div>
              )}
              <span className="text-gray-700 font-medium text-sm md:text-base hidden sm:inline truncate max-w-[120px]">{profile?.name}</span>
            </div>
          </div>
        </header>
      )}

      <main className="content-with-fixed-bars w-full mx-auto px-4 py-6">
        {children}
      </main>

      {!isLegalPage && (
        <nav 
          className="fixed-footer bg-white shadow-lg" 
          style={{ 
            borderTop: '1px solid #eaeaea',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            paddingTop: '12px'
          }}
        >
          <div className="w-full px-2 md:px-4">
            <div className="flex items-center justify-around pb-3">
              <button
                onClick={() => onNavigate('discover')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  currentPage === 'discover'
                    ? 'text-violet-500'
                    : 'text-gray-500 hover:text-violet-400'
                }`}
              >
                <Search className="w-6 h-6" />
                <span className="text-xs font-medium">Keşfet</span>
              </button>

              <button
                onClick={() => onNavigate('offers')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                  currentPage === 'offers'
                    ? 'text-violet-500'
                    : 'text-gray-500 hover:text-violet-400'
                }`}
              >
                <Gift className="w-6 h-6" />
                <span className="text-xs font-medium">Talepler</span>
              </button>

              <button
                onClick={() => onNavigate('matches')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors relative ${
                  currentPage === 'matches'
                    ? 'text-violet-500'
                    : 'text-gray-500 hover:text-violet-400'
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
                    ? 'text-violet-500'
                    : 'text-gray-500 hover:text-violet-400'
                }`}
              >
                <Crown className="w-6 h-6" />
                <span className="text-xs font-medium">Premium</span>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  currentPage === 'profile'
                    ? 'text-violet-500'
                    : 'text-gray-500 hover:text-violet-400'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">Profil</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
