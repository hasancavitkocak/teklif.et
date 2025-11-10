import { useState, useEffect } from 'react';
import { Edit2, Save, X, LogOut, HelpCircle, Shield, FileText, Cookie, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PhotoGallery from './PhotoGallery';
import PhotoGalleryView from './PhotoGalleryView';
import { getFreeOffersLimit } from '../config/app.config';

const turkishCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Şanlıurfa', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir',
  'Samsun', 'Denizli', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum'
];

interface ProfileProps {
  onNavigate: (page: 'discover' | 'offers' | 'matches' | 'premium' | 'profile' | 'faq' | 'help' | 'report' | 'privacy' | 'terms' | 'kvkk' | 'cookies') => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
  const { profile, refreshProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    city: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        age: profile.age,
        city: profile.city,
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          age: formData.age,
          city: formData.city,
          bio: formData.bio || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      setMessage('Profil başarıyla güncellendi!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Profil güncellenemedi, lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        age: profile.age,
        city: profile.city,
        bio: profile.bio || '',
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profilim</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Düzenle
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.includes('başarıyla')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Compact header with profile photo */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 flex items-center gap-4">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border-3 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-3 border-white shadow-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-pink-100">{profile.city}</p>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Photo Gallery Section */}
          {isEditing && (
            <div className="mb-8 pb-8 border-b border-gray-200">
              <PhotoGallery />
            </div>
          )}
          
          {/* Photo Gallery View (Always Visible) */}
          {!isEditing && (
            <div className="mb-8">
              <PhotoGalleryView userId={profile.id} userName={profile.name} />
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yaş
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                >
                  {turkishCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hakkımda
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Kendinizden bahsedin..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm">Hakkımda</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">Üyelik</p>
                  <p className="text-base font-semibold text-gray-800">
                    {profile.is_premium ? '👑 Premium' : '🆓 Ücretsiz'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600 mb-1">Teklif Hakkı</p>
                  <p className="text-base font-semibold text-gray-800">
                    {profile.is_premium ? 'Sınırsız' : `${getFreeOffersLimit(profile.id) - profile.free_offers_used} / ${getFreeOffersLimit(profile.id)}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="mt-4 bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Hesap Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Üyelik Tarihi</span>
                <span className="font-medium text-gray-800">
                  {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Cinsiyet</span>
                <span className="font-medium text-gray-800 capitalize">
                  {profile.gender}
                </span>
              </div>
            </div>
          </div>

          {/* Yardım ve Yasal Bölümü */}
          <div className="mt-4 bg-white rounded-xl shadow overflow-hidden">
            <h3 className="font-semibold text-gray-800 px-4 pt-4 pb-2 text-sm">Yardım & Destek</h3>
            <div className="divide-y divide-gray-100">
              <button 
                onClick={() => onNavigate('faq')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <HelpCircle className="w-5 h-5 text-pink-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Sıkça Sorulan Sorular</p>
                  <p className="text-xs text-gray-500">Merak ettikleriniz</p>
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('help')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Yardım & İletişim</p>
                  <p className="text-xs text-gray-500">Bize ulaşın</p>
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('report')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Bildir</p>
                  <p className="text-xs text-gray-500">Sorun bildirin</p>
                </div>
              </button>
            </div>
          </div>

          {/* Yasal Bölüm */}
          <div className="mt-4 bg-white rounded-xl shadow overflow-hidden">
            <h3 className="font-semibold text-gray-800 px-4 pt-4 pb-2 text-sm">Yasal & Gizlilik</h3>
            <div className="divide-y divide-gray-100">
              <button 
                onClick={() => onNavigate('privacy')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Shield className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Gizlilik Sözleşmesi</p>
                  <p className="text-xs text-gray-500">Verileriniz güvende</p>
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('terms')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Kullanıcı Sözleşmesi</p>
                  <p className="text-xs text-gray-500">Kullanım koşulları</p>
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('kvkk')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Shield className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">KVKK Aydınlatma Metni</p>
                  <p className="text-xs text-gray-500">Kişisel verilerin korunması</p>
                </div>
              </button>
              
              <button 
                onClick={() => onNavigate('cookies')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Cookie className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">Çerez Politikası</p>
                  <p className="text-xs text-gray-500">Çerez kullanımı hakkında</p>
                </div>
              </button>
            </div>
          </div>

          {/* Çıkış Yap Butonu */}
          <div className="mt-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold shadow hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Çıkış Yap
              </h3>
              <p className="text-gray-600 mb-6">
                Çıkış yapmak istediğinizden emin misiniz?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    signOut();
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
