import { useState } from 'react';
import { Calendar, MapPin, Users, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase, ActivityOffer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { value: 'kahve', label: 'Kahve ☕', emoji: '☕' },
  { value: 'yemek', label: 'Yemek 🍽️', emoji: '🍽️' },
  { value: 'spor', label: 'Spor ⚽', emoji: '⚽' },
  { value: 'sinema', label: 'Sinema 🎬', emoji: '🎬' },
  { value: 'gezi', label: 'Gezi 🗺️', emoji: '🗺️' },
  { value: 'konser', label: 'Konser 🎵', emoji: '🎵' },
  { value: 'diger', label: 'Diğer ✨', emoji: '✨' },
];

type Props = {
  onNavigate: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile') => void;
};

export default function CreateOffer({ onNavigate }: Props) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: profile?.city || '',
    district: '',
    event_date: '',
    event_time: '',
    participant_count: 2,
    offer_type: 'birebir' as 'birebir' | 'grup',
    category: 'kahve' as ActivityOffer['category'],
    image_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.event_date}T${formData.event_time}`);
      
      const { error: insertError } = await supabase
        .from('activity_offers')
        .insert({
          creator_id: profile.id,
          title: formData.title,
          description: formData.description,
          city: formData.city,
          district: formData.district || null,
          event_date: eventDateTime.toISOString(),
          participant_count: formData.participant_count,
          offer_type: formData.offer_type,
          category: formData.category,
          image_url: formData.image_url || null,
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Reset form immediately
      setFormData({
        title: '',
        description: '',
        city: profile.city || '',
        district: '',
        event_date: '',
        event_time: '',
        participant_count: 2,
        offer_type: 'birebir',
        category: 'kahve',
        image_url: '',
      });

      setSuccess(true);
    } catch (err: any) {
      console.error('Error creating offer:', err);
      setError(err.message || 'Teklif oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Success Popup Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Talep Başarıyla Oluşturuldu! 🎉
              </h3>
              <p className="text-gray-600 mb-8">
                Talebiniz artık "Keşfet" sayfasında görünüyor ve diğer kullanıcılar size teklif gönderebilir.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    onNavigate('discover');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Keşfet Sayfasına Git
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    onNavigate('offers');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Taleplerime Git
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Yeni Talep Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">{/* Removed pb-24 for modal usage */}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Başlık *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Örn: Bu akşam kahve içelim ☕"
            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            required
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Açıklama *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Etkinlik hakkında detaylı bilgi verin..."
            className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all resize-none"
            rows={4}
            required
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-2">
            {formData.description.length}/500 karakter
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Kategori *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleChange('category', cat.value)}
                className={`p-4 rounded-xl font-semibold transition-all text-base ${
                  formData.category === cat.value
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-3xl mb-2 block">{cat.emoji}</span>
                {cat.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              <MapPin className="w-5 h-5 inline mr-1" />
              Şehir *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="İstanbul"
              className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              Semt / İlçe
            </label>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="Kadıköy"
              className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              <Calendar className="w-5 h-5 inline mr-1" />
              Tarih *
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => handleChange('event_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              Saat *
            </label>
            <input
              type="time"
              value={formData.event_time}
              onChange={(e) => handleChange('event_time', e.target.value)}
              className="w-full px-5 py-4 text-base border-2 border-gray-200 rounded-xl focus:border-violet-400 focus:ring-4 focus:ring-violet-100 outline-none transition-all"
              required
            />
          </div>
        </div>

        {/* Offer Type */}
        <div>
          <label className="block text-base font-bold text-gray-800 mb-3">
            Teklif Türü *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                handleChange('offer_type', 'birebir');
                handleChange('participant_count', 2);
              }}
              className={`p-5 rounded-xl font-semibold transition-all text-base ${
                formData.offer_type === 'birebir'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-7 h-7 mx-auto mb-2" />
              Birebir
            </button>
            <button
              type="button"
              onClick={() => handleChange('offer_type', 'grup')}
              className={`p-5 rounded-xl font-semibold transition-all text-base ${
                formData.offer_type === 'grup'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-7 h-7 mx-auto mb-2" />
              Grup Etkinliği
            </button>
          </div>
        </div>

        {/* Participant Count */}
        {formData.offer_type === 'grup' && (
          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">
              <Users className="w-5 h-5 inline mr-1" />
              Katılımcı Sayısı: {formData.participant_count} kişi
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={formData.participant_count}
              onChange={(e) => handleChange('participant_count', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span>
              <span>20</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 text-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? 'Oluşturuluyor...' : '🎉 Talebimi Yayınla'}
        </button>
        </form>
      </div>
    </>
  );
}
