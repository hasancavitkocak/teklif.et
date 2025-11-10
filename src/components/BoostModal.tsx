import { useState } from 'react';
import { X, Zap, Heart, Sparkles, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAppSettings } from '../hooks/useAppSettings';

type BoostModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function BoostModal({ onClose, onSuccess }: BoostModalProps) {
  const { profile, refreshProfile } = useAuth();
  const { settings } = useAppSettings();
  const [processing, setProcessing] = useState(false);
  const [selectedBoost, setSelectedBoost] = useState<'profile' | 'super_like' | null>(null);

  const boostPrice = settings?.boost_price?.amount || 500;
  const boostDuration = settings?.boost_duration?.hours || 1;

  const boosts = {
    profile: {
      title: 'Profil Boost',
      icon: Zap,
      duration: `${boostDuration} saat`,
      benefit: '3x daha fazla görünürlük',
      price: boostPrice / 100, // Convert to TRY
      color: 'from-purple-500 to-pink-500',
      description: `Profilin ${boostDuration} saat boyunca en üstte görünür`,
    },
    super_like: {
      title: 'Super Like',
      icon: Heart,
      duration: 'Tek kullanım',
      benefit: 'Özel bildirim gönder',
      price: 19.90,
      color: 'from-pink-500 to-rose-500',
      description: 'Karşı tarafa özel bildirimle öne çık',
    },
  };

  const handlePurchase = async () => {
    if (!profile || !selectedBoost) return;

    setProcessing(true);

    try {
      if (selectedBoost === 'profile') {
        // Activate profile boost
        const expiresAt = new Date(Date.now() + boostDuration * 60 * 60 * 1000); // Dynamic hours

        const { error: boostError } = await supabase
          .from('boosts')
          .insert({
            user_id: profile.id,
            boost_type: 'profile_boost',
            expires_at: expiresAt.toISOString(),
            is_active: true,
          });

        if (boostError) throw boostError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_boosted: true,
            boost_expires_at: expiresAt.toISOString(),
          })
          .eq('id', profile.id);

        if (profileError) throw profileError;

        alert('🚀 Profil Boost aktif! 30 dakika boyunca 3x daha fazla görünürlük!');
      } else if (selectedBoost === 'super_like') {
        // Add super like
        const { error } = await supabase
          .from('profiles')
          .update({
            super_likes_remaining: (profile.super_likes_remaining || 0) + 1,
          })
          .eq('id', profile.id);

        if (error) throw error;

        alert('💖 Super Like eklendi! Özel teklifler gönderebilirsin!');
      }

      await refreshProfile();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Boost error:', error);
      alert('Bir hata oluştu: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <h3 className="text-2xl font-bold">Boost & Super Like</h3>
              <p className="text-sm text-white/90">Öne çık, daha fazla eşleş!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Profile Boost */}
          <button
            onClick={() => setSelectedBoost('profile')}
            className={`relative w-full p-5 rounded-2xl border-2 transition-all ${
              selectedBoost === 'profile'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            {selectedBoost === 'profile' && (
              <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                ✓
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${boosts.profile.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <boosts.profile.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {boosts.profile.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {boosts.profile.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {boosts.profile.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {boosts.profile.benefit}
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  ₺{boosts.profile.price}
                </div>
              </div>
            </div>
          </button>

          {/* Super Like */}
          <button
            onClick={() => setSelectedBoost('super_like')}
            className={`relative w-full p-5 rounded-2xl border-2 transition-all ${
              selectedBoost === 'super_like'
                ? 'border-pink-500 bg-pink-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-pink-300'
            }`}
          >
            {selectedBoost === 'super_like' && (
              <div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                ✓
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${boosts.super_like.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <boosts.super_like.icon className="w-8 h-8 text-white fill-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {boosts.super_like.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {boosts.super_like.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {boosts.super_like.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    {boosts.super_like.benefit}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-pink-600">
                    ₺{boosts.super_like.price}
                  </span>
                  {profile && (profile.super_likes_remaining || 0) > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      {profile.super_likes_remaining} ücretsiz
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>

          {/* Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  💡 İpucu
                </p>
                <p className="text-sm text-blue-700">
                  Profil Boost akşam saatlerinde daha etkilidir. Super Like ise özel teklifler için idealdir!
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <button
            onClick={handlePurchase}
            disabled={!selectedBoost || processing}
            className="w-full py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                İşleniyor...
              </>
            ) : selectedBoost ? (
              <>
                <Zap className="w-5 h-5" />
                ₺{boosts[selectedBoost].price} - Hemen Aktifleştir
              </>
            ) : (
              'Bir Seçenek Seçin'
            )}
          </button>


        </div>
      </div>
    </div>
  );
}
