import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Loader2, CheckCircle } from 'lucide-react';

type AppSettings = {
  daily_free_offers: { limit: number };
  boost_duration: { hours: number };
  boost_price: { amount: number; currency: string };
  super_like_daily_limit: { limit: number };
};

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    daily_free_offers: { limit: 3 },
    boost_duration: { hours: 1 },
    boost_price: { amount: 500, currency: 'TRY' },
    super_like_daily_limit: { limit: 3 },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsObj: any = {};
      data?.forEach((item) => {
        settingsObj[item.setting_key] = item.setting_value;
      });

      setSettings(settingsObj);
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
      // Update each setting
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
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ayarlar</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
        {/* Genel Ayarlar */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Genel Ayarlar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Günlük Ücretsiz Teklif Limiti
              </label>
              <input
                type="number"
                value={settings.daily_free_offers.limit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_free_offers: { limit: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Günlük Süper Beğeni Limiti
              </label>
              <input
                type="number"
                value={settings.super_like_daily_limit.limit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    super_like_daily_limit: { limit: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>



        {/* Boost Ayarları */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Boost Ayarları</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boost Süresi (Saat)
              </label>
              <input
                type="number"
                value={settings.boost_duration.hours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    boost_duration: { hours: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boost Fiyatı (₺)
              </label>
              <input
                type="number"
                value={settings.boost_price.amount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    boost_price: {
                      ...settings.boost_price,
                      amount: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
