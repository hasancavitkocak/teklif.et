import { useEffect, useState } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Offers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_offers')
        .select('*, creator:creator_id(name, city)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await supabase.from('activity_offers').delete().eq('id', id);
      fetchOffers();
    } catch (error) {
      alert('Silme başarısız');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Talep Yönetimi</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Başlık</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Oluşturan</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Kategori</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Durum</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{offer.title}</td>
                <td className="px-6 py-4">{offer.creator?.name}</td>
                <td className="px-6 py-4">{offer.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${offer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteOffer(offer.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
