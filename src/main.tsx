import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { mobileDebug } from './utils/mobileDebug';

// Mobile debug başlat
mobileDebug.showStatus('App başlatılıyor...');
mobileDebug.log('Main.tsx loaded');

// Global error handler for mobile debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  mobileDebug.error('Global error: ' + event.error?.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  mobileDebug.error('Promise rejection: ' + event.reason);
});

try {
  mobileDebug.showStatus('React render başlıyor...');
  const root = createRoot(document.getElementById('root')!);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  mobileDebug.showStatus('React render tamamlandı');
  mobileDebug.log('React app rendered successfully');
} catch (error) {
  mobileDebug.error('React render failed', error);
  
  // Fallback UI
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial;">
        <h2>Uygulama Yüklenemedi</h2>
        <p>Mobil tarayıcınızda bir sorun var. Lütfen sayfayı yenileyin.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px;">
          Yenile
        </button>
        <details style="margin-top: 20px; text-align: left;">
          <summary>Hata Detayları</summary>
          <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
        </details>
      </div>
    `;
  }
}
