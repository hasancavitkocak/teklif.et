import { useState, useEffect, useRef } from 'react';
import { X, Star, Loader, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

type Photo = {
  id: string;
  photo_url: string;
  photo_order: number;
  is_primary: boolean;
};

const MAX_PHOTOS = 6;

export default function PhotoGallery() {
  const { profile, refreshProfile } = useAuth();
  const { showModal, showToast } = useModal();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      fetchPhotos();
    }
  }, [profile?.id]);

  const fetchPhotos = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('user_id', profile.id)
        .order('photo_order', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Lütfen bir resim dosyası seçin');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    if (photos.length >= MAX_PHOTOS) {
      showToast('warning', `Maksimum ${MAX_PHOTOS} fotoğraf yükleyebilirsiniz`);
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const isPrimary = photos.length === 0;
      const photoOrder = photos.length;

      const { error: insertError } = await supabase
        .from('profile_photos')
        .insert({
          user_id: profile.id,
          photo_url: publicUrl,
          photo_order: photoOrder,
          is_primary: isPrimary,
        });

      if (insertError) throw insertError;

      await fetchPhotos();
      await refreshProfile();
      
      showToast('success', 'Fotoğraf başarıyla yüklendi! 📸');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast('error', 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const setPrimaryPhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('profile_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) throw error;

      await fetchPhotos();
      await refreshProfile();
      showToast('success', 'Ana fotoğraf güncellendi! ⭐');
    } catch (error) {
      console.error('Error setting primary:', error);
      showToast('error', 'Ana fotoğraf ayarlanırken bir hata oluştu');
    }
  };

  const deletePhoto = async (photoId: string, photoUrl: string) => {
    showModal(
      'confirm',
      'Fotoğrafı Sil',
      'Bu fotoğrafı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      async () => {
        try {
          // Delete from storage
          const filePath = photoUrl.split('/').slice(-2).join('/');
          await supabase.storage.from('photos').remove([filePath]);

          // Delete from database
          const { error } = await supabase
            .from('profile_photos')
            .delete()
            .eq('id', photoId);

          if (error) throw error;

          await fetchPhotos();
          await refreshProfile();
          showToast('success', 'Fotoğraf silindi');
        } catch (error) {
          console.error('Delete error:', error);
          showToast('error', 'Fotoğraf silinirken bir hata oluştu');
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Fotoğraf Galerisi</h3>
          <p className="text-sm text-gray-600">
            {photos.length}/{MAX_PHOTOS} fotoğraf • İlk fotoğraf profil fotoğrafınız olur
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square rounded-2xl overflow-hidden group"
          >
            <img
              src={photo.photo_url}
              alt={`Fotoğraf ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!photo.is_primary && (
                <button
                  onClick={() => setPrimaryPhoto(photo.id)}
                  className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                  title="Ana Fotoğraf Yap"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => deletePhoto(photo.id, photo.photo_url)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Sil"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Badge */}
            {photo.is_primary && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Ana
              </div>
            )}

            {/* Order Badge */}
            <div className="absolute top-2 right-2 bg-black/70 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Add Photo Button */}
        {photos.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-pink-400 hover:bg-pink-50 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader className="w-8 h-8 text-pink-500 animate-spin" />
                <span className="text-sm text-pink-600 font-medium">Yükleniyor...</span>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">Ekle</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Full Screen Loader Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <Loader className="w-16 h-16 text-pink-500 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Fotoğraf Yükleniyor</p>
              <p className="text-sm text-gray-600">Lütfen bekleyin...</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 <strong>İpucu:</strong> İlk fotoğrafınız profil fotoğrafınız olur. 
          Yıldız ikonuna tıklayarak ana fotoğrafı değiştirebilirsiniz.
        </p>
      </div>
    </div>
  );
}
