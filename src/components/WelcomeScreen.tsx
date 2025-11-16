import { useState } from 'react';
import { Heart, Sparkles, Users, MapPin } from 'lucide-react';
import LoginModal from './LoginModal';
import StepByStepRegistration from './StepByStepRegistration';
import TermsOfService from './legal/TermsOfService';
import PrivacyPolicy from './legal/PrivacyPolicy';

export default function WelcomeScreen() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Register sayfası açıksa onu göster
  if (showRegisterPage) {
    return <StepByStepRegistration onClose={() => setShowRegisterPage(false)} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-md text-center max-h-screen overflow-y-auto py-4">
          {/* Logo ve Başlık */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Heart className="w-16 h-16 text-violet-500 fill-violet-500" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute -top-1 -right-1" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent mb-3">
              Teklif.et
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-2">
              Yeni nesil flört platformu
            </p>
            <p className="text-gray-500">
              Gerçek insanlarla, gerçek deneyimler
            </p>
          </div>

          {/* Özellikler */}
          <div className="grid grid-cols-1 gap-4 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Anlamlı Bağlantılar</h3>
                  <p className="text-sm text-gray-600">Ortak ilgi alanlarına dayalı eşleşmeler</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Yakınındaki Etkinlikler</h3>
                  <p className="text-sm text-gray-600">Çevrende gerçek buluşma fırsatları</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Güvenli Ortam</h3>
                  <p className="text-sm text-gray-600">Doğrulanmış profiller ve güvenli sohbet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="space-y-4">
            <button
              onClick={() => setShowRegisterPage(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Üye Ol
            </button>
            
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-4 px-6 bg-white/80 backdrop-blur-sm border-2 border-violet-200 text-violet-700 rounded-2xl font-semibold text-lg hover:bg-white hover:border-violet-300 transition-all duration-200"
            >
              Giriş Yap
            </button>
          </div>

          {/* Alt Bilgi */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Devam ederek{' '}
              <span 
                onClick={() => setShowTerms(true)}
                className="text-violet-600 hover:underline cursor-pointer"
              >
                Kullanım Şartları
              </span>{' '}
              ve{' '}
              <span 
                onClick={() => setShowPrivacy(true)}
                className="text-violet-600 hover:underline cursor-pointer"
              >
                Gizlilik Politikası
              </span>
              'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}



      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <TermsOfService onBack={() => setShowTerms(false)} />
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
          </div>
        </div>
      )}
    </>
  );
}