import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export function useCamera() {
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (): Promise<string | null> => {
    try {
      if (!isNative) {
        // Web fallback - use file input
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Ask user: camera or gallery
        width: 1200,
        height: 1200,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  const pickFromGallery = async (): Promise<string | null> => {
    try {
      if (!isNative) {
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1200,
        height: 1200,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error picking from gallery:', error);
      return null;
    }
  };

  return {
    takePicture,
    pickFromGallery,
    isNative,
  };
}
