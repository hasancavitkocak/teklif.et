import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Sözleşmesi</h1>
          <p className="text-gray-600">Son güncelleme: 10 Kasım 2025</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. Sözleşmenin Konusu</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu sözleşme, uygulamamızın kullanım şartlarını belirler. Uygulamayı kullanarak bu şartları kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız uygulamayı kullanmamalısınız.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. Kullanıcı Yükümlülükleri</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Kullanıcı olarak aşağıdaki kurallara uymayı kabul edersiniz:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>18 yaşından büyük olduğunuzu beyan edersiniz</li>
            <li>Doğru ve güncel bilgiler sağlayacaksınız</li>
            <li>Hesap güvenliğinizden siz sorumlusunuz</li>
            <li>Başkasının hesabını kullanmayacaksınız</li>
            <li>Yasalara ve toplum kurallarına uygun davranacaksınız</li>
            <li>Diğer kullanıcılara saygılı olacaksınız</li>
            <li>Spam, taciz veya dolandırıcılık yapmayacaksınız</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. Yasak Davranışlar</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Aşağıdaki davranışlar kesinlikle yasaktır:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
            <li>Sahte profil oluşturmak</li>
            <li>Başkasının kimliğine bürünmek</li>
            <li>Uygunsuz içerik paylaşmak</li>
            <li>Taciz, tehdit veya zorbalık yapmak</li>
            <li>Ticari amaçlı kullanım</li>
            <li>Otomatik sistemler (bot) kullanmak</li>
            <li>Uygulamanın güvenliğini tehlikeye atmak</li>
            <li>Telif hakkı ihlali yapmak</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">4. İçerik Politikası</h2>
          <p className="text-gray-600 leading-relaxed">
            Paylaştığınız tüm içeriklerden (fotoğraf, mesaj, profil bilgileri) siz sorumlusunuz. Uygunsuz içerikler bildirildiğinde veya tespit edildiğinde kaldırılır ve hesabınız askıya alınabilir veya kapatılabilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. Premium Üyelik</h2>
          <p className="text-gray-600 leading-relaxed">
            Premium üyelik ücretli bir hizmettir. Ödeme yapıldıktan sonra hizmet aktif hale gelir. İptal durumunda kalan süre için iade yapılmaz. Fiyatlar önceden haber verilmeksizin değiştirilebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. Hesap Askıya Alma ve Kapatma</h2>
          <p className="text-gray-600 leading-relaxed">
            Kullanım şartlarını ihlal etmeniz durumunda hesabınız uyarı almadan askıya alınabilir veya kalıcı olarak kapatılabilir. Bu durumda ödemiş olduğunuz ücretler iade edilmez.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">7. Sorumluluk Reddi</h2>
          <p className="text-gray-600 leading-relaxed">
            Uygulama "olduğu gibi" sunulur. Kullanıcılar arasındaki etkileşimlerden, buluşmalardan veya ilişkilerden sorumlu değiliz. Güvenliğiniz için her zaman dikkatli olun ve kişisel bilgilerinizi koruyun.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. Fikri Mülkiyet</h2>
          <p className="text-gray-600 leading-relaxed">
            Uygulamanın tasarımı, logosu, içeriği ve yazılımı telif hakkı ile korunmaktadır. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. Değişiklikler</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu sözleşme herhangi bir zamanda güncellenebilir. Önemli değişiklikler olduğunda bilgilendirileceksiniz. Güncellemeden sonra uygulamayı kullanmaya devam etmeniz yeni şartları kabul ettiğiniz anlamına gelir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">10. Uygulanacak Hukuk</h2>
          <p className="text-gray-600 leading-relaxed">
            Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde çözülecektir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">11. İletişim</h2>
          <p className="text-gray-600 leading-relaxed">
            Kullanım şartları hakkında sorularınız için:
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">E-posta: legal@example.com</p>
          </div>
        </section>
      </div>
    </div>
  );
}
