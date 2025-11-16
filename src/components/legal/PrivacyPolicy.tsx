import { ArrowLeft } from 'lucide-react';

type Props = {
  onBack?: () => void;
};

export default function PrivacyPolicy({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gizlilik Politikası</h1>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">1. Toplanan Bilgiler</h2>
            <p className="text-gray-600 mb-4">
              Teklif.et olarak, size daha iyi hizmet verebilmek için aşağıdaki bilgileri topluyoruz:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Profil bilgileri (ad, yaş, cinsiyet, fotoğraflar)</li>
              <li>İletişim bilgileri (telefon, e-posta)</li>
              <li>Konum bilgileri (yakınındaki etkinlikleri göstermek için)</li>
              <li>Uygulama kullanım verileri</li>
              <li>Cihaz bilgileri (güvenlik amaçlı)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">2. Bilgilerin Kullanımı</h2>
            <p className="text-gray-600 mb-4">Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Eşleşme algoritması için profil analizi</li>
              <li>Yakınındaki etkinlikleri göstermek</li>
              <li>Güvenlik ve dolandırıcılık önleme</li>
              <li>Müşteri desteği sağlamak</li>
              <li>Hizmet kalitesini artırmak</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">3. Bilgi Paylaşımı</h2>
            <p className="text-gray-600 mb-4">
              Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız. Sadece aşağıdaki durumlarda 
              bilgi paylaşımı yapabiliriz:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Yasal zorunluluklar</li>
              <li>Güvenlik tehditleri</li>
              <li>Hizmet sağlayıcıları (şifrelenmiş veri)</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">4. Veri Güvenliği</h2>
            <p className="text-gray-600 mb-4">
              Verilerinizin güvenliği bizim için önceliklidir. Aşağıdaki güvenlik önlemlerini alıyoruz:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>SSL şifreleme ile veri aktarımı</li>
              <li>Güvenli sunucu altyapısı</li>
              <li>Düzenli güvenlik denetimleri</li>
              <li>Erişim kontrolü ve yetkilendirme</li>
              <li>Veri yedekleme ve kurtarma</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">5. Çerezler (Cookies)</h2>
            <p className="text-gray-600 mb-4">
              Daha iyi kullanıcı deneyimi için çerezler kullanıyoruz. Çerezleri tarayıcı 
              ayarlarınızdan yönetebilirsiniz.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">6. Kullanıcı Hakları</h2>
            <p className="text-gray-600 mb-4">KVKK kapsamında aşağıdaki haklarınız bulunmaktadır:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Verilerinize erişim hakkı</li>
              <li>Veri düzeltme hakkı</li>
              <li>Veri silme hakkı</li>
              <li>Veri taşınabilirlik hakkı</li>
              <li>İşleme itiraz etme hakkı</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">7. Veri Saklama</h2>
            <p className="text-gray-600 mb-4">
              Verilerinizi yasal zorunluluklar ve hizmet kalitesi için gerekli süre boyunca saklarız. 
              Hesabınızı sildiğinizde verileriniz güvenli şekilde silinir.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">8. Değişiklikler</h2>
            <p className="text-gray-600 mb-4">
              Bu gizlilik politikasında değişiklik yapma hakkımız saklıdır. Önemli değişiklikler 
              hakkında kullanıcılarımızı bilgilendiririz.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">9. İletişim</h2>
            <p className="text-gray-600 mb-4">
              Gizlilik ile ilgili sorularınız için: <a href="mailto:gizlilik@teklif.et" className="text-violet-600 hover:underline">gizlilik@teklif.et</a>
            </p>

            <p className="text-sm text-gray-500 mt-8">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}