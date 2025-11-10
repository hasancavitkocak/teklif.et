// Browser Push Notifications

export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async showNotification(title: string, options: NotificationOptions = {}) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      ...options,
    };

    if (this.registration) {
      // Use service worker if available
      this.registration.showNotification(title, defaultOptions);
    } else {
      // Fallback to basic notification
      new Notification(title, defaultOptions);
    }
  }

  async showOfferNotification(senderName: string, offerTitle: string) {
    await this.showNotification(
      'Yeni Teklif Geldi! 💌',
      {
        body: `${senderName} "${offerTitle}" talebine teklif gönderdi`,
        tag: 'new-offer',
        data: { type: 'new_offer_request' },
      }
    );
  }

  async showAcceptedNotification(creatorName: string, offerTitle: string) {
    await this.showNotification(
      'Teklif Kabul Edildi! 🎉',
      {
        body: `${creatorName} "${offerTitle}" teklifinizi kabul etti`,
        tag: 'offer-accepted',
        data: { type: 'offer_accepted' },
      }
    );
  }

  async showMessageNotification(senderName: string) {
    await this.showNotification(
      'Yeni Mesaj 💬',
      {
        body: `${senderName} size mesaj gönderdi`,
        tag: 'new-message',
        data: { type: 'new_message' },
      }
    );
  }

  async showBoostNotification() {
    await this.showNotification(
      'Boost Aktif! 🚀',
      {
        body: '30 dakika boyunca 3x daha fazla görünürlük',
        tag: 'boost-active',
        data: { type: 'boost_activated' },
      }
    );
  }

  async showSuperLikeNotification(senderName: string) {
    await this.showNotification(
      'Super Like Aldınız! 💖',
      {
        body: `${senderName} size super like gönderdi`,
        tag: 'super-like',
        data: { type: 'super_like_received' },
      }
    );
  }

  // Initialize service worker (optional)
  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}

// Singleton instance
export const notificationService = NotificationService.getInstance();
