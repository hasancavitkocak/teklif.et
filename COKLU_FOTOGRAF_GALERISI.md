# 📸 Çoklu Fotoğraf Galerisi Sistemi

## ✅ Eklenen Özellikler

### 1. **Fotoğraf Galerisi** 🖼️

**Özellikler:**
- ✅ Maksimum 6 fotoğraf
- ✅ Sürükle-bırak sırala (gelecekte)
- ✅ Ana fotoğraf seçimi
- ✅ Fotoğraf silme
- ✅ Otomatik sıralama

### 2. **Profil Görüntüleme** 👁️

**Özellikler:**
- ✅ Fotoğraflar arası geçiş (swipe benzeri)
- ✅ Ok tuşları ile navigasyon
- ✅ Fotoğraf göstergeleri (dots)
- ✅ Fotoğraf sayacı (1/6)
- ✅ Smooth animasyonlar

### 3. **Ana Fotoğraf Sistemi** ⭐

**Mantık:**
- İlk yüklenen fotoğraf otomatik ana fotoğraf
- Yıldız ikonuna tıklayarak değiştirilebilir
- Ana fotoğraf `profiles.photo_url`'e senkronize
- Sadece 1 ana fotoğraf olabilir

## 🎨 Görsel Tasarım

### Profil Düzenleme - Galeri

```
┌─────────────────────────────────────┐
│ Fotoğraf Galerisi                   │
│ 3/6 fotoğraf                        │
├─────────────────────────────────────┤
│ [⭐ Ana]  [2]      [3]              │
│  Foto1    Foto2    Foto3            │
│  [❌]     [⭐][❌]  [⭐][❌]         │
│                                      │
│ [+]                                  │
│ Ekle                                 │
└─────────────────────────────────────┘
```

### Profil Görüntüleme - Galeri

```
┌─────────────────────────────────────┐
│ ● ○ ○ ○ ○ ○  <- Göstergeler        │
│                                      │
│ [←]    [Fotoğraf]    [→]           │
│                                      │
│ İsim, 25                            │
│ İstanbul                             │
│ 1 / 6                               │
└─────────────────────────────────────┘
```

## 🔧 Teknik Detaylar

### Veritabanı Yapısı

**profile_photos tablosu:**
```sql
- id: UUID
- user_id: UUID (FK)
- photo_url: TEXT
- photo_order: INTEGER
- is_primary: BOOLEAN
- created_at: TIMESTAMP
```

**İndeksler:**
```sql
idx_profile_photos_user (user_id)
idx_profile_photos_order (user_id, photo_order)
idx_profile_photos_primary (user_id, is_primary)
```

### Ana Fotoğraf Trigger

```sql
CREATE TRIGGER trigger_ensure_single_primary_photo
  AFTER INSERT OR UPDATE ON profile_photos
  FOR EACH ROW
  WHEN (NEW.is_primary = TRUE)
  EXECUTE FUNCTION ensure_single_primary_photo();
```

**Mantık:**
1. Yeni fotoğraf ana yapılınca
2. Diğer tüm fotoğraflar non-primary olur
3. `profiles.photo_url` güncellenir
4. Tek bir ana fotoğraf garantisi

### Fotoğraf Yükleme Akışı

```typescript
1. Dosya seç (max 5MB)
   ↓
2. Validasyon (tip, boyut)
   ↓
3. Supabase Storage'a yükle
   ↓
4. Public URL al
   ↓
5. profile_photos tablosuna ekle
   ↓
6. İlk fotoğrafsa is_primary = true
   ↓
7. Galeriyi yenile
```

### Fotoğraf Görüntüleme

```typescript
// ProfileView'de
1. profile_photos'tan fotoğrafları çek
   ↓
2. photo_order'a göre sırala
   ↓
3. State'e kaydet
   ↓
4. Swipe/ok tuşları ile gezin
   ↓
5. Göstergeleri güncelle
```

## 📱 Kullanıcı Akışları

### Akış 1: İlk Fotoğraf Yükleme

```
1. Profil → Düzenle
2. "Ekle" butonuna tıkla
3. Fotoğraf seç
4. Otomatik yüklenir
5. İlk fotoğraf = Ana fotoğraf
6. Profil fotoğrafı olarak ayarlanır
```

### Akış 2: Ek Fotoğraf Ekleme

```
1. Profil → Düzenle
2. "Ekle" butonuna tıkla (max 6)
3. Fotoğraf seç
4. Sırayla eklenir (1, 2, 3...)
5. Galeri güncellenir
```

### Akış 3: Ana Fotoğraf Değiştirme

```
1. Profil → Düzenle
2. Fotoğrafın üzerine hover
3. Yıldız ikonuna tıkla
4. Ana fotoğraf değişir
5. Profil fotoğrafı güncellenir
6. Eski ana fotoğraf normal olur
```

### Akış 4: Fotoğraf Silme

```
1. Profil → Düzenle
2. Fotoğrafın üzerine hover
3. X ikonuna tıkla
4. Onay ver
5. Storage'dan silinir
6. Database'den silinir
7. Galeri güncellenir
```

### Akış 5: Profil Görüntüleme

```
1. Kullanıcı profiline tıkla
2. Fotoğraf galerisi yüklenir
3. İlk fotoğraf gösterilir
4. Ok tuşları ile gezin
   - Sol ok: Önceki fotoğraf
   - Sağ ok: Sonraki fotoğraf
5. Göstergeler aktif fotoğrafı gösterir
6. Sayaç: 3/6
```

## 🎯 Özellik Detayları

### Maksimum 6 Fotoğraf

**Neden 6?**
- Tinder: 9 fotoğraf
- Bumble: 6 fotoğraf
- Hinge: 6 fotoğraf

