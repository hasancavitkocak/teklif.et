import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Offers from './pages/Offers';
import Matches from './pages/Matches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ContactMessages from './pages/ContactMessages';
import PremiumSettings from './pages/PremiumSettings';

type AdminPage = 'dashboard' | 'users' | 'offers' | 'matches' | 'reports' | 'settings' | 'contact' | 'premium';

export default function AdminApp() {
  const { profile, refreshProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;
  
  console.log('Admin Panel - Profile:', profile);
  console.log('Admin Panel - is_admin:', profile?.is_admin);
  console.log('Admin Panel - isAdmin:', isAdmin);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz yok.</p>
          <button
            onClick={async () => {
              await refreshProfile();
              window.location.reload();
            }}
            className="px-6 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            Profili Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'users' && <Users />}
      {currentPage === 'offers' && <Offers />}
      {currentPage === 'matches' && <Matches />}
      {currentPage === 'reports' && <Reports />}
      {currentPage === 'contact' && <ContactMessages />}
      {currentPage === 'premium' && <PremiumSettings />}
      {currentPage === 'settings' && <Settings />}
    </AdminLayout>
  );
}
