import { useState } from 'react';
import { Crown, Heart, Eye, Zap, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type PackageType = 'package_10' | 'package_20' | 'monthly_unlimited';

export default function Premium() {
  const { profile, refreshProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PackageType>('package_10');
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = {
    package_10: {
      price: 500,
      name: '10 Teklif Paketi',
      offers: 10,
      duration: 'Süresiz',
      savings: null,
      popular: false,
    },
    package_20: {
      price: 800,
      name: '20 Teklif Paketi',
      offers: 20,
      duration: 'Süresiz',
      savings: '200₺ tasarruf',
      popular: true,
    },
    monthly_unlimited: {
      price: 3000,
      name: 'Aylık Sınırsız',
      offers: null,
      duration: '30 gün',
      savings: 'En avantajlı',
      popular: false,
    },
  };

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
      const expiresAt = plan.offers === null 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days for unlimited
        : null; // No expiry for counted packages

      const { error } = await supabase
        .from('packages')
        .insert({
          user_id: profile.id,
          package_type: selectedPlan === 'monthly_unlimited' ? 'aylik' : 'gunluk',
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

  if (profile?.is_premium) {
    return (
      <div className="max-w-md mx-auto pb-24">
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl shadow-2xl p-8 text-white text-center">
          <Crown className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Premium Üyesiniz!</h2>
          <p className="text-amber-50 mb-6">
            Tüm premium özelliklerin keyfini çıkarın
          </p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Premium'a Geçin
        </h2>
        <p className="text-gray-600">
          Daha fazla eşleşme ve özel özellikler için
        </p>
      </div>

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
                  ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  En Popüler
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {plan.name}
              </h3>
              <div className="mb-3">
                <span className="text-3xl font-bold text-gray-800">
                  ₺{plan.price}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {plan.offers ? `${plan.offers} Teklif` : 'Sınırsız Teklif'}
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {plan.duration}
              </div>
              {plan.savings && (
                <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full inline-block">
                  {plan.savings}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Premium Özellikler
        </h3>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
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

      <button
        onClick={handleSubscribe}
        disabled={processing}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
      >
        {processing ? 'İşleniyor...' : `${plans[selectedPlan].price}₺ Ödemeye Geç`}
      </button>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Ödeme Simülasyonu
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Bu demo sürümde gerçek ödeme yapılmaz. Premium'u aktifleştirmek için butona tıklayın.
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
