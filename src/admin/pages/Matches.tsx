import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Matches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*, sender:sender_id(name), receiver:receiver_id(name)')
        .eq('status', 'matched')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Eşleşme Yönetimi</h1>
      
      <div className="grid gap-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">
                  {match.sender?.name} ❤️ {match.receiver?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(match.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                Eşleşti
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
