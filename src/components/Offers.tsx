import { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateOffer from './CreateOffer';
import MyOffers from './MyOffers';
import IncomingRequests from './IncomingRequests';
import SentOffers from './SentOffers';

export default function Offers() {
  const [activeTab, setActiveTab] = useState<'create' | 'my-offers' | 'requests' | 'sent-offers'>('my-offers');

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Tabs */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Plus className="w-5 h-5" />
          Talep Oluştur
        </button>
        <button
          onClick={() => setActiveTab('my-offers')}
          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'my-offers'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Taleplerim
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Gelen Teklifler
        </button>
        <button
          onClick={() => setActiveTab('sent-offers')}
          className={`py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'sent-offers'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Gönderdiğim Teklifler
        </button>
      </div>

      {/* Content */}
      {activeTab === 'create' && <CreateOffer />}
      {activeTab === 'my-offers' && <MyOffers />}
      {activeTab === 'requests' && <IncomingRequests />}
      {activeTab === 'sent-offers' && <SentOffers />}
    </div>
  );
}
