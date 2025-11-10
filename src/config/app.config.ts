// Uygulama Konfigürasyonu

export const APP_CONFIG = {
  // Ücretsiz teklif hakları
  FREE_OFFERS_LIMIT: 3, // Varsayılan: 3 ücretsiz teklif
  
  // Premium özellikleri
  PREMIUM_UNLIMITED_OFFERS: true,
  
  // Paket fiyatları (TL)
  PACKAGES: {
    OFFER_10: {
      name: '10 Teklif Paketi',
      offers: 10,
      price: 500,
      unlimited: false,
    },
    OFFER_20: {
      name: '20 Teklif Paketi',
      offers: 20,
      price: 800,
      unlimited: false,
    },
    UNLIMITED_MONTHLY: {
      name: 'Aylık Sınırsız',
      offers: null, // null = sınırsız
      price: 3000,
      unlimited: true,
      duration: 30, // gün
    },
  },
  
  // Boost özellikleri
  BOOST: {
    DURATION_MINUTES: 30,
    VISIBILITY_MULTIPLIER: 3,
    PRICE: 100,
  },
  
  // Super Like
  SUPER_LIKE: {
    PRICE: 50,
    FREE_PER_DAY: 1,
  },
};

// Test modunda sınırsız hak ver
export const TEST_MODE = false; // true yaparsanız sınırsız teklif hakkı olur

// Kullanıcıya özel ücretsiz hak limiti
export function getFreeOffersLimit(userId?: string): number {
  // Test kullanıcıları için sınırsız
  const TEST_USERS = [
    // 'user-id-1',
    // 'user-id-2',
  ];
  
  if (userId && TEST_USERS.includes(userId)) {
    return 999; // Sınırsız
  }
  
  return APP_CONFIG.FREE_OFFERS_LIMIT;
}
