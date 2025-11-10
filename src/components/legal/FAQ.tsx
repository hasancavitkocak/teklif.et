import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "Uygulama nasıl çalışır?",
    answer: "Uygulamamız, size yakın kişileri keşfetmenizi ve onlarla bağlantı kurmanızı sağlar. Profil oluşturun, tercihlerinizi belirleyin ve size uygun kişileri keşfedin. Beğendiğiniz kişilere teklif gönderin, karşılıklı beğeni durumunda eşleşin ve sohbet etmeye başlayın."
  },
  {
    question: "Premium üyelik ne sağlar?",
    answer: "Premium üyelikle sınırsız teklif gönderme, profilinizi öne çıkarma (boost), kimler profilinizi görüntüledi özelliği, gelişmiş filtreleme seçenekleri ve reklamsız deneyim gibi avantajlardan yararlanabilirsiniz."
  },
  {
    question: "Günlük teklif limiti nedir?",
    answer: "Ücretsiz kullanıcılar günde 3 teklif gönderebilir. Bu limit her 24 saatte bir sıfırlanır. Premium üyeler sınırsız teklif gönderebilir."
  },
  {
    question: "Eşleşme nasıl gerçekleşir?",
    answer: "İki kullanıcı birbirine teklif gönderdiğinde veya gönderilen teklif kabul edildiğinde eşleşme gerçekleşir. Eşleşme sonrası mesajlaşma özelliği aktif hale gelir."
  },
  {
    question: "Fotoğraflarım güvende mi?",
    answer: "Evet, tüm fotoğraflarınız güvenli sunucularda saklanır ve sadece uygulamayı kullanan diğer kullanıcılar tarafından görülebilir. Fotoğraflarınızı istediğiniz zaman silebilir veya değiştirebilirsiniz."
  },
  {
    question: "Hesabımı nasıl silebilirim?",
    answer: "Profil sayfanızdan 'Hesap Ayarları' bölümüne giderek hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz ve tüm verileriniz silinir."
  },
  {
    question: "Birini nasıl engellerim?",
    answer: "Kullanıcı profilinde bulunan üç nokta menüsünden 'Engelle' seçeneğini kullanabilirsiniz. Engellenen kullanıcılar size teklif gönderemez ve profilinizi göremez."
  },
  {
    question: "Konum bilgim paylaşılıyor mu?",
    answer: "Tam konum bilginiz asla paylaşılmaz. Sadece şehir bilginiz ve yaklaşık mesafe (km cinsinden) diğer kullanıcılara gösterilir."
  },
  {
    question: "Boost özelliği ne işe yarar?",
    answer: "Boost özelliği profilinizi 30 dakika boyunca bölgenizdeki diğer kullanıcılara öncelikli olarak gösterir. Bu sayede daha fazla kişi tarafından görülme şansınız artar."
  },
  {
    question: "Ödeme güvenli mi?",
    answer: "Tüm ödemeler güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kredi kartı bilgileriniz bizim sunucularımızda saklanmaz."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sıkça Sorulan Sorular</h1>
        <p className="text-gray-600">Merak ettiğiniz her şey burada</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-pink-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
        <h3 className="font-semibold text-gray-800 mb-2">Sorunuz yanıtlanmadı mı?</h3>
        <p className="text-gray-600 text-sm mb-4">
          Bizimle iletişime geçmekten çekinmeyin. Size yardımcı olmaktan mutluluk duyarız.
        </p>
        <button className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:shadow-lg transition-all">
          İletişime Geç
        </button>
      </div>
    </div>
  );
}
