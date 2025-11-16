import { useState } from 'react';
import { Phone, Mail, User, MapPin, Heart, Camera, Shield, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Step = 
  | 'phone' 
  | 'phone-otp' 
  | 'email' 
  | 'email-otp' 
  | 'welcome' 
  | 'basic-info' 
  | 'location' 
  | 'interests' 
  | 'education' 
  | 'lifestyle' 
  | 'photos';

type Props = {
  onClose?: () => void;
};

export default function StepByStepRegistration({ onClose }: Props = {}) {
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [phone, setPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'erkek' | 'kadın' | 'diğer'>('erkek');
  const [showProfile, setShowProfile] = useState(true);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<'lise' | 'universite' | 'yuksek_lisans' | 'doktora' | 'diger' | ''>('');
  const [hasPets, setHasPets] = useState<boolean | null>(null);
  const [petType, setPetType] = useState('');
  const [drinksAlcohol, setDrinksAlcohol] = useState<'evet' | 'hayir' | 'bazen' | ''>('');
  const [smokes, setSmokes] = useState<'evet' | 'hayir' | 'bazen' | ''>('');
  const [photos, setPhotos] = useState<string[]>(Array(6).fill(''));
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const { signUp } = useAuth();

  const getStepNumber = () => {
    const stepMap = {
      'phone': 1,
      'phone-otp': 2,
      'email': 3,
      'email-otp': 4,
      'welcome': 5,
      'basic-info': 6,
      'location': 7,
      'interests': 8,
      'education': 9,
      'lifestyle': 10,
      'photos': 11,
    };
    return stepMap[currentStep] || 1;
  };

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

  const sendPhoneOtp = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulated OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Phone OTP sent to:', phone);
      setCurrentStep('phone-otp');
    } catch (err) {
      setError('OTP gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (phoneOtp !== '123456') {
      setError('Doğrulama kodu hatalı');
      return;
    }
    setError('');
    setCurrentStep('email');
  };

  const sendEmailOtp = async () => {
    setLoading(true);
    setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Email OTP sent to:', email);
      setCurrentStep('email-otp');
    } catch (err) {
      setError('OTP gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (emailOtp !== '123456') {
      setError('Doğrulama kodu hatalı');
      return;
    }
    setError('');
    setCurrentStep('welcome');
  };

  const skipEmail = () => {
    setEmail('');
    setCurrentStep('welcome');
  };

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

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        name,
        birth_date: birthDate,
        age: calculateAge(birthDate),
        gender,
        phone_verified: true,
        email_verified: !!email,
        show_profile: showProfile,
        looking_for: lookingFor,
        education_level: educationLevel || 'universite',
        has_pets: hasPets === null ? undefined : hasPets,
        pet_type: hasPets ? petType : undefined,
        drinks_alcohol: drinksAlcohol || 'hayir',
        smokes: smokes || 'hayir',
        photos: photos,
      };

      await signUp(email || `${phone.replace(/\D/g, '')}@phone.local`, '123456', userData);
      
      // Kayıt başarılı, modal'ı kapat
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'phone':
        return (
          <div className="text-center">
            <Phone className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Telefon Numaranız</h2>
            <p className="text-gray-600 mb-6">Güvenlik için telefon numaranızı doğrulayalım</p>
            
            <input
              type="tel"
              placeholder="Telefon Numarası"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all mb-4"
              required
            />

            <button
              onClick={sendPhoneOtp}
              disabled={loading || !phone}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
            </button>
          </div>
        );

      case 'phone-otp':
        return (
          <div className="text-center">
            <Phone className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Telefon Doğrulama</h2>
            <p className="text-gray-600 mb-6">{phone} numarasına gönderilen kodu girin</p>
            
            <input
              type="text"
              placeholder="6 haneli kod"
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-center text-2xl font-mono tracking-widest mb-4"
              maxLength={6}
            />
            
            <p className="text-sm text-gray-500 mb-4">Test için: <span className="font-mono font-bold">123456</span></p>

            <button
              onClick={verifyPhoneOtp}
              disabled={phoneOtp.length !== 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Doğrula
            </button>
          </div>
        );

      case 'email':
        return (
          <div className="text-center">
            <Mail className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">E-posta Adresi</h2>
            <p className="text-gray-600 mb-6">E-posta adresinizi doğrulayalım (opsiyonel)</p>
            
            <input
              type="email"
              placeholder="E-posta adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={skipEmail}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all"
              >
                Atla
              </button>
              <button
                onClick={sendEmailOtp}
                disabled={loading || !email}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Doğrula'}
              </button>
            </div>
          </div>
        );

      case 'email-otp':
        return (
          <div className="text-center">
            <Mail className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">E-posta Doğrulama</h2>
            <p className="text-gray-600 mb-6">{email} adresine gönderilen kodu girin</p>
            
            <input
              type="text"
              placeholder="6 haneli kod"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-center text-2xl font-mono tracking-widest mb-4"
              maxLength={6}
            />
            
            <p className="text-sm text-gray-500 mb-4">Test için: <span className="font-mono font-bold">123456</span></p>

            <button
              onClick={verifyEmailOtp}
              disabled={emailOtp.length !== 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Doğrula
            </button>
          </div>
        );

      case 'welcome':
        return (
          <div className="text-center">
            <Heart className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoş Geldin!</h2>
            <p className="text-gray-600 mb-6">Teklif.et'e katıldığın için teşekkürler</p>
            
            <div className="bg-violet-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Kurallar ve Nezaket</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Saygılı ve nazik davranın</li>
                <li>• Kişisel bilgilerinizi koruyun</li>
                <li>• Sahte profil oluşturmayın</li>
                <li>• Uygunsuz içerik paylaşmayın</li>
                <li>• Diğer kullanıcıları rahatsız etmeyin</li>
              </ul>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className="w-5 h-5 text-violet-500 rounded focus:ring-violet-400"
              />
              <span className="text-gray-700">Kuralları okudum ve kabul ediyorum</span>
            </label>

            <button
              onClick={() => setCurrentStep('basic-info')}
              disabled={!rulesAccepted}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Devam Et
            </button>
          </div>
        );

      case 'basic-info':
        return (
          <div className="text-center">
            <User className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Temel Bilgiler</h2>
            <p className="text-gray-600 mb-6">Profilinde görünecek bilgileri gir</p>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Adınız (profilde görünecek)"
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

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showProfile}
                  onChange={(e) => setShowProfile(e.target.checked)}
                  className="w-5 h-5 text-violet-500 rounded focus:ring-violet-400"
                />
                <span className="text-gray-700">Profilimi göster</span>
              </label>
            </div>

            <button
              onClick={() => setCurrentStep('location')}
              disabled={!name || !birthDate}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-6"
            >
              Devam Et
            </button>
          </div>
        );

      case 'location':
        return (
          <div className="text-center">
            <MapPin className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Konum İzni</h2>
            <p className="text-gray-600 mb-6">Yakınındaki etkinlikleri gösterebilmemiz için konum iznine ihtiyacımız var</p>
            
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700">Konum bilgin güvende. Sadece yakınındaki etkinlikleri göstermek için kullanılır.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep('interests')}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all"
              >
                Şimdi Değil
              </button>
              <button
                onClick={() => {
                  // Gerçek uygulamada navigator.geolocation.getCurrentPosition() kullanılacak
                  setCurrentStep('interests');
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                İzin Ver
              </button>
            </div>
          </div>
        );

      case 'interests':
        const interestOptions = [
          { id: 'kahve', label: '☕ Kahve', emoji: '☕' },
          { id: 'yemek', label: '🍽️ Yemek', emoji: '🍽️' },
          { id: 'spor', label: '⚽ Spor', emoji: '⚽' },
          { id: 'sinema', label: '🎬 Sinema', emoji: '🎬' },
          { id: 'gezi', label: '🗺️ Gezi', emoji: '🗺️' },
          { id: 'konser', label: '🎵 Konser', emoji: '🎵' },
          { id: 'sanat', label: '🎨 Sanat', emoji: '🎨' },
          { id: 'kitap', label: '📚 Kitap', emoji: '📚' },
          { id: 'oyun', label: '🎮 Oyun', emoji: '🎮' },
          { id: 'dans', label: '💃 Dans', emoji: '💃' },
        ];

        return (
          <div className="text-center">
            <Heart className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ne Arıyorsun?</h2>
            <p className="text-gray-600 mb-6">İlgi alanlarını seç (birden fazla seçebilirsin)</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {interestOptions.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => {
                    if (lookingFor.includes(interest.id)) {
                      setLookingFor(lookingFor.filter(i => i !== interest.id));
                    } else {
                      setLookingFor([...lookingFor, interest.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    lookingFor.includes(interest.id)
                      ? 'border-violet-400 bg-violet-50 text-violet-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{interest.emoji}</div>
                  <div className="text-sm font-medium">{interest.label.replace(interest.emoji + ' ', '')}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep('education')}
              disabled={lookingFor.length === 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Devam Et ({lookingFor.length} seçili)
            </button>
          </div>
        );

      case 'education':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Eğitim Düzeyi</h2>
            <p className="text-gray-600 mb-6">Eğitim durumunu seç</p>
            
            <div className="space-y-3 mb-6">
              {[
                { value: 'lise', label: 'Lise' },
                { value: 'universite', label: 'Üniversite' },
                { value: 'yuksek_lisans', label: 'Yüksek Lisans' },
                { value: 'doktora', label: 'Doktora' },
                { value: 'diger', label: 'Diğer' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEducationLevel(option.value as any)}
                  className={`w-full p-3 rounded-xl border-2 transition-all ${
                    educationLevel === option.value
                      ? 'border-violet-400 bg-violet-50 text-violet-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentStep('lifestyle')}
              disabled={!educationLevel}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              Devam Et
            </button>
          </div>
        );

      case 'lifestyle':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yaşam Tarzı</h2>
            <p className="text-gray-600 mb-6">Birkaç kişisel soru</p>
            
            <div className="space-y-6">
              {/* Evcil Hayvan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Evcil hayvanın var mı?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasPets(true)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      hasPets === true
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Evet
                  </button>
                  <button
                    onClick={() => setHasPets(false)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      hasPets === false
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    Hayır
                  </button>
                </div>
                {hasPets && (
                  <input
                    type="text"
                    placeholder="Hangi hayvan? (kedi, köpek, vs.)"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all mt-3"
                  />
                )}
              </div>

              {/* İçki */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">İçki içer misin?</label>
                <div className="flex gap-2">
                  {[
                    { value: 'evet', label: 'Evet' },
                    { value: 'hayir', label: 'Hayır' },
                    { value: 'bazen', label: 'Bazen' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDrinksAlcohol(option.value as any)}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        drinksAlcohol === option.value
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sigara */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sigara içer misin?</label>
                <div className="flex gap-2">
                  {[
                    { value: 'evet', label: 'Evet' },
                    { value: 'hayir', label: 'Hayır' },
                    { value: 'bazen', label: 'Bazen' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSmokes(option.value as any)}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                        smokes === option.value
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('photos')}
              disabled={hasPets === null || !drinksAlcohol || !smokes}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-6"
            >
              Devam Et
            </button>
          </div>
        );

      case 'photos':
        const handlePhotoUpload = () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.multiple = false;
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              // Dosya boyutu kontrolü (5MB limit)
              if (file.size > 5 * 1024 * 1024) {
                setError('Fotoğraf boyutu 5MB\'dan küçük olmalıdır');
                return;
              }
              
              // Dosya tipi kontrolü
              if (!file.type.startsWith('image/')) {
                setError('Lütfen sadece resim dosyası seçin');
                return;
              }
              
              setError(''); // Hata mesajını temizle
              const reader = new FileReader();
              reader.onload = () => {
                // Sıralı olarak ekle - boş olan ilk slota ekle
                const newPhotos = [...photos];
                const emptyIndex = newPhotos.findIndex(photo => !photo);
                if (emptyIndex !== -1) {
                  newPhotos[emptyIndex] = reader.result as string;
                  setPhotos(newPhotos);
                }
              };
              reader.onerror = () => {
                setError('Fotoğraf yüklenirken hata oluştu');
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        };

        const removePhoto = (index: number) => {
          const newPhotos = [...photos];
          newPhotos[index] = '';
          setPhotos(newPhotos);
        };

        return (
          <div className="text-center">
            <Camera className="w-16 h-16 text-violet-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Fotoğraflar</h2>
            <p className="text-gray-600 mb-6">En az 2, en fazla 6 fotoğraf ekle</p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all relative ${
                    photos[index]
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    if (!photos[index]) {
                      handlePhotoUpload();
                    }
                  }}
                >
                  {photos[index] ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={photos[index]} 
                        alt={`Fotoğraf ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-500">Ekle</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {photos.filter(Boolean).length}/6 fotoğraf eklendi
              {photos.filter(Boolean).length < 2 && (
                <span className="text-red-500"> (En az 2 fotoğraf gerekli)</span>
              )}
            </p>

            <button
              onClick={handleFinalSubmit}
              disabled={loading || photos.filter(Boolean).length < 2}
              className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </div>
        );

      default:
        return <div>Adım bulunamadı</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {onClose && (
                <button
                  onClick={handleGoBack}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800">Kayıt Ol</h1>
                <p className="text-sm text-gray-600">Teklif.et'e katıl</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Adım {getStepNumber()}</span>
              <span>{getStepNumber()}/11</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getStepNumber() / 11) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}