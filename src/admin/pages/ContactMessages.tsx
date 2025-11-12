import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Clock, CheckCircle, XCircle, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type ContactMessage = {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  admin_reply?: string;
  created_at: string;
};

export default function ContactMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'closed'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [filter]);

  const loadMessages = async () => {
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (messageId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;
      await loadMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Durum güncellenemedi');
    }
  };

  const sendReply = async () => {
    if (!selectedMessage || !reply.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          status: 'replied',
          admin_reply: reply,
          replied_by: user?.id,
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      await loadMessages();
      setSelectedMessage(null);
      setReply('');
      alert('Yanıt gönderildi!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Yanıt gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: 'Yeni',
      read: 'Okundu',
      replied: 'Yanıtlandı',
      closed: 'Kapatıldı',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">İletişim Mesajları</h1>
        <div className="flex gap-2">
          {['all', 'new', 'read', 'replied', 'closed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tümü' : getStatusLabel(f)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Yeni</p>
              <p className="text-2xl font-bold text-gray-800">
                {messages.filter((m) => m.status === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Okundu</p>
              <p className="text-2xl font-bold text-gray-800">
                {messages.filter((m) => m.status === 'read').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Yanıtlandı</p>
              <p className="text-2xl font-bold text-gray-800">
                {messages.filter((m) => m.status === 'replied').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Kapatıldı</p>
              <p className="text-2xl font-bold text-gray-800">
                {messages.filter((m) => m.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Henüz mesaj bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gönderen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Konu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{message.name}</p>
                        <p className="text-sm text-gray-500">{message.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{message.subject}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {getStatusLabel(message.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(message.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          if (message.status === 'new') {
                            updateStatus(message.id, 'read');
                          }
                        }}
                        className="text-violet-500 hover:text-violet-600 font-medium"
                      >
                        Görüntüle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Mesaj Detayı</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gönderen
                  </label>
                  <p className="text-gray-800">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <p className="text-gray-800">{selectedMessage.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                <p className="text-gray-800">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj</label>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.admin_reply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Yanıtı
                  </label>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedMessage.admin_reply}
                    </p>
                  </div>
                </div>
              )}

              {selectedMessage.status !== 'replied' && selectedMessage.status !== 'closed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yanıt Yaz
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Yanıtınızı buraya yazın..."
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="mt-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Gönderiliyor...' : 'Yanıtla'}
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                {selectedMessage.status !== 'closed' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedMessage.id, 'closed');
                      setSelectedMessage(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600"
                  >
                    Kapat
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
