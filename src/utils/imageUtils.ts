/**
 * Resim dosyasını belirtilen boyutlara resize eder ve sıkıştırır
 * @param file - Orijinal resim dosyası
 * @param maxWidth - Maksimum genişlik (varsayılan: 800px)
 * @param maxHeight - Maksimum yükseklik (varsayılan: 800px)
 * @param quality - JPEG kalitesi 0-1 arası (varsayılan: 0.8)
 * @returns Promise<string> - Base64 formatında sıkıştırılmış resim
 */
export const resizeAndCompressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Orijinal boyutları al
      const { width, height } = img;
      
      // Yeni boyutları hesapla (aspect ratio korunarak)
      let newWidth = width;
      let newHeight = height;
      
      if (width > height) {
        if (width > maxWidth) {
          newHeight = (height * maxWidth) / width;
          newWidth = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          newWidth = (width * maxHeight) / height;
          newHeight = maxHeight;
        }
      }
      
      // Canvas boyutlarını ayarla
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      if (!ctx) {
        reject(new Error('Canvas context oluşturulamadı'));
        return;
      }
      
      // Resmi canvas'a çiz
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Base64 formatında döndür
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Resim yüklenemedi'));
    };

    // File'ı Image'a yükle
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı'));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Base64 string'in boyutunu KB cinsinden hesaplar
 * @param base64String - Base64 formatındaki resim
 * @returns number - Boyut KB cinsinden
 */
export const getBase64Size = (base64String: string): number => {
  const base64Length = base64String.length;
  const sizeInBytes = (base64Length * 3) / 4;
  return Math.round(sizeInBytes / 1024);
};

/**
 * Dosya boyutunu kontrol eder
 * @param file - Kontrol edilecek dosya
 * @param maxSizeMB - Maksimum boyut MB cinsinden
 * @returns boolean - Boyut uygun mu?
 */
export const isFileSizeValid = (file: File, maxSizeMB: number = 10): boolean => {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

/**
 * Dosya tipini kontrol eder
 * @param file - Kontrol edilecek dosya
 * @returns boolean - Dosya tipi resim mi?
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};