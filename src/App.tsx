import { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { LocationProvider } from './contexts/LocationContext';
import LocationPermissionModal from './components/LocationPermissionModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useNotifications } from './hooks/useNotifications';
import { useCapacitor } from './hooks/useCapacitor';
import { usePushNotifications } from './hooks/usePushNotifications';
import Auth from './components/Auth';
import Layout from './components/Layout';

// Lazy load components for better performance
const DiscoverOffers = lazy(() => import('./components/DiscoverOffers'));
const Offers = lazy(() => import('./components/Offers'));
const Matches = lazy(() => import('./components/Matches'));
const Premium = lazy(() => import('./components/Premium'));
const Profile = lazy(() => import('./components/Profile'));
const FAQ = lazy(() => import('./components/legal/FAQ'));
const Help = lazy(() => import('./components/legal/Help'));
const Report = lazy(() => import('./components/legal/Report'));
const Contact = lazy(() => import('./components/legal/Contact'));
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/legal/TermsOfService'));
const KVKK = lazy(() => import('./components/legal/KVKK'));
const CookiePolicy = lazy(() => import('./components/legal/CookiePolicy'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

type Page = 'discover' | 'offers' | 'matches' | 'premium' | 'profile' | 'faq' | 'help' | 'report' | 'contact' | 'privacy' | 'terms' | 'kvkk' | 'cookies' | 'admin';

function AppContent() {
  const { user, loading } = useAuth();
  useNotifications(); // Initialize real-time notifications
  useCapacitor(); // Initialize Capacitor
  usePushNotifications(); // Initialize push notifications
  
  // Check URL for admin route
  const isAdminRoute = window.location.pathname === '/admin';
  const [currentPage, setCurrentPage] = useState<Page>(isAdminRoute ? 'admin' : 'discover');

  // Debug logging for mobile
  useEffect(() => {
    console.log('AppContent - loading:', loading, 'user:', !!user);
  }, [loading, user]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handle URL changes
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('discover');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }



  // Admin panel check
  if (currentPage === 'admin') {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Admin paneli yükleniyor...</p>
          </div>
        </div>
      }>
        <AdminApp />
      </Suspense>
    );
  }

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <Suspense fallback={<LoadingSpinner />}>
        {currentPage === 'discover' && <DiscoverOffers onNavigate={setCurrentPage} />}
        {currentPage === 'offers' && <Offers />}
        {currentPage === 'matches' && <Matches />}
        {currentPage === 'premium' && <Premium />}
        {currentPage === 'profile' && <Profile onNavigate={setCurrentPage} />}
        {currentPage === 'faq' && <FAQ />}
        {currentPage === 'help' && <Help />}
        {currentPage === 'report' && <Report />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
        {currentPage === 'kvkk' && <KVKK />}
        {currentPage === 'cookies' && <CookiePolicy />}
      </Suspense>
      <LocationPermissionModal />
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ModalProvider>
          <LocationProvider>
            <AppContent />
          </LocationProvider>
        </ModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
