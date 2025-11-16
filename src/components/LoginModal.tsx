import { useState } from 'react';
import { X, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  onClose: () => void;
};

type Step = 'phone' | 'otp';

export default function LoginModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithPhone } = useAuth();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('0')) {
      return '+90' + numbers.substring(1);
    }
    if (numbers.startsWith('5')) {
      return '+90' + numbers;
    }
    if (numbers.startsWith('90')) {
      return '+' + numbers;
    }
    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulated OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Login OTP sent to:', phone);
      setStep('otp');
    } catch (err) {
      setError('OTP gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndLogin = async () => {
    if (otp !== '123456') {
      setError('Doğrulama kodu hatalı');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Telefon ile giriş yapmayı dene
      await signInWithPhone(phone, '123456');
      onClose();
    } catch (err) {
      // Hata mesajını Türkçeleştir
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('User not found')) {
        setError('Bu telefon numarası ile kayıtlı kullanıcı bulunamadı. Lütfen önce kayıt olun.');
      } else {
        setError('Giriş yapılırken hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative animate-in slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === 'phone' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Giriş Yap</h2>
            <p className="text-gray-600 mb-8">Telefon numaranızla giriş yapın</p>
            
            <div className="space-y-4">
              <input
                type="tel"
                placeholder="Telefon Numarası"
                value={phone}
                onChange={handlePhoneChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-lg"
                autoFocus
              />

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={sendOtp}
                disabled={loading || !phone}
                className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Doğrulama Kodu Gönder
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Doğrulama Kodu</h2>
            <p className="text-gray-600 mb-2">{phone} numarasına gönderilen</p>
            <p className="text-gray-600 mb-8">6 haneli kodu girin</p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoFocus
              />

              <p className="text-sm text-gray-500">
                Test için: <span className="font-mono font-bold text-violet-600">123456</span>
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all"
                >
                  Geri
                </button>
                <button
                  onClick={verifyOtpAndLogin}
                  disabled={loading || otp.length !== 6}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}