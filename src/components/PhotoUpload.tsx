import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type PhotoUploadProps = {
  currentPhotoUrl?: string;
  onUploadComplete: (url: string) => void;
};

export default function PhotoUpload({ currentPhotoUrl, onUploadComplete }: PhotoUploadProps) {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      alert('Fotoğraf başarıyla yüklendi! 📸');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Fotoğraf yüklenirken bir hata oluştu: ' + error.message);
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!profile) return;
    if (!confirm('Profil fotoğrafınızı kaldırmak istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', profile.id);

      if (error) throw error;

      setPreview(null);
      onUploadComplete('');
      alert('Fotoğraf kaldırıldı');
    } catch (error) {
      console.error('Remove error:', error);
      alert('Fotoğraf kaldırılırken bir hata oluştu');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center border-4 border-pink-200">
            <Camera className="w-12 h-12 text-white" />
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        {preview && !uploading && (
          <button
            onClick={removePhoto}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            title="Fotoğrafı Kaldır"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-5 h-5" />
        {uploading ? 'Yükleniyor...' : preview ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG veya GIF • Maksimum 5MB
      </p>
    </div>
  );
}
