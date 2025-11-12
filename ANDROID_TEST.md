# Android'de Test Etme Rehberi

## Yöntem 1: Aynı WiFi Ağında (ÖNERİLEN - EN HIZLI)

### Adım 1: Dev Server'ı Başlat
```bash
npm run dev
```

### Adım 2: IP Adresini Öğren

**Windows:**
```bash
ipconfig
```
`IPv4 Address` satırını bul (örn: 192.168.1.105)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Adım 3: Android'de Aç
1. Android telefonun bilgisayarla **aynı WiFi**'ye bağlı olduğundan emin ol
2. Chrome veya başka bir tarayıcı aç
3. Adres çubuğuna yaz: `http://192.168.1.105:5173` (IP'ni kullan)
4. Enter'a bas

✅ Artık değişiklikleri anlık görebilirsin!

---

## Yöntem 2: Ngrok ile (İnternetten Erişim)

### Adım 1: Dev Server'ı Başlat
```bash
npm run dev
```

### Adım 2: Ngrok'u Başlat (Yeni Terminal)
```bash
npx ngrok http 5173
```

### Adım 3: URL'i Kopyala
Ngrok sana bir URL verecek:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

### Adım 4: Android'de Aç
Bu URL'i Android'de herhangi bir tarayıcıda aç.

✅ İnternetten erişilebilir, WiFi'ye gerek yok!

---

## Yöntem 3: Vercel ile Deploy (Kalıcı)

### Adım 1: Vercel CLI Kur
```bash
npm i -g vercel
```

### Adım 2: Deploy Et
```bash
vercel
```

İlk seferde:
- Login ol (GitHub ile)
- Projeyi seç
- Ayarları onayla

### Adım 3: Production Deploy
```bash
vercel --prod
```

✅ Kalıcı URL alırsın (örn: `https://teklif-et.vercel.app`)

---

## Yöntem 4: GitHub Pages (Ücretsiz Hosting)

### Adım 1: vite.config.ts Güncelle
```typescript
export default defineConfig({
  base: '/repo-adi/', // GitHub repo adın
  // ...
})
```

### Adım 2: Build ve Deploy
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

### Adım 3: GitHub Settings
1. Repo -> Settings -> Pages
2. Source: `gh-pages` branch seç
3. Save

✅ `https://username.github.io/repo-adi` adresinde yayında!

---

## Sorun Giderme

### "Siteye erişilemiyor" Hatası
- [ ] Bilgisayar ve telefon aynı WiFi'de mi?
- [ ] Firewall dev server'ı engelliyor mu?
- [ ] IP adresi doğru mu?
- [ ] Port 5173 açık mı?

### Firewall Sorunu (Windows)
```bash
# PowerShell'i Admin olarak aç
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Değişiklikler Yansımıyor
- [ ] Hard refresh yap (Ctrl+Shift+R)
- [ ] Cache temizle
- [ ] Dev server'ı yeniden başlat

---

## Hızlı Komutlar

```bash
# Lokal test (sadece bilgisayarda)
npm run dev:local

# Network'te test (telefonda görmek için)
npm run dev

# Production build
npm run build

# Build'i önizle
npm run preview

# Vercel'e deploy
vercel

# Production deploy
vercel --prod
```

---

## Önerilen Workflow

1. **Geliştirme:** `npm run dev` (aynı WiFi'de test)
2. **Test:** Değişiklikleri Android'de kontrol et
3. **Commit:** `git add . && git commit -m "fix"`
4. **Deploy:** `vercel --prod` veya `git push`

✅ Artık mobil uyumlu geliştirme yapabilirsin!
