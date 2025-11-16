import { useState, useEffect } from 'react';
import { X, Loader, Camera, Move } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';
import { resizeAndCompressImage, getBase64Size, isFileSizeValid, isImageFile } from '../utils/imageUtils';

const MAX_PHOTOS = 6;

export default function PhotoGallery() {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useModal();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.photos) {
      // Sadece dolu fotoğrafları al, boş string'leri filtrele
      const validPhotos = profile.photos.filter(photo => photo && photo.trim() !== '');
      setPhotos(validPhotos);
    } else {
      setPhotos([]);
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
      if (!file) return;

      // Fotoğraf limiti kontrolü
      if (photos.length >= MAX_PHOTOS) {
        showToast('error', `En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz`);
        return;
      }

      setUploading(true);
      try {
        // Dosya tipi kontrolü
        if (!isImageFile(file)) {
          showToast('error', 'Lütfen sadece resim dosyası seçin');
          return;
        }
        
        // Dosya boyutu kontrolü (10MB limit - resize öncesi)
        if (!isFileSizeValid(file, 10)) {
          showToast('error', 'Fotoğraf boyutu 10MB\'dan küçük olmalıdır');
          return;
        }
        
        // Resmi resize et ve sıkıştır
        const compressedImage = await resizeAndCompressImage(file, 800, 800, 0.8);
        
        // Sıkıştırılmış boyutu kontrol et
        const compressedSizeKB = getBase64Size(compressedImage);
        console.log(`Orijinal boyut: ${Math.round(file.size / 1024)}KB, Sıkıştırılmış boyut: ${compressedSizeKB}KB`);
        
        // Yeni fotoğrafı sona ekle
        const newPhotos = [...photos, compressedImage];
        setPhotos(newPhotos);
        await updatePhotosInDatabase(newPhotos);
        
        showToast('success', `Fotoğraf yüklendi (${compressedSizeKB}KB)`);
        
      } catch (error) {
        console.error('Error uploading photo:', error);
        showToast('error', 'Fotoğraf işlenirken hata oluştu');
      } finally {
        setUploading(false);
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
    showToast('success', 'Fotoğraf sırası değiştirildi');
  };

  const removePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    await updatePhotosInDatabase(newPhotos);
    showToast('success', 'Fotoğraf silindi');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Fotoğraflar</h3>
        <span className="text-sm text-gray-500">{photos.length}/{MAX_PHOTOS}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Mevcut fotoğraflar - sadece dolu olanları göster */}
        {photos.map((photo, index) => (
          <div
            key={`photo-${index}`}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`aspect-square rounded-xl border-2 border-violet-400 bg-violet-50 flex items-center justify-center cursor-pointer transition-all relative ${
              draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
            }`}
          >
            <div className="relative w-full h-full group">
              <img 
                src={photo} 
                alt={`Fotoğraf ${index + 1}`}
                className="w-full h-full object-cover rounded-xl"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-violet-500 text-white text-xs px-2 py-1 rounded-full">
                  Profil
                </div>
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Move className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Fotoğraf ekleme butonu - sadece limit dolmamışsa göster */}
        {photos.length < MAX_PHOTOS && (
          <div
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-all"
            onClick={() => {
              if (!uploading) {
                handlePhotoUpload();
              }
            }}
          >
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
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        İlk fotoğraf profil fotoğrafınız olarak kullanılacak
      </p>
    </div>
  );
}