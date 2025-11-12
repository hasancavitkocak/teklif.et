import { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Heart, 
  Flag, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Mail,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AdminPage = 'dashboard' | 'users' | 'offers' | 'matches' | 'reports' | 'contact' | 'premium' | 'settings';

type Props = {
  children: ReactNode;
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
};

export default function AdminLayout({ children, currentPage, onNavigate }: Props) {
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as AdminPage, icon: LayoutDashboard, label: 'Dashboard', color: 'text-blue-500' },
    { id: 'users' as AdminPage, icon: Users, label: 'Kullanıcılar', color: 'text-green-500' },
    { id: 'offers' as AdminPage, icon: FileText, label: 'Talepler', color: 'text-purple-500' },
    { id: 'matches' as AdminPage, icon: Heart, label: 'Eşleşmeler', color: 'text-violet-500' },
    { id: 'reports' as AdminPage, icon: Flag, label: 'Raporlar', color: 'text-orange-500' },
    { id: 'contact' as AdminPage, icon: Mail, label: 'İletişim', color: 'text-cyan-500' },
    { id: 'premium' as AdminPage, icon: Crown, label: 'Premium', color: 'text-yellow-500' },
    { id: 'settings' as AdminPage, icon: Settings, label: 'Ayarlar', color: 'text-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 
          w-64 transform transition-transform duration-300 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-600 mt-1">{profile?.name}</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
