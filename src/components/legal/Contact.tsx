import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Contact() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        user_id: user?.id || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new',
      });

      if (error) throw error;

      setSent(true);
      setFormData({
        name: profile?.name || '',
        email: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Mesaj gönderilemedi, lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">İletişim</h1>
          <p className="text-gray-600">
            Sorularınız, önerileriniz veya sorunlarınız için bize ulaşın
          </p>
        </div>

        {sent && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adınız *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              placeholder="Adınızı girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresiniz *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konu *
            </label>
            <select
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            >
              <option value="">Konu seçin</option>
              <option value="Teknik Destek">Teknik Destek</option>
              <option value="Hesap Sorunu">Hesap Sorunu</option>
              <option value="Ödeme Sorunu">Ödeme Sorunu</option>
              <option value="Öneri">Öneri</option>
              <option value="Şikayet">Şikayet</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesajınız *
            </label>
            <textarea
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
              placeholder="Mesajınızı buraya yazın..."
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Gönder
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Diğer İletişim Yolları</h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong>E-posta:</strong> destek@example.com
            </p>
            <p>
              <strong>Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00
            </p>
            <p className="text-sm text-gray-500">
              Genellikle 24 saat içinde yanıt veriyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
