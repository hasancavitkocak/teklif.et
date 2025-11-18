import { useState } from 'react';
import { Crown, Heart, Eye, Zap, Check, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useAppSettings } from '../hooks/useAppSettings';

type PackageType = 'weekly_10' | 'weekly_20' | 'monthly_unlimited';

export default function Premium() {
  const { profile, refreshProfile } = useAuth();
  const { settings, loading: settingsLoading } = useAppSettings();
  const [selectedPlan, setSelectedPlan] = useState<PackageType>('weekly_20');
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const weekly10Price = settings?.premium_weekly_10_price?.amount || 500;
  const weekly20Price = settings?.premium_weekly_20_price?.amount || 800;
  const monthlyPrice = settings?.premium_monthly_price?.amount || 3000;

  const plans = {
    weekly_10: {
      price: weekly10Price,
      name: 'Haftalık 10 Teklif',
      offers: 10,
      duration: '7 gün',
      savings: null,
      popular: false,
    },
    weekly_20: {
      price: weekly20Price,
      name: 'Haftalık 20 Teklif',
      offers: 20,
      duration: '7 gün',
      savings: `${weekly10Price * 2 - weekly20Price}₺ tasarruf`,
      popular: true,
    },
    monthly_unlimited: {
      price: monthlyPrice,
      name: 'Aylık Sınırsız',
      offers: null,
      duration: '30 gün',
      savings: 'En avantajlı',
      popular: false,
    },
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: 'Daha Fazla Teklif',
      description: 'Ücretsiz 3 teklifin ötesinde istediğiniz kadar teklif gönderin',
    },
    {
      icon: Heart,
      title: 'Daha Fazla Eşleşme',
      description: 'Daha çok teklif = daha çok eşleşme fırsatı',
    },
    {
      icon: Eye,
      title: 'Esnek Paketler',
      description: 'İhtiyacınıza göre paket seçin, süresiz kullanın',
    },
    {
      icon: Sparkles,
      title: 'Anında Aktivasyon',
      description: 'Satın aldığınız paket hemen aktif olur',
    },
  ];

  const handleSubscribe = async () => {
    if (!profile) return;

    setProcessing(true);

    try {
      const plan = plans[selectedPlan];
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          plan_type: selectedPlan,
          amount: plan.price,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Ödeme başlatılamadı, lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  const simulatePayment = async () => {
    if (!profile) return;

    setProcessing(true);

    try {
      const plan = plans[selectedPlan];
      
      // Create package record
      let expiresAt: string | null = null;
      let packageType = 'gunluk';

      if (selectedPlan === 'monthly_unlimited') {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
        packageType = 'aylik';
      } else if (selectedPlan === 'weekly_10' || selectedPlan === 'weekly_20') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
        packageType = 'gunluk';
      }

      const { error } = await supabase
        .from('packages')
        .insert({
          user_id: profile.id,
          package_type: packageType,
          offer_limit: plan.offers,
          expires_at: expiresAt,
          is_active: true,
        });

      if (error) throw error;

      await refreshProfile();
      setShowPaymentModal(false);
      alert(`Tebrikler! ${plan.name} paketiniz aktif edildi.`);
    } catch (error) {
      console.error('Error activating package:', error);
      alert('Paket aktivasyonu başarısız, lütfen tekrar deneyin.');
    } finally {
      setProcessing(false);
    }
  };

  const cancelPremium = async () => {
    if (!confirm('Premium üyeliğinizi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      alert('Premium üyeliğiniz iptal edildi.');
    } catch (error) {
      console.error('Error canceling premium:', error);
      alert('İptal işlemi başarısız oldu.');
    }
  };

  if (profile?.is_premium) {
    return (
      <div className="max-w-lg mx-auto pb-24 px-4">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg p-6 text-white text-center">
          <Crown className="w-16 h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Premium Üyesiniz!</h2>
          <p className="text-sm text-amber-50 mb-4">
            Tüm premium özelliklerin keyfini çıkarın
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-sm mb-3">Aktif Özellikleriniz</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-left">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={cancelPremium}
            className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all"
          >
            Premium Üyeliği İptal Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 px-4 pt-6">
      {/* Hero Section - Daha Küçük */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-3 shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Premium'a Geçin
        </h2>
        <p className="text-sm text-gray-600">
          Daha fazla eşleşme fırsatı için paket seçin
        </p>
      </div>

      {/* Pricing Cards - Yan Yana Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(Object.keys(plans) as PackageType[]).map((planKey) => {
          const plan = plans[planKey];
          const isSelected = selectedPlan === planKey;

          return (
            <button
              key={planKey}
              onClick={() => setSelectedPlan(planKey)}
              className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-amber-300'
              } ${plan.popular ? 'ring-2 ring-green-400' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  ⭐ Popüler
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800 leading-tight min-h-[32px] flex items-center justify-center">
                  {plan.name}
                </h3>
                
                <div className="py-2">
                  <div className="text-2xl font-bold text-amber-600">
                    ₺{plan.price}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {plan.duration}
                  </div>
                </div>
                
                <div className="text-sm font-semibold text-gray-700 min-h-[20px]">
                  {plan.offers ? `${plan.offers} Teklif` : '🔥 Sınırsız'}
                </div>
                
                {plan.savings && (
                  <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    {plan.savings}
                  </div>
                )}
                
                {isSelected && (
                  <div className="flex items-center justify-center gap-1 text-amber-600 font-semibold text-xs pt-1">
                    <Check className="w-3 h-3" />
                    Seçildi
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Features - Grid Layout */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Premium Özellikler
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <feature.icon className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-gray-800 mb-0.5 leading-tight">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-600 leading-snug">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button - Kompakt */}
      <button
        onClick={handleSubscribe}
        disabled={processing}
        className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Crown className="w-5 h-5" />
        {processing ? 'İşleniyor...' : `₺${plans[selectedPlan].price} - Hemen Başla`}
      </button>
      
      <p className="text-center text-xs text-gray-500 mt-3 leading-relaxed">
        🔒 Güvenli ödeme • 💳 Tüm kartlar • ✅ Anında aktif
      </p>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Ödeme Onayı
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Seçtiğiniz paketi aktifleştirmek için onaylayın.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{plans[selectedPlan].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tutar:</span>
                <span className="font-bold text-xl">₺{plans[selectedPlan].price}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={processing}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                İptal
              </button>
              <button
                onClick={simulatePayment}
                disabled={processing}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {processing ? 'İşleniyor...' : 'Aktifleştir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
