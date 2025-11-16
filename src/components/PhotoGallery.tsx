import { useState, useEffect } from 'react';
import { X, Loader, Camera, Move } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const MAX_PHOTOS = 6;

export default function PhotoGallery() {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useModal();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.photos) {
      setPhotos(profile.photos);
    }
  }, [profile?.photos]);

  const updatePhotosInDatabase = async (newPhotos: string[]) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          photos: newPhotos,
          photo_url: newPhotos[0] || null // İlk fotoğraf profil fotoğrafı
        })
        .eq('id', profile.id);

      if (error) throw error;
      await refreshProfile();
      showToast('success', 'Fotoğraflar güncellendi');
    } catch (error) {
      console.error('Error updating photos:', error);
      showToast('error', 'Fotoğraf güncellenirken hata oluştu');
    }
  };

  const handlePhotoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploading(true);
        try {
          // Gerçek uygulamada burada dosya yükleme işlemi yapılacak
          // Şimdilik base64 olarak saklıyoruz
          const reader = new FileReader();
          reader.onload = async () => {
            // Sıralı olarak ekle - boş olan ilk slota ekle
            const newPhotos = [...photos];
            const emptyIndex = newPhotos.findIndex(photo => !photo);
            if (emptyIndex !== -1) {
              newPhotos[emptyIndex] = reader.result as string;
            } else {
              // Boş slot yoksa sona ekle
              newPhotos.push(reader.result as string);
            }
            setPhotos(newPhotos);
            await updatePhotosInDatabase(newPhotos);
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error uploading photo:', error);
          showToast('error', 'Fotoğraf yüklenirken hata oluştu');
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

  // Sürükle-bırak fonksiyonları
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Fotoğrafları yeniden sırala
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Sürüklenen fotoğrafı kaldır
    newPhotos.splice(draggedIndex, 1);
    
    // Yeni pozisyona ekle
    newPhotos.splice(dropIndex, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    await updatePhotosInDatabase(newPhotos);
    setDraggedIndex(null);
  };

  const removePhoto = async (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1); // Fotoğrafı sil
    setPhotos(newPhotos);
    await updatePhotosInDatabase(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Fotoğraflar</h3>
        <span className="text-sm text-gray-500">{photos.length}/{MAX_PHOTOS}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_PHOTOS }).map((_, index) => (
          <div
            key={index}
            className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all relative ${
              photos[index]
                ? 'border-violet-400 bg-violet-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => {
              if (!photos[index] && !uploading) {
                handlePhotoUpload(index);
              }
            }}
          >
            {photos[index] ? (
              <div className="relative w-full h-full">
                <img 
                  src={photos[index]} 
                  alt={`Fotoğraf ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-violet-500 text-white text-xs px-2 py-1 rounded-full">
                    Profil
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                {uploading ? (
                  <Loader className="w-6 h-6 text-violet-500 animate-spin mx-auto mb-1" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                )}
                <span className="text-xs text-gray-500">
                  {uploading ? 'Yükleniyor...' : 'Ekle'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">
        İlk fotoğraf profil fotoğrafınız olarak kullanılacak
      </p>
    </div>
  );
}