import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MyOffers from './MyOffers';
import IncomingRequests from './IncomingRequests';
import SentOffers from './SentOffers';
import Chat from './Chat';

export default function Offers() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-offers' | 'requests' | 'sent-offers'>('my-offers');
  const [pendingCount, setPendingCount] = useState(0);
  const [chatUser, setChatUser] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) {
      fetchPendingCount();
    }
  }, [profile?.id]);

  const fetchPendingCount = async () => {
    if (!profile) return;

    try {
      // Get user's offers
      const { data: offers } = await supabase
        .from('activity_offers')
        .select('id')
        .eq('creator_id', profile.id)
        .eq('status', 'active');

      if (!offers || offers.length === 0) {
        setPendingCount(0);
        return;
      }

      const offerIds = offers.map(o => o.id);

      // Count pending requests for these offers
      const { count } = await supabase
        .from('offer_requests')
        .select('*', { count: 'exact', head: true })
        .in('offer_id', offerIds)
        .eq('status', 'pending');

      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  const handleViewRequests = () => {
    setActiveTab('requests');
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Tabs */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-2 grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('my-offers')}
          className={`py-2.5 px-2 rounded-xl font-semibold transition-all text-sm ${
            activeTab === 'my-offers'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Taleplerim
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`relative py-2.5 px-2 rounded-xl font-semibold transition-all text-sm ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Gelen
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent-offers')}
          className={`py-2.5 px-2 rounded-xl font-semibold transition-all text-sm ${
            activeTab === 'sent-offers'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Giden
        </button>
      </div>

      {/* Content */}
      {chatUser ? (
        <Chat matchedUser={chatUser} onBack={() => setChatUser(null)} />
      ) : (
        <>
          {activeTab === 'my-offers' && <MyOffers onViewRequests={handleViewRequests} />}
          {activeTab === 'requests' && <IncomingRequests onRequestHandled={fetchPendingCount} onOpenChat={setChatUser} />}
          {activeTab === 'sent-offers' && <SentOffers />}
        </>
      )}
    </div>
  );
}