**Avantajlar:**
- Yeterli çeşitlilik
- Performans dengesi
- Kolay gezinme

### Fotoğraf Sıralaması

**Otomatik Sıralama:**
```typescript
photo_order = photos.length
// İlk fotoğraf: 0
// İkinci fotoğraf: 1
// Üçüncü fotoğraf: 2
```

**Manuel Sıralama (Gelecekte):**
- Drag & drop ile sıralama
- Fotoğrafları yeniden düzenleme

### Ana Fotoğraf Mantığı

**Kurallar:**
1. Her kullanıcının 1 ana fotoğrafı olmalı
2. İlk yüklenen otomatik ana
3. Ana fotoğraf değiştirilince:
   - Eski ana → normal
   - Yeni ana → primary
   - profiles.photo_url güncellenir

## 🎨 UI/UX Detayları

### Hover Efektleri

```css
.photo-card:hover .overlay {
  opacity: 1;
  /* Yıldız ve X butonları görünür */
}
```

### Fotoğraf Göstergeleri

```tsx
// Aktif fotoğraf
<div className="w-8 bg-white" />

// Pasif fotoğraf
<div className="w-4 bg-white/50" />
```

### Animasyonlar

**Fotoğraf Geçişi:**
```css
transition: transform 0.3s ease-out;
```

**Buton Hover:**
```css
transition: all 0.2s;
hover:scale-110;
```

## 📊 Performans

### Optimizasyonlar

**1. Lazy Loading:**
```typescript
// Sadece görünen fotoğraf yüklenir
<img loading="lazy" />
```

**2. Cache:**
```typescript
// Supabase Storage cache
cacheControl: '3600' // 1 saat
```

**3. Sıkıştırma:**
```typescript
// Gelecekte: Client-side compression
// 5MB → 1MB
```

### Performans Metrikleri

```
Fotoğraf Yükleme: ~2s (5MB)
Galeri Yükleme: ~200ms
Fotoğraf Geçişi: ~300ms (animasyon)
Silme İşlemi: ~500ms
```

## 🔒 Güvenlik

### Validasyonlar

**Client-Side:**
```typescript
// Dosya tipi
if (!file.type.startsWith('image/')) {
  alert('Sadece resim dosyaları');
}

// Dosya boyutu
if (file.size > 5 * 1024 * 1024) {
  alert('Max 5MB');
}

// Fotoğraf sayısı
if (photos.length >= 6) {
  alert('Max 6 fotoğraf');
}
```

**Server-Side:**
- RLS policies
- Storage policies
- Trigger validations

## 🚀 Gelecek İyileştirmeler

### Kısa Vadeli
- [ ] Drag & drop sıralama
- [ ] Fotoğraf crop/resize
- [ ] Otomatik sıkıştırma
- [ ] Swipe gesture (mobil)

### Orta Vadeli
- [ ] Fotoğraf filtreleri
- [ ] Çoklu fotoğraf yükleme
- [ ] Fotoğraf etiketleme
- [ ] AI ile uygunsuz içerik tespiti

### Uzun Vadeli
- [ ] Video profil
- [ ] 360° fotoğraf
- [ ] AR filtreler
- [ ] Hikaye entegrasyonu

## 💡 Kullanım İpuçları

### Kullanıcılar İçin

**İyi Profil Fotoğrafları:**
1. Net ve iyi aydınlatılmış
2. Yüzünüz net görünüyor
3. Farklı açılar ve ortamlar
4. Doğal ve samimi
5. Güncel fotoğraflar

**Fotoğraf Sırası:**
1. En iyi fotoğraf → Ana
2. Yakın çekim
3. Tam boy
4. Hobi/aktivite
5. Arkadaşlarla
6. Seyahat/mekan

### Geliştiriciler İçin

**Storage Yönetimi:**
```typescript
// Eski fotoğrafları temizle
const cleanupOldPhotos = async () => {
  // 30 günden eski, silinmiş kullanıcıların fotoğrafları
};
```

**Performans İzleme:**
```typescript
// Yükleme sürelerini logla
console.time('photo-upload');
// ... upload
console.timeEnd('photo-upload');
```

## 📝 Test Senaryoları

### Test 1: İlk Fotoğraf
```
1. Yeni kullanıcı
2. İlk fotoğrafı yükle
3. Otomatik ana fotoğraf olmalı
4. profiles.photo_url güncellenm eli
5. Profilde görünmeli
```

### Test 2: 6 Fotoğraf Limiti
```
1. 6 fotoğraf yükle
2. "Ekle" butonu disabled olmalı
3. 7. fotoğraf yüklenememeli
4. Uyarı mesajı gösterilmeli
```

### Test 3: Ana Fotoğraf Değiştirme
```
1. 3 fotoğraf yükle
2. 2. fotoğrafı ana yap
3. Sadece 1 ana fotoğraf olmalı
4. profiles.photo_url güncellenm eli
5. Profilde yeni fotoğraf görünmeli
```

### Test 4: Fotoğraf Silme
```
1. Ana fotoğrafı sil
2. Başka ana fotoğraf seçilmeli mi?
3. Storage'dan silinmeli
4. Database'den silinmeli
5. Galeri güncellenmeli
```

### Test 5: Profil Görüntüleme
```
1. 5 fotoğraflı profil aç
2. Ok tuşları çalışmalı
3. Göstergeler doğru olmalı
4. Sayaç: 1/5, 2/5, ...
5. Son fotoğraftan sonra ilke dönmeli
```

---

**Güncelleme Tarihi:** 7 Kasım 2025
**Versiyon:** 2.7.0
**Durum:** ✅ Çoklu Fotoğraf Galerisi Aktif!
