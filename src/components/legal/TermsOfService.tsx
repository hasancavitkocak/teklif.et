import { ArrowLeft } from 'lucide-react';

type Props = {
  onBack?: () => void;
};

export default function TermsOfService({ onBack }: Props) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Kullanım Şartları</h1>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">1. Genel Hükümler</h2>
            <p className="text-gray-600 mb-4">
              Teklif.et platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. Bu şartlar, 
              platformun güvenli ve etik kullanımını sağlamak amacıyla oluşturulmuştur.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">2. Kullanıcı Sorumlulukları</h2>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Gerçek ve doğru bilgiler paylaşmak</li>
              <li>Diğer kullanıcılara saygılı davranmak</li>
              <li>Uygunsuz içerik paylaşmamak</li>
              <li>Sahte profil oluşturmamak</li>
              <li>Spam veya taciz edici davranışlarda bulunmamak</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">3. Yasaklanan Davranışlar</h2>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Başka kullanıcıları rahatsız etmek veya taciz etmek</li>
              <li>Ticari amaçlı içerik paylaşmak</li>
              <li>Telif hakkı ihlali yapan içerikler paylaşmak</li>
              <li>Platformu kötüye kullanmak</li>
              <li>Teknik sistemleri manipüle etmeye çalışmak</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">4. Hesap Güvenliği</h2>
            <p className="text-gray-600 mb-4">
              Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvenli tutun ve başkalarıyla paylaşmayın. 
              Şüpheli aktivite fark ederseniz derhal bizimle iletişime geçin.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">5. İçerik Politikası</h2>
            <p className="text-gray-600 mb-4">
              Paylaştığınız tüm içeriklerden siz sorumlusunuz. Uygunsuz içerikleri kaldırma hakkımız saklıdır. 
              İçeriklerinizin yasal düzenlemelere uygun olması gerekmektedir.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">6. Hizmet Değişiklikleri</h2>
            <p className="text-gray-600 mb-4">
              Platformumuzda iyileştirmeler yapma hakkımız saklıdır. Önemli değişiklikler hakkında 
              kullanıcılarımızı bilgilendiririz.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">7. Hesap Sonlandırma</h2>
            <p className="text-gray-600 mb-4">
              Bu şartları ihlal eden hesapları uyarı vermeksizin sonlandırma hakkımız saklıdır. 
              Hesabınızı istediğiniz zaman silebilirsiniz.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">8. İletişim</h2>
            <p className="text-gray-600 mb-4">
              Sorularınız için: <a href="mailto:destek@teklif.et" className="text-violet-600 hover:underline">destek@teklif.et</a>
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