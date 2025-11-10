import { Cookie } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
          <Cookie className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Çerez Politikası</h1>
          <p className="text-gray-600">Son güncelleme: 10 Kasım 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Çerez Nedir?</h2>
          <p className="text-gray-600 leading-relaxed">
            Çerezler, ziyaret ettiğiniz web sitesi veya uygulama tarafından cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin veya uygulamanın daha verimli çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Çerez Türleri</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Zorunlu Çerezler</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Uygulamanın temel işlevlerini yerine getirmesi için gereklidir. Oturum yönetimi, güvenlik ve kimlik doğrulama gibi kritik işlevleri sağlar. Bu çerezler olmadan uygulama düzgün çalışmaz.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Performans Çerezleri</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Uygulamanın nasıl kullanıldığına dair anonim bilgiler toplar. Hangi sayfaların ziyaret edildiği, hata mesajları ve sayfa yükleme süreleri gibi verileri içerir. Bu bilgiler uygulamayı geliştirmek için kullanılır.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">İşlevsellik Çerezleri</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tercihlerinizi hatırlar (dil seçimi, tema, filtre ayarları gibi) ve kişiselleştirilmiş bir deneyim sunar. Bu çerezler olmadan bazı özellikler çalışmayabilir.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Hedefleme/Reklam Çerezleri</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                İlgi alanlarınıza uygun reklamlar göstermek için kullanılır. Hangi sayfaları ziyaret ettiğinizi ve hangi bağlantılara tıkladığınızı takip eder. Bu çerezler için onayınız gereklidir.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Kullandığımız Çerezler</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Çerez Adı</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Tür</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Süre</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Amaç</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-gray-700">session_id</td>
                  <td className="px-4 py-3 text-gray-600">Zorunlu</td>
                  <td className="px-4 py-3 text-gray-600">Oturum</td>
                  <td className="px-4 py-3 text-gray-600">Kullanıcı oturumunu yönetir</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">auth_token</td>
                  <td className="px-4 py-3 text-gray-600">Zorunlu</td>
                  <td className="px-4 py-3 text-gray-600">30 gün</td>
                  <td className="px-4 py-3 text-gray-600">Kimlik doğrulama</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">preferences</td>
                  <td className="px-4 py-3 text-gray-600">İşlevsellik</td>
                  <td className="px-4 py-3 text-gray-600">1 yıl</td>
                  <td className="px-4 py-3 text-gray-600">Kullanıcı tercihlerini saklar</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">analytics</td>
                  <td className="px-4 py-3 text-gray-600">Performans</td>
                  <td className="px-4 py-3 text-gray-600">2 yıl</td>
                  <td className="px-4 py-3 text-gray-600">Kullanım istatistikleri</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-700">marketing</td>
                  <td className="px-4 py-3 text-gray-600">Reklam</td>
                  <td className="px-4 py-3 text-gray-600">6 ay</td>
                  <td className="px-4 py-3 text-gray-600">Hedefli reklamlar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Üçüncü Taraf Çerezleri</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Uygulamamızda aşağıdaki üçüncü taraf hizmetler çerez kullanabilir:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li><strong>Google Analytics:</strong> Kullanım istatistikleri ve analiz</li>
            <li><strong>Facebook Pixel:</strong> Reklam performansı ve hedefleme</li>
            <li><strong>Stripe/PayPal:</strong> Ödeme işlemleri</li>
            <li><strong>Firebase:</strong> Bildirimler ve uygulama performansı</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Bu hizmetlerin çerez politikaları için ilgili şirketlerin web sitelerini ziyaret edebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Çerezleri Yönetme</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Çerez tercihlerinizi aşağıdaki yöntemlerle yönetebilirsiniz:
          </p>
          
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Uygulama Ayarları</h3>
              <p className="text-gray-600 text-sm">
                Profil → Ayarlar → Gizlilik → Çerez Tercihleri bölümünden çerez ayarlarınızı değiştirebilirsiniz.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Tarayıcı Ayarları</h3>
              <p className="text-gray-600 text-sm">
                Tarayıcınızın ayarlar menüsünden çerezleri engelleyebilir veya silebilirsiniz. Ancak bu durumda bazı özellikler çalışmayabilir.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2">Mobil Cihaz Ayarları</h3>
              <p className="text-gray-600 text-sm">
                iOS: Ayarlar → Gizlilik → Takip → Uygulamaların Takip Etmesine İzin Verme<br/>
                Android: Ayarlar → Google → Reklamlar → Reklam Kişiselleştirmeyi Devre Dışı Bırak
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Çerezleri Reddetmenin Sonuçları</h2>
          <p className="text-gray-600 leading-relaxed">
            Zorunlu çerezleri reddetmeniz durumunda uygulama düzgün çalışmayabilir. Diğer çerezleri reddetmeniz halinde bazı özellikler (otomatik giriş, tercih hatırlama, kişiselleştirilmiş içerik) kullanılamayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Çocukların Gizliliği</h2>
          <p className="text-gray-600 leading-relaxed">
            Uygulamamız 18 yaş altı kullanıcılara yönelik değildir. Bilerek 18 yaş altı kişilerden çerez veya kişisel veri toplamıyoruz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Politika Güncellemeleri</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda sizi bilgilendireceğiz. Güncel versiyonu düzenli olarak kontrol etmenizi öneririz.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. İletişim</h2>
          <p className="text-gray-600 leading-relaxed">
            Çerez politikamız hakkında sorularınız için:
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">E-posta: privacy@example.com</p>
          </div>
        </section>

        <section className="bg-amber-50 rounded-xl p-6 border border-amber-100">
          <h3 className="font-semibold text-gray-800 mb-2">🍪 Çerez Onayı</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Uygulamamızı kullanarak zorunlu çerezlerin kullanımını kabul etmiş olursunuz. Diğer çerez türleri için tercihlerinizi ayarlar bölümünden belirtebilirsiniz.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg transition-all">
            Çerez Tercihlerini Yönet
          </button>
        </section>
      </div>
    </div>
  );
}
