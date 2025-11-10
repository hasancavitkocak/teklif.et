import { Send } from 'lucide-react';
import { useState } from 'react';

export default function Help() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
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
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Yardım & İletişim</h1>
        <p className="text-gray-600">Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bize Mesaj Gönderin</h2>
          <p className="text-gray-600">Sorularınız, önerileriniz veya sorunlarınız için formu doldurun</p>
        </div>
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
            ✓ Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adınız
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konu
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            >
              <option value="">Konu seçin</option>
              <option value="technical">Teknik Sorun</option>
              <option value="account">Hesap Sorunu</option>
              <option value="payment">Ödeme Sorunu</option>
              <option value="report">Şikayet/Bildirim</option>
              <option value="suggestion">Öneri</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mesajınız
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Gönderiliyor...' : 'Mesajı Gönder'}
          </button>
        </form>
      </div>

    </div>
  );
}
