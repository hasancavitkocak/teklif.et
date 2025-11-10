import { useState, useEffect } from 'react';
import { X, Send, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { supabase, ActivityOffer } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

type Props = {
  offer: ActivityOffer;
  onClose: () => void;
  onSuccess: () => void;
};

export default function OfferRequestModal({ offer, onClose, onSuccess }: Props) {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  
  const [formData, setFormData] = useState({
    message: '',
    suggested_date: '',
    suggested_location: '',
  });

  // Scroll to top when modal opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const checkCanSendRequest = async () => {
    if (!profile) return false;

    // Premium users can always send
    if (profile.is_premium) return true;

    // Check active packages
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (packages && packages.length > 0) {
      const pkg = packages[0];
      
      // Unlimited package
      if (!pkg.offer_limit) return true;

      // Count requests made since package purchase
      const { count } = await supabase
        .from('offer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('requester_id', profile.id)
        .gte('created_at', pkg.created_at);

      return (count || 0) < pkg.offer_limit;
    }

    // Check free offers (3 free)
    return profile.free_offers_used < 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      // Check if user can send request
      const canSend = await checkCanSendRequest();
      if (!canSend) {
        setShowLimitWarning(true);
        setLoading(false);
        return;
      }

      // Create offer request
      const { error: insertError } = await supabase
        .from('offer_requests')
        .insert({
          offer_id: offer.id,
          requester_id: profile.id,
          message: formData.message || null,
          suggested_date: formData.suggested_date || null,
          suggested_location: formData.suggested_location || null,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Update offer counts - ALWAYS update total_offers_sent
      const updates: any = {
        total_offers_sent: profile.total_offers_sent + 1,
      };

      // Update free offers count if not premium and no active package
      if (!profile.is_premium) {
        const { data: packages } = await supabase
          .from('packages')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', true)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
          .limit(1);

        if (!packages || packages.length === 0) {
          // Using free offers
          updates.free_offers_used = profile.free_offers_used + 1;
        }
      }

      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      await refreshProfile();

      // Show success toast
      showToast('success', '✅ Teklifiniz başarıyla gönderildi!');
      
      onSuccess();
    } catch (err: any) {
      console.error('Error sending request:', err);
      setError(err.message || 'Teklif gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (showLimitWarning) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Teklif Hakkınız Doldu
            </h3>
            <p className="text-gray-600 mb-6">
              Ücretsiz 3 teklif hakkınızı kullandınız. Daha fazla teklif göndermek için paket satın alın.
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 text-left border-2 border-pink-200">
                <p className="font-semibold text-gray-800 mb-1">10 Teklif Paketi</p>
                <p className="text-sm text-gray-600 mb-2">Süresiz kullanım</p>
                <p className="text-2xl font-bold text-pink-600">500 TL</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-left border-2 border-green-300">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-800">20 Teklif Paketi</p>
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Popüler</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Süresiz kullanım</p>
                <p className="text-2xl font-bold text-green-600">800 TL</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 text-left border-2 border-purple-200">
                <p className="font-semibold text-gray-800 mb-1">Aylık Sınırsız</p>
                <p className="text-sm text-gray-600 mb-2">30 gün boyunca sınırsız</p>
                <p className="text-2xl font-bold text-purple-600">3.000 TL</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  // TODO: Navigate to packages page
                  alert('Paket satın alma sayfası yakında eklenecek!');
                }}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Paket Al
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">Teklif Gönder</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Offer Preview */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="font-bold text-gray-800 text-lg mb-2">{offer.title}</h4>
          <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span>{new Date(offer.event_date).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-pink-500" />
              <span>{offer.city}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {!profile?.is_premium && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
              Kalan ücretsiz teklif hakkınız: <strong>{3 - (profile?.free_offers_used || 0)}</strong>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mesajınız (İsteğe Bağlı)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Örn: O kahve teklifin harika, birlikte gidelim mi?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/300 karakter
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tarih Öneriniz (İsteğe Bağlı)
            </label>
            <input
              type="datetime-local"
              value={formData.suggested_date}
              onChange={(e) => setFormData({ ...formData, suggested_date: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konum Öneriniz (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={formData.suggested_location}
              onChange={(e) => setFormData({ ...formData, suggested_location: e.target.value })}
              placeholder="Örn: Starbucks Kadıköy"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
              maxLength={100}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Gönderiliyor...' : 'Teklif Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
