import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { useNotifications } from './hooks/useNotifications';
import { useCapacitor } from './hooks/useCapacitor';
import { usePushNotifications } from './hooks/usePushNotifications';
import Auth from './components/Auth';
import Layout from './components/Layout';
import DiscoverOffers from './components/DiscoverOffers';
import Offers from './components/Offers';
import Matches from './components/Matches';
import Premium from './components/Premium';
import Profile from './components/Profile';
import FAQ from './components/legal/FAQ';
import Help from './components/legal/Help';
import Report from './components/legal/Report';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import KVKK from './components/legal/KVKK';
import CookiePolicy from './components/legal/CookiePolicy';

type Page = 'discover' | 'offers' | 'matches' | 'premium' | 'profile' | 'faq' | 'help' | 'report' | 'privacy' | 'terms' | 'kvkk' | 'cookies';

function AppContent() {
  const { user, loading } = useAuth();
  useNotifications(); // Initialize real-time notifications
  useCapacitor(); // Initialize Capacitor
  usePushNotifications(); // Initialize push notifications
  const [currentPage, setCurrentPage] = useState<Page>('discover');

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'discover' && <DiscoverOffers onNavigate={setCurrentPage} />}
      {currentPage === 'offers' && <Offers />}
      {currentPage === 'matches' && <Matches />}
      {currentPage === 'premium' && <Premium />}
      {currentPage === 'profile' && <Profile onNavigate={setCurrentPage} />}
      {currentPage === 'faq' && <FAQ />}
      {currentPage === 'help' && <Help />}
      {currentPage === 'report' && <Report />}
      {currentPage === 'privacy' && <PrivacyPolicy />}
      {currentPage === 'terms' && <TermsOfService />}
      {currentPage === 'kvkk' && <KVKK />}
      {currentPage === 'cookies' && <CookiePolicy />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
