import { Shield } from 'lucide-react';

export default function KVKK() {
  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">KVKK Aydınlatma Metni</h1>
          <p className="text-gray-600">Kişisel Verilerin Korunması Kanunu</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Veri Sorumlusu</h2>
          <p className="text-gray-600 leading-relaxed">
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla tarafımızca aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 font-semibold mb-2">Veri Sorumlusu:</p>
            <p className="text-gray-700">E-posta: kvkk@example.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. İşlenen Kişisel Veriler</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Uygulamamız kapsamında işlenen kişisel verileriniz:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, cinsiyet</li>
            <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası</li>
            <li><strong>Konum Bilgileri:</strong> Şehir, yaklaşık konum (GPS)</li>
            <li><strong>Görsel Veriler:</strong> Profil fotoğrafı, galeri görselleri</li>
            <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, cihaz bilgileri, log kayıtları</li>
            <li><strong>Pazarlama Bilgileri:</strong> Tercihler, ilgi alanları</li>
            <li><strong>Finansal Bilgiler:</strong> Ödeme bilgileri (üçüncü taraf ödeme sistemleri üzerinden)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Uygulama hizmetlerinin sunulması ve geliştirilmesi</li>
            <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
            <li>Eşleşme algoritmasının çalıştırılması</li>
            <li>Müşteri memnuniyeti ve destek hizmetlerinin sağlanması</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>İstatistiksel analiz ve raporlama</li>
            <li>Pazarlama ve tanıtım faaliyetleri (onay vermeniz halinde)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. Kişisel Verilerin Aktarılması</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Kişisel verileriniz aşağıdaki durumlarda aktarılabilir:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Hizmet sağlayıcılarımıza (sunucu, bulut hizmetleri, ödeme sistemleri)</li>
            <li>Yasal zorunluluklar gereği yetkili kamu kurum ve kuruluşlarına</li>
            <li>Mahkeme kararları ve yasal süreçler kapsamında</li>
            <li>İş ortaklarımıza (açık rızanız dahilinde)</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Yurt dışına veri aktarımı yapılması durumunda KVKK'nın 9. maddesi uyarınca gerekli önlemler alınmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Kişisel Verilerin Toplanma Yöntemi</h2>
          <p className="text-gray-600 leading-relaxed">
            Kişisel verileriniz, uygulama üzerinden kayıt olurken, profil oluştururken, uygulama içi etkileşimlerde bulunurken, müşteri hizmetleri ile iletişime geçerken ve otomatik yöntemlerle (çerezler, log kayıtları) toplanmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Kişisel Veri Sahibinin Hakları</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme ve yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Başvuru Yöntemi</h2>
          <p className="text-gray-600 leading-relaxed">
            Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici belgeler ile birlikte aşağıdaki yöntemlerle başvurabilirsiniz:
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="text-gray-700"><strong>E-posta:</strong> kvkk@example.com</p>
            <p className="text-gray-700"><strong>Uygulama içi:</strong> Profil → Ayarlar → KVKK Başvurusu</p>
          </div>
          <p className="text-gray-600 leading-relaxed mt-3">
            Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Veri Güvenliği</h2>
          <p className="text-gray-600 leading-relaxed">
            Kişisel verilerinizin güvenliğini sağlamak için teknik ve idari tedbirler alınmaktadır. Veriler şifreli olarak saklanmakta, yetkisiz erişimlere karşı korunmakta ve düzenli güvenlik denetimleri yapılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. Saklama Süresi</h2>
          <p className="text-gray-600 leading-relaxed">
            Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülükleri çerçevesinde saklanmaktadır. Saklama süresinin sona ermesi durumunda verileriniz silinir, yok edilir veya anonim hale getirilir.
          </p>
        </section>

        <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-2">Önemli Not</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Bu aydınlatma metni, KVKK'nın 10. maddesi uyarınca hazırlanmıştır. Kişisel verilerinizin işlenmesine ilişkin detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  );
}
