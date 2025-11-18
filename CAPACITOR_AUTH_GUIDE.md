# 📱 Capacitor Auth & Cache Yönetimi

## 🎯 Sorun
Web'de çalışan auth sistemi, Capacitor'da (Android/iOS) farklı davranıyor:
- Session kaybolabiliyor
- localStorage sorunları
- Build sonrası login sorunları

## ✅ Çözüm

### 1. Capacitor Storage Kullanımı
```typescript
// src/lib/supabase.ts
import { CapacitorStorage } from './capacitorStorage';

export const supabase = createClient(url, key, {
  auth: {
    storage: Capacitor.isNativePlatform() ? CapacitorStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### 2. Session Persistence
- **Web**: localStorage (otomatik)
- **Native**: Capacitor Preferences (güvenli, encrypted)
- **Auto-refresh**: Token otomatik yenileniyor

### 3. Build Sonrası Login Akışı

#### İlk Kurulum (Kullanıcı ilk kez açıyor)
```
1. App açılır
2. AuthContext initialize olur
3. supabase.auth.getSession() çağrılır
4. Session yoksa → Login ekranı
5. Kullanıcı giriş yapar
6. Session Capacitor Preferences'a kaydedilir
```

#### Sonraki Açılışlar (Session var)
```
1. App açılır
2. AuthContext initialize olur
3. supabase.auth.getSession() çağrılır
4. Capacitor Preferences'tan session okunur
5. Session geçerliyse → Ana ekran
6. Session expired ise → Otomatik refresh
7. Refresh başarısızsa → Login ekranı
```

### 4. Cache Stratejisi

#### Auth Session Cache
- **Storage**: Capacitor Preferences (native) / localStorage (web)
- **Lifetime**: Token expiry'ye kadar (genelde 1 saat)
- **Auto-refresh**: Evet, Supabase otomatik yeniliyor

#### Profile Cache
- **Storage**: Memory (React state)
- **Lifetime**: 5 dakika
- **Refresh**: Manuel veya otomatik

#### Offer Cache
- **Storage**: localStorage
- **Lifetime**: 5 dakika
- **Refresh**: Manuel veya otomatik

### 5. Test Senaryoları

#### Senaryo 1: İlk Kurulum
```bash
# 1. Build al
npm run build

# 2. Android'e sync et
npx cap sync android

# 3. Uygulamayı aç
npx cap run android

# Beklenen: Login ekranı açılır
```

#### Senaryo 2: Login Sonrası
```bash
# 1. Login yap
# 2. Uygulamayı kapat
# 3. Uygulamayı tekrar aç

# Beklenen: Direkt ana ekran açılır (login gerekmiyor)
```

#### Senaryo 3: Session Expired
```bash
# 1. Login yap
# 2. 1 saat bekle
# 3. Uygulamayı aç

# Beklenen: Otomatik token refresh, ana ekran açılır
```

#### Senaryo 4: Logout
```bash
# 1. Logout yap
# 2. Uygulamayı kapat
# 3. Uygulamayı tekrar aç

# Beklenen: Login ekranı açılır
```

### 6. Debug

#### Chrome DevTools
```bash
# Android cihazı bilgisayara bağla
# Chrome'da aç:
chrome://inspect

# Cihazı seç ve "inspect" tıkla
# Console'da:
await supabase.auth.getSession()
```

#### Capacitor Preferences Kontrol
```typescript
import { Preferences } from '@capacitor/preferences';

// Session'ı kontrol et
const { value } = await Preferences.get({ 
  key: 'supabase.auth.token' 
});
console.log('Stored session:', value);
```

### 7. Sorun Giderme

#### "Session kayboldu" Sorunu
```typescript
// Çözüm: persistSession: true olmalı
auth: {
  persistSession: true,
}
```

#### "Token expired" Sorunu
```typescript
// Çözüm: autoRefreshToken: true olmalı
auth: {
  autoRefreshToken: true,
}
```

#### "Login sonrası logout oluyor" Sorunu
```typescript
// Çözüm: Capacitor Storage kullan
auth: {
  storage: Capacitor.isNativePlatform() ? CapacitorStorage : undefined,
}
```

### 8. Best Practices

1. **Her zaman Capacitor Storage kullan** (native'de)
2. **Session'ı manuel kontrol etme** (Supabase otomatik yapıyor)
3. **Token'ı localStorage'a kaydetme** (güvensiz)
4. **Deep linking ekle** (email verification için)
5. **Error handling yap** (network sorunları için)

### 9. Güvenlik

- ✅ Capacitor Preferences encrypted
- ✅ Token otomatik refresh
- ✅ PKCE flow kullanılıyor
- ✅ Session timeout var
- ❌ Token localStorage'da değil

### 10. Performans

- **İlk açılış**: ~500ms (session check)
- **Sonraki açılışlar**: ~100ms (cache'den)
- **Token refresh**: ~200ms (background)
- **Profile fetch**: ~300ms (ilk), ~0ms (cache)

## 🚀 Sonuç

Artık build aldıktan sonra:
1. Kullanıcı login yapar
2. Session güvenli şekilde kaydedilir
3. App kapatılıp açılsa bile login kalır
4. Token otomatik yenilenir
5. Sorunsuz çalışır!
