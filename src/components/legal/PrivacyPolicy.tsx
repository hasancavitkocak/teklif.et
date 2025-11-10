import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gizlilik Sözleşmesi</h1>
          <p className="text-gray-600">Son güncelleme: 10 Kasım 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Giriş</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu Gizlilik Sözleşmesi, uygulamamızı kullanırken toplanan, işlenen ve saklanan kişisel verilerinizin nasıl korunduğunu açıklar. Gizliliğiniz bizim için son derece önemlidir ve verilerinizi korumak için en yüksek standartları uygularız.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Toplanan Bilgiler</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Uygulamamızı kullanırken aşağıdaki bilgiler toplanabilir:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Ad, yaş, cinsiyet gibi profil bilgileri</li>
            <li>E-posta adresi ve telefon numarası</li>
            <li>Konum bilgisi (şehir ve yaklaşık mesafe)</li>
            <li>Profil fotoğrafları ve galeri görselleri</li>
            <li>Uygulama içi aktivite ve etkileşim verileri</li>
            <li>Cihaz bilgileri ve IP adresi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Bilgilerin Kullanımı</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Toplanan bilgiler şu amaçlarla kullanılır:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Hizmetlerimizi sağlamak ve geliştirmek</li>
            <li>Size uygun eşleşmeler önermek</li>
            <li>Hesap güvenliğinizi sağlamak</li>
            <li>Müşteri desteği sunmak</li>
            <li>Yasal yükümlülükleri yerine getirmek</li>
            <li>Dolandırıcılık ve kötüye kullanımı önlemek</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Bilgi Paylaşımı</h2>
          <p className="text-gray-600 leading-relaxed">
            Kişisel bilgileriniz, açık rızanız olmadan üçüncü şahıslarla paylaşılmaz. Ancak yasal zorunluluklar, mahkeme kararları veya güvenlik nedenleriyle bilgi paylaşımı gerekebilir. Hizmet sağlayıcılarımız (sunucu, ödeme sistemleri) verilerinize sadece hizmet sunmak amacıyla erişebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Veri Güvenliği</h2>
          <p className="text-gray-600 leading-relaxed">
            Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanırız. Tüm veriler şifrelenmiş bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır. Ancak internet üzerinden veri iletiminin %100 güvenli olmadığını unutmayın.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Çerezler</h2>
          <p className="text-gray-600 leading-relaxed">
            Uygulamamız, kullanıcı deneyimini iyileştirmek için çerezler ve benzeri teknolojiler kullanır. Çerez kullanımı hakkında detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Haklarınız</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
            <li>Verilerin silinmesini veya yok edilmesini isteme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Değişiklikler</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu Gizlilik Sözleşmesi zaman zaman güncellenebilir. Önemli değişiklikler olduğunda sizi bilgilendireceğiz. Güncel sürümü düzenli olarak kontrol etmenizi öneririz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. İletişim</h2>
          <p className="text-gray-600 leading-relaxed">
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">E-posta: privacy@example.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
