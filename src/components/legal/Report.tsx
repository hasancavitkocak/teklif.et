import { AlertCircle, Send, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Report() {
  const [formData, setFormData] = useState({
    reportType: '',
    reportedUser: '',
    description: '',
    evidence: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setSending(false);
    setFormData({ reportType: '', reportedUser: '', description: '', evidence: '' });
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bildir</h1>
          <p className="text-gray-600">Uygunsuz davranış veya içerik bildirin</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mb-8">
        <div className="flex gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Güvenliğiniz Önceliğimiz</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tüm bildirimler gizli tutulur ve ciddi şekilde değerlendirilir. Uygunsuz davranış gösteren kullanıcılar hakkında hızlı aksiyon alınır. Acil durumlarda lütfen yerel yetkililere başvurun.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
            ✓ Bildiriminiz alındı. En kısa sürede incelenecek ve gerekli aksiyonlar alınacaktır. Teşekkür ederiz.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bildirim Türü *
            </label>
            <select
              required
              value={formData.reportType}
              onChange={(e) => setFormData({...formData, reportType: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
            >
              <option value="">Seçiniz</option>
              <option value="harassment">Taciz veya Zorbalık</option>
              <option value="fake">Sahte Profil</option>
              <option value="inappropriate">Uygunsuz İçerik</option>
              <option value="spam">Spam veya Dolandırıcılık</option>
              <option value="underage">18 Yaş Altı Kullanıcı</option>
              <option value="violence">Şiddet veya Tehdit</option>
              <option value="hate">Nefret Söylemi</option>
              <option value="privacy">Gizlilik İhlali</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bildirilen Kullanıcı (Opsiyonel)
            </label>
            <input
              type="text"
              value={formData.reportedUser}
              onChange={(e) => setFormData({...formData, reportedUser: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
              placeholder="Kullanıcı adı veya profil linki"
            />
            <p className="text-xs text-gray-500 mt-2">
              Belirli bir kullanıcıyı bildiriyorsanız adını veya profil linkini yazın
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
              placeholder="Lütfen durumu detaylı bir şekilde açıklayın. Ne oldu? Ne zaman oldu? Hangi davranışlar sizi rahatsız etti?"
            />
            <p className="text-xs text-gray-500 mt-2">
              Detaylı açıklama, bildiriminizin daha hızlı değerlendirilmesine yardımcı olur
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Kanıt/Ekran Görüntüsü (Opsiyonel)
            </label>
            <textarea
              value={formData.evidence}
              onChange={(e) => setFormData({...formData, evidence: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all resize-none"
              placeholder="Ekran görüntüsü linki veya ek bilgiler"
            />
            <p className="text-xs text-gray-500 mt-2">
              Varsa ekran görüntüsü veya mesaj kayıtlarının linkini paylaşabilirsiniz
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Önemli:</strong> Yanlış veya kötü niyetli bildirimler hesabınızın askıya alınmasına neden olabilir. Lütfen sadece gerçek ve ciddi durumları bildirin.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
          </button>
        </form>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-purple-50 rounded-2xl p-6 border border-red-100">
          <h3 className="font-semibold text-gray-800 mb-3">🚨 Acil Durum</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fiziksel tehlike altındaysanız veya acil yardıma ihtiyacınız varsa:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700"><strong>Polis:</strong> 155</p>
            <p className="text-gray-700"><strong>Jandarma:</strong> 156</p>
            <p className="text-gray-700"><strong>Kadın Acil Hattı:</strong> 183</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-3">💬 Destek Ekibi</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bildiriminiz hakkında daha fazla bilgi vermek isterseniz:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700"><strong>E-posta:</strong> report@example.com</p>
            <p className="text-gray-700"><strong>Canlı Destek:</strong> 7/24 Aktif</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Bildirim Sonrası Ne Olur?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Bildiriminiz güvenlik ekibimiz tarafından incelenir (genellikle 24 saat içinde)</li>
          <li>Gerekirse bildirilen kullanıcıdan açıklama istenir</li>
          <li>Durum değerlendirilir ve uygun aksiyon alınır (uyarı, askıya alma, hesap kapatma)</li>
          <li>Ciddi durumlarda yetkili makamlara bildirim yapılır</li>
          <li>Bildiriminizin sonucu hakkında e-posta ile bilgilendirilirsiniz</li>
        </ol>
      </div>
    </div>
  );
}
