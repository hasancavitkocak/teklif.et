import { useEffect, useState } from 'react';
import { Search, Crown, Ban, Trash2, Edit } from 'lucide-react';
import { supabase, Profile } from '../../lib/supabase';

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');

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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;
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
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'premium', 'free'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterPremium(filter)}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  filterPremium === filter
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
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
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
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
    </div>
  );
}
