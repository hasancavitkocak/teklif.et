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
    if (mobileDebug.isMobile()) {
      const statusDiv = document.getElementById('mobile-status') || document.createElement('div');
      statusDiv.id = 'mobile-status';
      statusDiv.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
        background: #000; color: #fff; padding: 10px; font-size: 12px;
        text-align: center;
      `;
      statusDiv.textContent = status;
      if (!document.getElementById('mobile-status')) {
        document.body.appendChild(statusDiv);
      }
    }
  }
};