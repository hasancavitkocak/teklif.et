import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send, Heart, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

type ChatProps = {
  matchedUser: {
    id: string;
    name: string;
    age: number;
    city: string;
    photo_url?: string;
    gender: string;
  };
  onBack: () => void;
};

export default function Chat({ matchedUser, onBack }: ChatProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    const interval = setInterval(() => {
      fetchMessages();
      markMessagesAsRead();
    }, 3000); // Poll for new messages every 3 seconds
    return () => clearInterval(interval);
  }, [profile, matchedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${matchedUser.id}),and(sender_id.eq.${matchedUser.id},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!profile) return;

    try {
      // Mark all unread messages from this user as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', matchedUser.id)
        .eq('receiver_id', profile.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: profile.id,
          receiver_id: matchedUser.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white p-6 flex items-center gap-4 shadow-lg">
        <button
          onClick={onBack}
          className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            {matchedUser.photo_url ? (
              <img
                src={matchedUser.photo_url}
                alt={matchedUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <span className="text-white font-bold text-lg">
                  {matchedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          
          <div>
            <h3 className="font-bold text-white text-lg">
              {matchedUser.name}, {matchedUser.age}
            </h3>
            <p className="text-sm text-pink-100 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {matchedUser.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-pink-50/50 via-white to-rose-50/30">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Konuşma başlasın! 💕
            </h3>
            <p className="text-gray-500">
              İlk mesajı göndererek bu güzel eşleşmeyi başlatın
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.sender_id === profile?.id;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center">
                      <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-600 shadow-sm">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-600">
                            {matchedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-lg ${
                          isOwn
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-pink-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-100 p-6">
        <form onSubmit={sendMessage} className="flex gap-4 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-3xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Enter tuşuna basarak mesaj gönderebilirsiniz
        </p>
      </div>
    </div>
  );
}