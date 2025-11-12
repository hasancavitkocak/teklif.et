# Android'de Anlık Görme (Live Reload)

## Yöntem 1: Build + Sync (Her Değişiklikte)

```bash
# Tek komut - her değişiklikten sonra çalıştır
npm run build && npx cap sync android && npx cap run android
```

Veya package.json'a ekle:
```json
"android:dev": "npm run build && npx cap sync android && npx cap run android"
```

Sonra:
```bash
npm run android:dev
```

---

## Yöntem 2: Live Reload (ÖNERİLEN - EN HIZLI)

### Adım 1: IP Adresini Öğren
```bash
# Windows
ipconfig

# Çıktıda "IPv4 Address" bul (örn: 192.168.1.105)
```

### Adım 2: capacitor.config.ts Güncelle
```typescript
server: {
  url: 'http://192.168.1.105:5173', // Kendi IP'ni yaz
  cleartext: true,
  androidScheme: 'https',
  iosScheme: 'https'
},
```

### Adım 3: Dev Server + Android
```bash
# Terminal 1: Dev server başlat
npm run dev

# Terminal 2: Android'i çalıştır (bir kez)
npx cap run android
```

✅ Artık kod değiştirdiğinde telefonda otomatik yenilenir!

### Adım 4: Production'a Dönmek İçin
```typescript
server: {
  // url: 'http://192.168.1.105:5173', // Yorum satırı yap
  // cleartext: true,
  androidScheme: 'https',
  iosScheme: 'https'
},
```

---

## Yöntem 3: Android Studio'dan Direkt

1. Android Studio'yu aç
2. `android` klasörünü aç
3. Yeşil play butonuna bas
4. Emülatör veya cihazı seç

Her değişiklikten sonra:
```bash
npm run build && npx cap sync
```
Sonra Android Studio'da tekrar çalıştır.

---

## Hızlı Komutlar

```bash
# Build + Sync + Run (tek seferde)
npm run android

# Sadece build + sync
npm run sync

# Sadece Android Studio'yu aç
npx cap open android

# Live reload için dev server
npm run dev
```

---

## Sorun Giderme

### "ERR_CLEARTEXT_NOT_PERMITTED" Hatası
`capacitor.config.ts`'de `cleartext: true` ekle.

### Değişiklikler Yansımıyor
```bash
# Cache temizle
npx cap sync android --force

# Veya Android Studio'da
Build > Clean Project
Build > Rebuild Project
```

### Emülatör Yavaş
- Android Studio'da AVD Manager'dan daha hızlı bir emülatör seç
- Veya gerçek cihaz kullan (USB debugging)

---

## Önerilen Workflow

**Geliştirme (Live Reload):**
1. `capacitor.config.ts`'de IP'ni ayarla
2. `npm run dev` (Terminal 1)
3. `npx cap run android` (Terminal 2 - bir kez)
4. Kod değiştir → Otomatik yenilenir ✅

**Production Build:**
1. `capacitor.config.ts`'de URL'i yorum satırı yap
2. `npm run build`
3. `npx cap sync android`
4. Android Studio'da APK oluştur

---

## APK Oluşturma (Release)

```bash
# 1. Build
npm run build

# 2. Sync
npx cap sync android

# 3. Android Studio'da
Build > Generate Signed Bundle / APK
```

Veya komut satırından:
```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`
