import { useState, useEffect } from 'react';
import { Edit2, Save, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { supabase } from '../lib/supabase';
import PhotoGallery from './PhotoGallery';
import PhotoGalleryView from './PhotoGalleryView';

const turkishCities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
  'Gaziantep', 'Şanlıurfa', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir',
  'Samsun', 'Denizli', 'Adapazarı', 'Malatya', 'Kahramanmaraş', 'Erzurum'
];

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { showModal, showToast } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Decorative header background - just for visual appeal */}
        <div className="relative h-48 bg-gradient-to-br from-pink-200 via-rose-200 to-pink-300">
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
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
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-800">
                {profile.name}, {profile.age}
              </h2>
              <p className="text-gray-600 text-lg">{profile.city}</p>

              {profile.bio && (
                <div className="bg-gray-50 rounded-xl p-6 text-left">
                  <h3 className="font-semibold text-gray-800 mb-2">Hakkımda</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Üyelik Durumu</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {profile.is_premium ? 'Premium' : 'Ücretsiz'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Günlük Teklif</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {profile.is_premium ? 'Sınırsız' : `${3 - profile.daily_offers_count} / 3`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Hesap Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Üyelik Tarihi</span>
                <span className="font-medium text-gray-800">
                  {new Date(profile.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Cinsiyet</span>
                <span className="font-medium text-gray-800 capitalize">
                  {profile.gender}
                </span>
              </div>
            </div>
          </div>

          {/* Çıkış Yap Butonu */}
          <div className="mt-6">
            <button
              onClick={() => {
                showModal(
                  'confirm',
                  'Çıkış Yap',
                  'Çıkış yapmak istediğinizden emin misiniz?',
                  () => signOut()
                );
              }}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-semibold shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </>
      )}
    </div>
  );
}
