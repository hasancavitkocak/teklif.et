import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ProfileViewProps = {
  profile: Profile;
  onBack: () => void;
  onMessage?: () => void;
  showMessageButton?: boolean;
};

export default function ProfileView({ profile, onBack, onMessage, showMessageButton = false }: ProfileViewProps) {
  const { profile: currentUser } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [profile.id]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('photo_url')
        .eq('user_id', profile.id)
        .order('photo_order', { ascending: true });

      if (error) throw error;

      const photoUrls = data?.map(p => p.photo_url) || [];
      
      // If no photos in gallery, use profile photo
      if (photoUrls.length === 0 && profile.photo_url) {
        setPhotos([profile.photo_url]);
      } else {
        setPhotos(photoUrls);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
      // Fallback to profile photo
      if (profile.photo_url) {
        setPhotos([profile.photo_url]);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleMessageClick = async () => {
    if (!currentUser || !onMessage || sendingMessage) return;

    setSendingMessage(true);

    try {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('offers')
        .select('id')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`)
        .eq('status', 'matched')
        .single();

      if (existingMatch) {
        // Match already exists, just open chat
        onMessage();
      } else {
        // No match exists, create one first
        const { error } = await supabase
          .from('offers')
          .insert({
            sender_id: currentUser.id,
            receiver_id: profile.id,
            status: 'matched'
          });

        if (error) throw error;

        // Now open chat
        onMessage();
      }
    } catch (error) {
      console.error('Error handling message:', error);
      alert('Mesaj gönderilirken bir hata oluştu');
    } finally {
      setSendingMessage(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-3 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Profil</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Profile Photo Gallery */}
        <div className="relative h-96 bg-gradient-to-br from-pink-200 to-rose-200">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-2xl">Yükleniyor...</div>
            </div>
          ) : photos.length > 0 ? (
            <>
              <img
                src={photos[currentPhotoIndex]}
                alt={`${profile.name} - Fotoğraf ${currentPhotoIndex + 1}`}
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
                  
                  {/* Photo Indicators */}
                  <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                    {photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`h-1 rounded-full transition-all ${
                          index === currentPhotoIndex
                            ? 'w-8 bg-white'
                            : 'w-4 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-8xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {profile.name}, {profile.age}
            </h1>
            <div className="flex items-center gap-2 text-white text-lg">
              <MapPin className="w-5 h-5" />
              {profile.city}
            </div>
            {photos.length > 1 && (
              <div className="text-white/80 text-sm mt-2">
                {currentPhotoIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-8">
          {/* About */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Hakkında
              </h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-pink-50 rounded-xl p-4">
              <p className="text-sm text-pink-600 font-semibold mb-1">Yaş</p>
              <p className="text-2xl font-bold text-gray-800">{profile.age}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600 font-semibold mb-1">Cinsiyet</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">{profile.gender}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 col-span-2">
              <p className="text-sm text-blue-600 font-semibold mb-1">Şehir</p>
              <p className="text-xl font-bold text-gray-800">{profile.city}</p>
            </div>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">İlgi Alanları</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-semibold"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Üyelik Tarihi</p>
              <p className="font-semibold text-gray-800">
                {new Date(profile.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Message Button */}
          {showMessageButton && onMessage && (
            <button
              onClick={handleMessageClick}
              disabled={sendingMessage}
              className="mt-6 w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5" />
              {sendingMessage ? 'Açılıyor...' : 'Mesaj Gönder'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
