import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Loader2, CheckCircle, Crown } from 'lucide-react';

type PremiumSettings = {
  premium_weekly_10_price: { amount: number; currency: string };
  premium_weekly_20_price: { amount: number; currency: string };
  premium_monthly_price: { amount: number; currency: string };
  premium_yearly_price: { amount: number; currency: string };
  premium_features: {
    unlimited_offers: boolean;
    super_likes: number;
    boost_per_month: number;
    see_who_liked: boolean;
    advanced_filters: boolean;
  };
};

export default function PremiumSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<PremiumSettings>({
    premium_weekly_10_price: { amount: 500, currency: 'TRY' },
    premium_weekly_20_price: { amount: 800, currency: 'TRY' },
    premium_monthly_price: { amount: 3000, currency: 'TRY' },
    premium_yearly_price: { amount: 30000, currency: 'TRY' },
    premium_features: {
      unlimited_offers: true,
      super_likes: 5,
      boost_per_month: 1,
      see_who_liked: true,
      advanced_filters: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'premium_weekly_10_price',
          'premium_weekly_20_price',
          'premium_monthly_price',
          'premium_yearly_price',
          'premium_features',
        ]);

      if (error) throw error;

      const settingsObj: any = {};
      data?.forEach((item) => {
        settingsObj[item.setting_key] = item.setting_value;
      });

      setSettings({ ...settings, ...settingsObj });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setSaved(false);

    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.rpc('update_app_setting', {
          p_key: key,
          p_value: value,
          p_user_id: user.id,
        });

        if (error) throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Premium Ayarları</h1>
            <p className="text-gray-600">Paket fiyatları ve özellikleri</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Paket Fiyatları */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Paket Fiyatları</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Haftalık 10 Teklif Paketi (₺)
              </label>
              <input
                type="number"
                value={settings.premium_weekly_10_price.amount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_weekly_10_price: {
                      ...settings.premium_weekly_10_price,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">7 gün geçerli, 10 teklif hakkı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Haftalık 20 Teklif Paketi (₺)
              </label>
              <input
                type="number"
                value={settings.premium_weekly_20_price.amount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_weekly_20_price: {
                      ...settings.premium_weekly_20_price,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">7 gün geçerli, 20 teklif hakkı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aylık Sınırsız Paket (₺)
              </label>
              <input
                type="number"
                value={settings.premium_monthly_price.amount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_monthly_price: {
                      ...settings.premium_monthly_price,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">30 gün geçerli, sınırsız teklif</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yıllık Sınırsız Paket (₺)
              </label>
              <input
                type="number"
                value={settings.premium_yearly_price.amount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_yearly_price: {
                      ...settings.premium_yearly_price,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">365 gün geçerli, sınırsız teklif</p>
            </div>
          </div>
        </div>

        {/* Premium Özellikler */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Premium Özellikler</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-gray-700">Sınırsız Teklif</label>
                <p className="text-xs text-gray-500">Aylık pakette sınırsız teklif gönderme</p>
              </div>
              <input
                type="checkbox"
                checked={settings.premium_features.unlimited_offers}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_features: {
                      ...settings.premium_features,
                      unlimited_offers: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-gray-700">Günlük Süper Beğeni</label>
                <p className="text-xs text-gray-500">Premium kullanıcılar için günlük limit</p>
              </div>
              <input
                type="number"
                value={settings.premium_features.super_likes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_features: {
                      ...settings.premium_features,
                      super_likes: parseInt(e.target.value),
                    },
                  })
                }
                className="w-20 px-3 py-1 border rounded-lg text-center"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-gray-700">Aylık Boost</label>
                <p className="text-xs text-gray-500">Premium kullanıcılar için aylık boost sayısı</p>
              </div>
              <input
                type="number"
                value={settings.premium_features.boost_per_month}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_features: {
                      ...settings.premium_features,
                      boost_per_month: parseInt(e.target.value),
                    },
                  })
                }
                className="w-20 px-3 py-1 border rounded-lg text-center"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-gray-700">Beğenenleri Görme</label>
                <p className="text-xs text-gray-500">Kim beğendi özelliği</p>
              </div>
              <input
                type="checkbox"
                checked={settings.premium_features.see_who_liked}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_features: {
                      ...settings.premium_features,
                      see_who_liked: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="text-sm font-medium text-gray-700">Gelişmiş Filtreler</label>
                <p className="text-xs text-gray-500">Detaylı arama filtreleri</p>
              </div>
              <input
                type="checkbox"
                checked={settings.premium_features.advanced_filters}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    premium_features: {
                      ...settings.premium_features,
                      advanced_filters: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-sm border border-yellow-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Önizleme</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2">Haftalık 10</h4>
              <p className="text-3xl font-bold text-pink-600 mb-2">
                ₺{settings.premium_weekly_10_price.amount}
              </p>
              <p className="text-sm text-gray-600">10 teklif / 7 gün</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-pink-500">
              <div className="text-xs bg-green-500 text-white px-2 py-1 rounded-full inline-block mb-2">
                En Popüler
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Haftalık 20</h4>
              <p className="text-3xl font-bold text-pink-600 mb-2">
                ₺{settings.premium_weekly_20_price.amount}
              </p>
              <p className="text-sm text-gray-600">20 teklif / 7 gün</p>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2">Aylık Sınırsız</h4>
              <p className="text-3xl font-bold text-pink-600 mb-2">
                ₺{settings.premium_monthly_price.amount}
              </p>
              <p className="text-sm text-gray-600">Sınırsız / 30 gün</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
