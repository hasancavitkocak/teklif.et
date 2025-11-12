import { useEffect, useState } from 'react';
import { Search, Crown, Trash2, Eye, X, Mail, Calendar, MapPin, Heart, MessageSquare } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';

type UserStats = {
  total_offers_sent: number;
  total_offers_received: number;
  total_matches: number;
  total_messages: number;
};

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filterPremium]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterPremium === 'premium') {
        query = query.eq('is_premium', true);
      } else if (filterPremium === 'free') {
        query = query.eq('is_premium', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error toggling premium:', error);
      alert('İşlem başarısız');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Silme işlemi başarısız');
    }
  };

  const viewUserDetails = async (user: Profile) => {
    setSelectedUser(user);
    setLoadingStats(true);

    try {
      // Get offers sent
      const { count: sentCount } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      // Get offers received
      const { count: receivedCount } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id);

      // Get matches
      const { count: matchesCount } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      // Get messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      setUserStats({
        total_offers_sent: sentCount || 0,
        total_offers_received: receivedCount || 0,
        total_matches: matchesCount || 0,
        total_messages: messagesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Tüm kullanıcıları görüntüle ve yönet</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'premium', 'free'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterPremium(filter)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterPremium === filter
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'Tümü' : filter === 'premium' ? 'Premium' : 'Ücretsiz'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kullanıcı</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Şehir</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{user.name}, {user.age}</p>
                        <p className="text-sm text-gray-500">{user.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.city}</td>
                  <td className="px-6 py-4">
                    {user.is_premium ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        Premium
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        Ücretsiz
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="w-5 h-5 text-blue-500" />
                      </button>
                      <button
                        onClick={() => togglePremium(user.id, user.is_premium)}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                        title={user.is_premium ? 'Premium İptal' : 'Premium Yap'}
                      >
                        <Crown className={`w-5 h-5 ${user.is_premium ? 'text-yellow-500' : 'text-gray-400'}`} />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-center text-gray-600">
        Toplam {filteredUsers.length} kullanıcı
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Kullanıcı Detayları</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="flex items-start gap-6">
                {selectedUser.photo_url ? (
                  <img
                    src={selectedUser.photo_url}
                    alt={selectedUser.name}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 text-4xl font-bold">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedUser.name}, {selectedUser.age}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {selectedUser.gender}
                    </span>
                    {selectedUser.is_premium && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        Premium
                      </span>
                    )}
                    {selectedUser.is_admin && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Admin
                      </span>
                    )}
                    {selectedUser.is_boosted && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Boost Aktif
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedUser.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Kayıt: {new Date(selectedUser.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Hakkında</h4>
                  <p className="text-gray-600">{selectedUser.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">İstatistikler</h4>
                {loadingStats ? (
                  <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : userStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">Gönderilen</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">{userStats.total_offers_sent}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Alınan</span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">{userStats.total_offers_received}</p>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-violet-600" />
                        <span className="text-sm text-violet-700 font-medium">Eşleşme</span>
                      </div>
                      <p className="text-2xl font-bold text-violet-800">{userStats.total_matches}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-purple-700 font-medium">Mesaj</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">{userStats.total_messages}</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Teklif Bilgileri</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Günlük Teklif: {selectedUser.daily_offers_count}</p>
                    <p>Toplam Gönderilen: {selectedUser.total_offers_sent}</p>
                    <p>Ücretsiz Kullanılan: {selectedUser.free_offers_used}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Premium Bilgileri</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Süper Beğeni: {selectedUser.super_likes_remaining || 0}</p>
                    {selectedUser.boost_expires_at && (
                      <p>Boost Bitiş: {new Date(selectedUser.boost_expires_at).toLocaleString('tr-TR')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
