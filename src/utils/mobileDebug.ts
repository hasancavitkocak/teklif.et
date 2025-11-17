// Mobile debug utility
export const mobileDebug = {
  log: (message: string, data?: any) => {
    console.log(`[MOBILE DEBUG] ${message}`, data);
    // Mobil cihazlarda console'u görmek için alert kullan (geliştirme aşamasında)
    if (process.env.NODE_ENV === 'development' && /Mobi|Android/i.test(navigator.userAgent)) {
      // alert(`DEBUG: ${message}`);
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[MOBILE ERROR] ${message}`, error);
    // Kritik hatalar için alert
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      alert(`ERROR: ${message}`);
    }
  },

  isMobile: () => /Mobi|Android/i.test(navigator.userAgent),
  
  showStatus: (status: string) => {
    // Debug mesajları devre dışı
    return;
  }
};