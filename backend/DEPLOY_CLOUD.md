# ☁️ CLOUD DEPLOYMENT REHBERİ

## 🎯 AMAÇ

Backend'i cloud'a deploy ederek:
- ✅ iPhone'da EAS Build ile çalıştırabilirsiniz
- ✅ Expo Dev ile test edebilirsiniz
- ✅ Her yerden erişilebilir
- ✅ Ücretsiz tier'lar mevcut

---

## 🚀 SEÇENEK 1: RAILWAY (EN KOLAY - ÖNERİLEN)

### Adım 1: Railway Hesabı Oluştur
1. https://railway.app adresine gidin
2. "Start a New Project" → "Deploy from GitHub repo"
3. GitHub hesabınızı bağlayın

### Adım 2: Repository Seç
1. `dtp2` repository'sini seçin
2. "Root Directory" → `backend` yazın
3. "Deploy" butonuna tıklayın

### Adım 3: Environment Variables (Opsiyonel)
Railway dashboard'da:
- `NODE_ENV` = `production`
- `PORT` = `3000` (otomatik ayarlanır)

### Adım 4: Deploy
- Railway otomatik olarak deploy eder
- URL: `https://your-project-name.railway.app`

### Adım 5: Frontend'de Kullan
```javascript
// backend/frontend-integration.js içinde
const DEFAULT_BACKEND_URL = 'https://your-project-name.railway.app';
```

**VEYA dinamik olarak:**
```typescript
import { setBackendUrl } from './backend/frontend-integration';

await setBackendUrl('https://your-project-name.railway.app');
```

---

## 🚀 SEÇENEK 2: RENDER (ÜCRETSİZ - KOLAY)

### Adım 1: Render Hesabı Oluştur
1. https://render.com adresine gidin
2. "Get Started for Free" → GitHub ile giriş yapın

### Adım 2: Yeni Web Service Oluştur
1. "New" → "Web Service"
2. GitHub repository'nizi seçin
3. Ayarlar:
   - **Name**: `cdtp-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Adım 3: Deploy
- Render otomatik olarak deploy eder
- URL: `https://cdtp-backend.onrender.com`

### Adım 4: Frontend'de Kullan
```javascript
const DEFAULT_BACKEND_URL = 'https://cdtp-backend.onrender.com';
```

**Not:** Render ücretsiz tier'da 15 dakika inaktiviteden sonra uyku moduna geçer. İlk istekte 30-60 saniye bekleme olabilir.

---

## 🚀 SEÇENEK 3: FLY.IO (ÜCRETSİZ - HIZLI)

### Adım 1: Fly CLI Kurulumu
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac
curl -L https://fly.io/install.sh | sh
```

### Adım 2: Login
```bash
fly auth login
```

### Adım 3: Deploy
```bash
cd backend
fly launch
```

**Sorular:**
- App name: `cdtp-backend` (veya istediğiniz isim)
- Region: En yakın bölgeyi seçin
- PostgreSQL: `No` (şimdilik gerek yok)

### Adım 4: Deploy Et
```bash
fly deploy
```

### Adım 5: URL'i Bul
```bash
fly info
```

URL: `https://cdtp-backend.fly.dev`

### Adım 6: Frontend'de Kullan
```javascript
const DEFAULT_BACKEND_URL = 'https://cdtp-backend.fly.dev';
```

---

## 📱 EAS BUILD İLE KULLANIM

### 1. Backend URL'ini Ayarlayın

**Seçenek A: Kod İçinde (Sabit)**
```javascript
// backend/frontend-integration.js
const DEFAULT_BACKEND_URL = 'https://your-backend.railway.app';
```

**Seçenek B: Environment Variable (Önerilen)**
```javascript
// backend/frontend-integration.js
const DEFAULT_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
```

**app.json içinde:**
```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://your-backend.railway.app"
    }
  }
}
```

**App.tsx içinde:**
```typescript
import Constants from 'expo-constants';

const backendUrl = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000';
await setBackendUrl(backendUrl);
```

### 2. EAS Build Yapın
```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

### 3. Expo Dev ile Test
```bash
# Development build ile
npx expo start --dev-client

# Backend URL'i otomatik olarak kullanılır
```

---

## 🔧 ENVIRONMENT VARIABLES

### Railway/Render/Fly.io'da Ayarlayın:

```env
NODE_ENV=production
PORT=3000
```

**Opsiyonel:**
```env
TUNNEL_URL=https://your-tunnel.ngrok.io
AUTO_SAVE_IP=false
```

---

## ✅ KONTROL LİSTESİ

### Deployment Öncesi:
- [ ] Backend kodları hazır mı?
- [ ] `package.json` içinde `start` script var mı?
- [ ] `server.js` port'u `process.env.PORT` kullanıyor mu?
- [ ] Database dosyaları `.gitignore`'da mı? (JSON dosyaları)

### Deployment Sonrası:
- [ ] Backend URL'i çalışıyor mu? (`https://your-backend.railway.app/health`)
- [ ] Frontend'de URL ayarlandı mı?
- [ ] EAS Build yapıldı mı?
- [ ] Expo Dev ile test edildi mi?

---

## 🧪 TEST ETME

### 1. Backend Health Check
```bash
curl https://your-backend.railway.app/health
```

**Beklenen yanıt:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": 123.45,
  "connectedDevices": 0
}
```

### 2. Frontend'den Test
```typescript
import { setBackendUrl, connectToBackend } from './backend/frontend-integration';

// Backend URL'ini ayarla
await setBackendUrl('https://your-backend.railway.app');

// Bağlan
await connectToBackend('patient', {
  deviceName: 'Test Device',
  appVersion: '1.0.0'
});
```

---

## 🆘 SORUN GİDERME

### "Connection refused" Hatası
- ✅ Backend deploy edildi mi?
- ✅ URL doğru mu? (`https://` ile başlamalı)
- ✅ Health check çalışıyor mu?

### "CORS Error" Hatası
- ✅ `server.js` içinde CORS ayarları var mı?
- ✅ `origin: "*"` kullanılıyor mu? (development için)

### "WebSocket connection failed"
- ✅ Socket.IO CORS ayarları doğru mu?
- ✅ Backend URL'i `https://` ile mi başlıyor?

### Render'da Uyku Modu
- ✅ İlk istekte 30-60 saniye bekleyin
- ✅ VEYA Railway/Fly.io kullanın (uyku modu yok)

---

## 💰 FİYATLANDIRMA

### Railway
- **Free Tier**: $5 kredi/ay (küçük projeler için yeterli)
- **Hobby**: $5/ay (daha fazla kaynak)

### Render
- **Free Tier**: Ücretsiz (uyku modu var)
- **Starter**: $7/ay (uyku modu yok)

### Fly.io
- **Free Tier**: 3 shared-cpu-1x VM (küçük projeler için yeterli)
- **Paid**: Kullanım bazlı

---

## 🎉 HAZIR!

Artık:
- ✅ Backend cloud'da çalışıyor
- ✅ iPhone'da EAS Build ile kullanabilirsiniz
- ✅ Expo Dev ile test edebilirsiniz
- ✅ Her yerden erişilebilir

**Kolay gelsin!** 🚀

