import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Offers from './pages/Offers';
import Matches from './pages/Matches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

type AdminPage = 'dashboard' | 'users' | 'offers' | 'matches' | 'reports' | 'settings';

export default function AdminApp() {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

  // Check if user is admin
  const isAdmin = profile?.is_admin === true;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
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
      {currentPage === 'settings' && <Settings />}
    </AdminLayout>
  );
}
