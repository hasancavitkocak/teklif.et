import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PhotoGalleryViewProps = {
  userId: string;
  userName: string;
};

export default function PhotoGalleryView({ userId, userName }: PhotoGalleryViewProps) {
  const { profile } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kendi profilimizse photos array'ini kullan
    if (profile && profile.id === userId && profile.photos) {
      setPhotos(profile.photos);
      setLoading(false);
    } else {
      fetchPhotos();
    }
  }, [userId, profile]);

  const fetchPhotos = async () => {
    try {
      // Önce profiles tablosundan photos array'ini kontrol et
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (profileData?.photos && profileData.photos.length > 0) {
        setPhotos(profileData.photos);
      } else {
        // Fallback: eski profile_photos tablosundan kontrol et
        const { data, error } = await supabase
          .from('profile_photos')
          .select('photo_url')
          .eq('user_id', userId)
          .order('photo_order', { ascending: true });

        if (error) throw error;
        const photoUrls = data?.map(p => p.photo_url) || [];
        setPhotos(photoUrls);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Henüz fotoğraf eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Fotoğraflar</h3>
        <span className="text-sm text-gray-600">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Main Photo Display */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-violet-200 to-purple-200">
        <img
          src={photos[currentIndex]}
          alt={`${userName} - Fotoğraf ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Photo Indicators */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-violet-500'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-violet-500 scale-110'
                  : 'border-gray-200 hover:border-violet-300'
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
