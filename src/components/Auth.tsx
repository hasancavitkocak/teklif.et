import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';



export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'erkek' | 'kadın' | 'diğer'>('erkek');

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpType, setOtpType] = useState<'phone' | 'email'>('phone');


  const { signIn, signUp, signInWithPhone } = useAuth();

  // Doğum tarihinden yaş hesapla
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Telefon numarası formatını düzenle
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // 0 ile başlıyorsa 90 ile değiştir
    if (numbers.startsWith('0')) {
      return '+90' + numbers.substring(1);
    }
    
    // 5 ile başlıyorsa başına +90 ekle
    if (numbers.startsWith('5')) {
      return '+90' + numbers;
    }
    
    // 90 ile başlıyorsa başına + ekle
    if (numbers.startsWith('90')) {
      return '+' + numbers;
    }
    
    // Diğer durumlar için olduğu gibi döndür
    return numbers;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Telefon doğrulama için OTP gönder
  const sendPhoneOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Şimdilik sabit OTP kodu
      const otp = '123456';
      setGeneratedOtp(otp);
      setOtpType('phone');
      
      // Simüle edilmiş gönderim gecikmesi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowOtpStep(true);
      
      console.log(`Telefon doğrulama OTP gönderildi: ${otp} (${phone})`);
    } catch (err) {
      setError('OTP gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Email doğrulama için OTP gönder
  const sendEmailOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Şimdilik sabit OTP kodu
      const otp = '123456';
      setGeneratedOtp(otp);
      setOtpType('email');
      
      // Simüle edilmiş gönderim gecikmesi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowOtpStep(true);
      
      console.log(`Email doğrulama OTP gönderildi: ${otp} (${email})`);
    } catch (err) {
      setError('OTP gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // OTP doğrula
  const verifyOtp = async () => {
    if (otpCode !== generatedOtp) {
      setError('Doğrulama kodu hatalı');
      return;
    }

    if (otpType === 'phone') {
      setPhoneVerified(true);
      console.log('Telefon numarası doğrulandı!');
    } else {
      setEmailVerified(true);
      console.log('Email adresi doğrulandı!');
    }

    setShowOtpStep(false);
    setOtpCode('');
    setError('');
  };

  // OTP adımını sıfırla
  const resetOtpStep = () => {
    setShowOtpStep(false);
    setOtpCode('');
    setGeneratedOtp('');
    setPhoneVerified(false);
    setEmailVerified(false);
  };

  // Hata mesajlarını Türkçeleştir
  const getErrorMessage = (error: any, method: 'email' | 'phone') => {
    const errorMessage = error?.message || error || '';
    
    // Supabase hata mesajları
    if (errorMessage.includes('Invalid login credentials')) {
      if (method === 'email') {
        return 'E-posta adresi veya şifre hatalı';
      } else {
        return 'Telefon numarası veya şifre hatalı';
      }
    }
    
    if (errorMessage.includes('User not found')) {
      if (method === 'email') {
        return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else {
        return 'Bu telefon numarası ile kayıtlı kullanıcı bulunamadı';
      }
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'E-posta adresinizi doğrulamanız gerekiyor';
    }
    
    if (errorMessage.includes('Password should be at least')) {
      return 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (errorMessage.includes('User already registered')) {
      if (method === 'email') {
        return 'Bu e-posta adresi zaten kayıtlı';
      } else {
        return 'Bu telefon numarası zaten kayıtlı';
      }
    }
    
    if (errorMessage.includes('Invalid email')) {
      return 'Geçersiz e-posta adresi formatı';
    }
    
    if (errorMessage.includes('Signup requires a valid password')) {
      return 'Geçerli bir şifre girmeniz gerekiyor';
    }
    
    // Genel hata mesajları
    if (errorMessage.includes('Network')) {
      return 'İnternet bağlantınızı kontrol edin';
    }
    
    // Varsayılan hata mesajı
    return errorMessage || 'Bir hata oluştu, lütfen tekrar deneyin';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called, isLogin:', isLogin);
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Giriş işlemi - OTP yok
        if (loginMethod === 'email') {
          await signIn(email, password);
        } else {
          await signInWithPhone(phone, password);
        }
      } else {
        // Kayıt işlemi
        if (!name || !birthDate) {
          setError('Lütfen tüm alanları doldurun');
          setLoading(false);
          return;
        }

        const calculatedAge = calculateAge(birthDate);
        if (calculatedAge < 18) {
          setError('18 yaşından küçük kullanıcılar kayıt olamaz');
          setLoading(false);
          return;
        }

        // Hem telefon hem email doğrulaması gerekli
        if (!phoneVerified) {
          setError('Lütfen önce telefon numaranızı doğrulayın');
          setLoading(false);
          return;
        }

        if (!emailVerified) {
          setError('Lütfen önce email adresinizi doğrulayın');
          setLoading(false);
          return;
        }

        const userData = {
          name,
          birth_date: birthDate,
          age: calculatedAge,
          gender,
          bio: bio || undefined,
          phone_verified: phoneVerified,
          email_verified: emailVerified,
        };

        // Email ile kayıt yap (telefon da doğrulanmış olacak)
        console.log('Starting signup process with userData:', userData);
        await signUp(email, password, userData);
        console.log('Signup completed successfully');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, loginMethod);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp();
  };

  const handlePhoneVerification = async () => {
    if (!phone) {
      setError('Lütfen telefon numaranızı girin');
      return;
    }
    await sendPhoneOtp();
  };

  const handleEmailVerification = async () => {
    if (!email) {
      setError('Lütfen email adresinizi girin');
      return;
    }
    await sendEmailOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-8 h-8 text-violet-500 fill-violet-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Teklif.et
            </h1>
          </div>
          <p className="text-gray-600">Yeni nesil flört platformu</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {!showOtpStep ? (
            <>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    resetOtpStep();
                  }}
                  className={`flex-1 py-2 px-4 rounded-full font-medium transition-all ${
                    isLogin
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    resetOtpStep();
                  }}
                  className={`flex-1 py-2 px-4 rounded-full font-medium transition-all ${
                    !isLogin
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>
            </>
          ) : (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {otpType === 'phone' ? 'Telefon Doğrulama' : 'Email Doğrulama'}
              </h2>
              <p className="text-gray-600">
                {otpType === 'phone' 
                  ? `${phone} numarasına gönderilen kodu girin`
                  : `${email} adresine gönderilen kodu girin`
                }
              </p>
            </div>
          )}

          {!showOtpStep ? (
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Giriş için yöntem seçimi */}
            {isLogin && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    loginMethod === 'email'
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  E-posta ile
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    loginMethod === 'phone'
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  Telefon ile
                </button>
              </div>
            )}

            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Adınız"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1 ml-1">
                    Doğum Tarihi
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    required
                  />
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'erkek' | 'kadın' | 'diğer')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                >
                  <option value="erkek">Erkek</option>
                  <option value="kadın">Kadın</option>
                  <option value="diğer">Diğer</option>
                </select>
                <textarea
                  placeholder="Kendinizden kısaca bahsedin (opsiyonel)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
                />
              </>
            )}

            {/* Giriş için tek alan */}
            {isLogin && (
              <>
                {loginMethod === 'email' ? (
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    required
                  />
                ) : (
                  <input
                    type="tel"
                    placeholder="Telefon Numarası"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    required
                  />
                )}
              </>
            )}

            {/* Kayıt için hem telefon hem email */}
            {!isLogin && (
              <>
                {/* Telefon Numarası */}
                <div className="space-y-2">
                  <input
                    type="tel"
                    placeholder="Telefon Numarası"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={phoneVerified}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      phoneVerified 
                        ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed' 
                        : 'border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200'
                    }`}
                    required
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={handlePhoneVerification}
                      disabled={loading || !phone || phoneVerified}
                      className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {phoneVerified ? 'Doğrulandı ✓' : 'Onayla'}
                    </button>
                    {phoneVerified && (
                      <span className="text-green-600 text-sm font-medium">
                        Telefon numarası doğrulandı
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Adresi */}
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailVerified}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      emailVerified 
                        ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed' 
                        : 'border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200'
                    }`}
                    required
                  />
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={handleEmailVerification}
                      disabled={loading || !email || emailVerified}
                      className="px-4 py-2 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailVerified ? 'Doğrulandı ✓' : 'Onayla'}
                    </button>
                    {emailVerified && (
                      <span className="text-green-600 text-sm font-medium">
                        Email adresi doğrulandı
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
            
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center">
                <input
                  type="text"
                  placeholder="6 haneli doğrulama kodu"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Test için: <span className="font-mono font-bold">123456</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
              </button>

              <button
                type="button"
                onClick={resetOtpStep}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-all"
              >
                Geri Dön
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
