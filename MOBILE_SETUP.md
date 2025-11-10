# 📱 Mobile Uygulama Kurulum Rehberi

Teklif.et uygulaması Capacitor ile native iOS ve Android uygulamalarına dönüştürüldü!

## ✅ Tamamlanan İşlemler

### 1. Capacitor Kurulumu
- ✅ @capacitor/core ve @capacitor/cli kuruldu
- ✅ Capacitor config oluşturuldu
- ✅ Android ve iOS platformları eklendi

### 2. Yüklenen Pluginler
- ✅ **@capacitor/app** - App lifecycle yönetimi
- ✅ **@capacitor/camera** - Kamera ve galeri erişimi
- ✅ **@capacitor/geolocation** - GPS konum servisleri
- ✅ **@capacitor/haptics** - Titreşim feedback
- ✅ **@capacitor/keyboard** - Klavye yönetimi
- ✅ **@capacitor/push-notifications** - Push bildirimler
- ✅ **@capacitor/splash-screen** - Açılış ekranı
- ✅ **@capacitor/status-bar** - Status bar kontrolü

### 3. Custom Hooks
- ✅ `useCapacitor()` - Platform detection ve initialization
- ✅ `useCamera()` - Kamera ve galeri işlemleri
- ✅ `usePushNotifications()` - Push notification yönetimi

### 4. Mobile Optimizasyonlar
- ✅ Safe area insets (notched devices için)
- ✅ Keyboard handling
- ✅ Touch optimizations
- ✅ Smooth scrolling
- ✅ iOS zoom prevention

## 🚀 Kullanım

### Android Uygulaması Çalıştırma

```bash
# Build + Sync + Android Studio'da aç
npm run android

# Veya manuel:
npm run build
npx cap sync android
npx cap open android
```

**Gereksinimler:**
- Android Studio yüklü olmalı
- Android SDK kurulu olmalı
- Java JDK 17+ kurulu olmalı

### iOS Uygulaması Çalıştırma (Mac gerekli)

```bash
# Build + Sync + Xcode'da aç
npm run ios

# Veya manuel:
npm run build
npx cap sync ios
npx cap open ios
```

**Gereksinimler:**
- macOS
- Xcode yüklü olmalı
- CocoaPods kurulu olmalı (`sudo gem install cocoapods`)

### Sync (Her değişiklikten sonra)

```bash
# Web kodunu build et ve native projelere sync et
npm run sync
```

## 📱 Test Etme

### Android Emulator
1. Android Studio'yu aç
2. AVD Manager'dan emulator oluştur
3. Run butonuna bas

### iOS Simulator (Mac)
1. Xcode'u aç
2. Simulator seç (iPhone 15 Pro önerilir)
3. Run butonuna bas

### Fiziksel Cihaz

**Android:**
1. USB Debugging'i aç (Developer Options)
2. Cihazı USB ile bağla
3. Android Studio'da cihazı seç
4. Run

**iOS:**
1. Apple Developer hesabı gerekli
2. Xcode'da Signing & Capabilities ayarla
3. Cihazı bağla
4. Run

## 🎨 Icon ve Splash Screen

### Icon Oluşturma
1. 1024x1024 PNG icon hazırla
2. `resources/icon.png` olarak kaydet
3. Otomatik generate için:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

### Splash Screen
1. 2732x2732 PNG splash screen hazırla
2. `resources/splash.png` olarak kaydet
3. Generate komutu ile otomatik oluştur

## 🔧 Yapılandırma

### capacitor.config.ts
```typescript
{
  appId: 'com.teklifet.app',
  appName: 'Teklif.et',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ec4899'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ec4899'
    }
  }
}
```

### Android Permissions (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### iOS Permissions (ios/App/App/Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Profil fotoğrafı çekmek için kamera erişimi gerekli</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Profil fotoğrafı seçmek için galeri erişimi gerekli</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Yakınınızdaki etkinlikleri göstermek için konum erişimi gerekli</string>
```

## 📦 Build ve Release

### Android APK/AAB Oluşturma

```bash
# Debug APK
cd android
./gradlew assembleDebug

# Release AAB (Google Play için)
./gradlew bundleRelease
```

APK konumu: `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS IPA Oluşturma

1. Xcode'da Product > Archive
2. Distribute App
3. App Store Connect veya Ad Hoc seç
4. Export

## 🔐 Signing

### Android
1. Keystore oluştur:
```bash
keytool -genkey -v -keystore teklif-et.keystore -alias teklif-et -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/app/build.gradle` güncelle:
```gradle
signingConfigs {
    release {
        storeFile file('teklif-et.keystore')
        storePassword 'your-password'
        keyAlias 'teklif-et'
        keyPassword 'your-password'
    }
}
```

### iOS
1. Apple Developer hesabı gerekli ($99/yıl)
2. Xcode'da Signing & Capabilities
3. Team seç
4. Automatic signing

## 🚀 Store'lara Yükleme

### Google Play Store
1. Google Play Console'da uygulama oluştur
2. AAB dosyasını yükle
3. Store listing bilgilerini doldur
4. İncelemeye gönder

### Apple App Store
1. App Store Connect'te uygulama oluştur
2. Xcode'dan Archive + Upload
3. App bilgilerini doldur
4. İncelemeye gönder

## 🐛 Debugging

### Chrome DevTools (Android)
1. Chrome'da `chrome://inspect` aç
2. Cihazı seç
3. Inspect

### Safari Web Inspector (iOS)
1. Safari > Develop > [Device Name]
2. Uygulamayı seç

### Native Logs
```bash
# Android
npx cap run android -l

# iOS
npx cap run ios -l
```

## 📚 Faydalı Komutlar

```bash
# Tüm platformları sync et
npm run sync

# Sadece Android
npm run android

# Sadece iOS
npm run ios

# Capacitor update
npm run cap:update

# Plugin ekle
npm install @capacitor/[plugin-name]
npx cap sync

# Plugin kaldır
npm uninstall @capacitor/[plugin-name]
npx cap sync
```

## 🔗 Kaynaklar

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/)

## 💡 İpuçları

1. **Her kod değişikliğinden sonra:**
   ```bash
   npm run sync
   ```

2. **Plugin ekledikten sonra:**
   ```bash
   npx cap sync
   ```

3. **Native kod değişikliğinde:**
   - Android: Gradle sync
   - iOS: Pod install

4. **Performance:**
   - Production build kullan
   - Image'leri optimize et
   - Lazy loading kullan

5. **Testing:**
   - Fiziksel cihazda test et
   - Farklı ekran boyutlarında test et
   - Offline durumu test et

## 🎉 Sonuç

Artık Teklif.et uygulamanız native iOS ve Android uygulaması olarak çalışıyor!

**Sonraki Adımlar:**
1. ✅ Icon ve splash screen ekle
2. ✅ Android Studio'da test et
3. ✅ iOS Simulator'da test et
4. ✅ Fiziksel cihazda test et
5. ✅ Store'lara yükle

Başarılar! 🚀
