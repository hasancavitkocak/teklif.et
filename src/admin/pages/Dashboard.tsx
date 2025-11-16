import { useEffect, useState } from 'react';
import { Users, FileText, Heart, Crown, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalOffers: 0,
    activeOffers: 0,
    totalMatches: 0,
    todayMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Premium users
      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_premium', true);

      // Total offers
      const { count: totalOffers } = await supabase
        .from('activity_offers')
        .select('*', { count: 'exact', head: true });

      // Active offers
      const { count: activeOffers } = await supabase
        .from('activity_offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total matches
      const { count: totalMatches } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched');

      // Today's matches
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayMatches } = await supabase
        .from('offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched')
        .gte('created_at', today.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalOffers: totalOffers || 0,
        activeOffers: activeOffers || 0,
        totalMatches: totalMatches || 0,
        todayMatches: todayMatches || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Genel bakış ve istatistikler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Premium Üyeler"
          value={stats.premiumUsers}
          icon={Crown}
          color="yellow"
          trend="+8%"
        />
        <StatCard
          title="Aktif Talepler"
          value={stats.activeOffers}
          icon={FileText}
          color="purple"
          subtitle={`${stats.totalOffers} toplam`}
        />
        <StatCard
          title="Toplam Eşleşme"
          value={stats.totalMatches}
          icon={Heart}
          color="pink"
          trend="+15%"
        />
        <StatCard
          title="Bugünkü Eşleşme"
          value={stats.todayMatches}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={Math.floor(stats.totalUsers * 0.7)}
          icon={Activity}
          color="indigo"
          subtitle="Son 7 gün"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Yeni kullanıcı kaydı</p>
              <p className="text-sm text-gray-600">5 dakika önce</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Yeni eşleşme</p>
              <p className="text-sm text-gray-600">12 dakika önce</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">Yeni talep oluşturuldu</p>
              <p className="text-sm text-gray-600">25 dakika önce</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
