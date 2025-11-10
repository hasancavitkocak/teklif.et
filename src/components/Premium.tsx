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
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
      <div className="max-w-md mx-auto pb-24">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl shadow-2xl p-8 text-white text-center">
          <Crown className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Premium Üyesiniz!</h2>
          <p className="text-amber-50 mb-6">
            Tüm premium özelliklerin keyfini çıkarın
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <h3 className="font-semibold mb-4">Aktif Özellikleriniz</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={cancelPremium}
            className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all"
          >
            Premium Üyeliği İptal Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Crown className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold mb-3">
            Premium'a Geçin
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Daha fazla eşleşme ve özel özellikler için
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Sınırsız Teklif</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Özel Özellikler</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Öncelikli Destek</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {(Object.keys(plans) as PackageType[]).map((planKey) => {
          const plan = plans[planKey];
          const isSelected = selectedPlan === planKey;

          return (
            <button
              key={planKey}
              onClick={() => setSelectedPlan(planKey)}
              className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
              } ${plan.popular ? 'ring-2 ring-green-400' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  ⭐ En Popüler
                </div>
              )}
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-3 mt-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    ₺{plan.price}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-base font-semibold text-gray-700">
                    {plan.offers ? `${plan.offers} Teklif` : '🔥 Sınırsız Teklif'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.duration}
                  </div>
                </div>
                {plan.savings && (
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                    {plan.savings}
                  </div>
                )}
                {isSelected && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-amber-600 font-semibold text-sm">
                    <Check className="w-4 h-4" />
                    Seçildi
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
          ✨ Premium Özellikler
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={processing}
        className="w-full py-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Crown className="w-6 h-6" />
        {processing ? 'İşleniyor...' : `₺${plans[selectedPlan].price} - Hemen Başla`}
      </button>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        🔒 Güvenli ödeme • 💳 Tüm kartlar kabul edilir • ✅ Anında aktivasyon
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
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
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
