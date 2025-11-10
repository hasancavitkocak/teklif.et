import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type AppSettings = {
  daily_free_offers: { limit: number };
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
  boost_duration: { hours: number };
  boost_price: { amount: number; currency: string };
  super_like_daily_limit: { limit: number };
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

  return { settings, loading, refresh: loadSettings };
}
