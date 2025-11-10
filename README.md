# Teklif.et - Sosyal Aktivite Platformu 🎉

Modern, Instagram tarzı bir sosyal aktivite platformu. Kullanıcılar etkinlik talepleri oluşturabilir, teklifler gönderebilir ve eşleşebilir.

## 🚀 Özellikler

### 🎯 Temel Özellikler
- **Aktivite Talepleri**: Kahve, yemek, spor, sinema, gezi ve daha fazlası
- **Teklif Sistemi**: Taleplere teklif gönder, kabul et veya reddet
- **Eşleşme**: Kabul edilen teklifler otomatik eşleşmeye dönüşür
- **Mesajlaşma**: Instagram tarzı gerçek zamanlı mesajlaşma
- **Profil Sistemi**: Çoklu fotoğraf galerisi ve detaylı profiller

### 💎 Premium Özellikler
- **Boost Sistemi**: 30 dakika 3x görünürlük
- **Super Like**: Özel ilgi göster
- **Sınırsız Teklif**: Premium kullanıcılar için sınırsız teklif hakkı
- **Paket Sistemi**: 10, 20 veya sınırsız teklif paketleri

### 🔔 Bildirimler
- Gerçek zamanlı bildirimler
- Browser push notifications
- Yeni teklif, kabul, mesaj bildirimleri
- Okundu işaretleme ve yönetim

### 📸 Fotoğraf Sistemi
- Çoklu fotoğraf yükleme (5 fotoğrafa kadar)
- Ana fotoğraf seçimi
- Fotoğraf galerisi görüntüleme
- Supabase Storage entegrasyonu

### 💬 Mesajlaşma
- Instagram tarzı arayüz
- Gerçek zamanlı mesajlar
- Okundu bilgisi
- Kişi bazlı okunmamış sayısı

## 🛠️ Teknolojiler

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Real-time Subscriptions
  - Storage
- **Icons**: Lucide React

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Projeyi klonla**
```bash
git clone https://github.com/hasancavitkocak/teklif.et.git
cd teklif.et
```

2. **Bağımlılıkları yükle**
```bash
npm install
```

3. **Environment variables ayarla**
```bash
cp .env.example .env
```

`.env` dosyasını düzenle:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase migration'ları çalıştır**
```bash
# Supabase CLI ile
supabase db push

# Veya SQL dosyalarını manuel olarak çalıştır:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_activity_offers.sql
# supabase/migrations/003_storage_setup.sql
# supabase/migrations/004_add_read_at.sql
# supabase/migrations/005_boost_system.sql
# supabase/migrations/006_photo_gallery.sql
# supabase/migrations/007_notifications.sql
```

5. **Development server'ı başlat**
```bash
npm run dev
```

## 📁 Proje Yapısı

```
teklif.et/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── Auth.tsx        # Giriş/Kayıt
│   │   ├── Layout.tsx      # Ana layout
│   │   ├── DiscoverOffers.tsx  # Keşfet sayfası
│   │   ├── Offers.tsx      # Teklifler
│   │   ├── Matches.tsx     # Eşleşmeler
│   │   ├── Chat.tsx        # Mesajlaşma
│   │   ├── Profile.tsx     # Profil
│   │   ├── NotificationCenter.tsx  # Bildirimler
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ModalContext.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useNotifications.ts
│   ├── lib/                # Utilities
│   │   ├── supabase.ts
│   │   └── notifications.ts
│   └── App.tsx
├── supabase/
│   └── migrations/         # Database migrations
├── scripts/                # Utility scripts
└── public/
```

## 🗄️ Database Schema

### Ana Tablolar
- `profiles` - Kullanıcı profilleri
- `activity_offers` - Aktivite talepleri
- `offer_requests` - Gönderilen teklifler
- `offers` - Eşleşmeler (eski sistem)
- `messages` - Mesajlar
- `notifications` - Bildirimler
- `packages` - Satın alınan paketler
- `boosts` - Boost geçmişi
- `super_likes` - Super like geçmişi
- `profile_photos` - Profil fotoğrafları

## 🎨 Özellik Detayları

### Teklif Sistemi
1. Kullanıcı aktivite talebi oluşturur
2. Diğer kullanıcılar teklif gönderir
3. Talep sahibi teklifleri kabul/reddeder
4. Kabul edilen teklifler eşleşmeye dönüşür
5. Eşleşen kullanıcılar mesajlaşabilir

### Boost Sistemi
- 30 dakika süreyle 3x görünürlük
- Keşfet sayfasında en üstte görünme
- Özel rozet gösterimi
- Premium özellik

### Bildirim Sistemi
- Gerçek zamanlı Supabase subscriptions
- Browser push notifications
- Bildirim tercihleri
- Okundu/okunmadı durumu

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Hasan Cavit Koçak**
- GitHub: [@hasancavitkocak](https://github.com/hasancavitkocak)

## 🙏 Teşekkürler

- [Supabase](https://supabase.com) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide](https://lucide.dev) - Icons
- [Vite](https://vitejs.dev) - Build tool

---

⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!
