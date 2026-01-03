# 📱 EAS BUILD + CLOUD BACKEND REHBERİ

## 🎯 AMAÇ

iPhone'da EAS Build ve Expo Dev ile backend'i kullanmak için cloud deployment.

---

## ✅ HAZIR MI?

### Kontrol Listesi:
- [ ] Backend cloud'a deploy edildi mi? (Railway/Render/Fly.io)
- [ ] Backend URL'i hazır mı? (`https://your-backend.railway.app`)
- [ ] Frontend'de URL ayarlandı mı?

---

## 🚀 ADIM ADIM KURULUM

### 1. Backend'i Cloud'a Deploy Edin

**Railway (Önerilen):**
1. https://railway.app → GitHub ile giriş
2. "Deploy from GitHub repo" → `dtp2` seçin
3. Root Directory: `backend`
4. Deploy edilir → URL: `https://your-project.railway.app`

**Detaylar:** `backend/DEPLOY_CLOUD.md`

---

### 2. Frontend'de Backend URL'ini Ayarlayın

**Seçenek A: Sabit URL (Hızlı)**
```javascript
// backend/frontend-integration.js (satır ~25)
const DEFAULT_BACKEND_URL = 'https://your-project.railway.app';
```

**Seçenek B: Environment Variable (Önerilen)**
```javascript
// backend/frontend-integration.js
const DEFAULT_BACKEND_URL = 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  'https://your-project.railway.app';
```

**app.json içinde:**
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "3d0ac0f0-c8ea-4320-bba4-014cf05b9f82"
      },
      "backendUrl": "https://your-project.railway.app"
    }
  }
}
```

**App.tsx içinde:**
```typescript
import Constants from 'expo-constants';
import { setBackendUrl, connectToBackend } from './backend/frontend-integration';

// Backend URL'ini ayarla
const backendUrl = Constants.expoConfig?.extra?.backendUrl || 'https://your-project.railway.app';
await setBackendUrl(backendUrl);

// Bağlan
await connectToBackend('patient', {...});
```

---

### 3. EAS Build Yapın

#### Development Build (Test İçin)
```bash
# iOS development build
eas build --profile development --platform ios

# Build tamamlandıktan sonra
eas build:run -p ios
```

#### Production Build (App Store İçin)
```bash
# iOS production build
eas build --profile production --platform ios
```

**Not:** Apple Development hesabınız gerekiyor.

---

### 4. Expo Dev ile Test Edin

#### Development Build ile:
```bash
# Development build yüklendikten sonra
npx expo start --dev-client

# QR kodu tarayın veya Expo Go kullanın
```

#### Backend Bağlantısı:
- ✅ Backend URL'i otomatik olarak kullanılır
- ✅ Cloud backend'e bağlanır
- ✅ Her yerden erişilebilir

---

## 🔧 EAS BUILD PROFİLLERİ

### eas.json Oluşturun (Root dizinde)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📱 APP.TSX'TE BACKEND URL AYARLAMA

### Otomatik Algılama (Önerilen)

```typescript
// App.tsx içinde
import Constants from 'expo-constants';
import { setBackendUrl, connectToBackend } from './backend/frontend-integration';

useEffect(() => {
  const initBackend = async () => {
    try {
      // Backend URL'ini ayarla
      const backendUrl = 
        Constants.expoConfig?.extra?.backendUrl || 
        'https://your-project.railway.app';
      
      await setBackendUrl(backendUrl);
      console.log('✅ Backend URL ayarlandı:', backendUrl);
      
      // Bağlan
      await connectToBackend('patient', {
        deviceName: 'iPhone',
        appVersion: '1.0.0'
      });
      console.log('✅ Backend\'e bağlandı');
    } catch (error) {
      console.error('❌ Backend bağlantı hatası:', error);
    }
  };
  
  initBackend();
}, []);
```

---

## 🧪 TEST ETME

### 1. Backend Health Check
```bash
# Terminal'de
curl https://your-project.railway.app/health
```

**Beklenen:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "connectedDevices": 0
}
```

### 2. Frontend'den Test
```typescript
// App.tsx içinde console.log ekleyin
console.log('Backend URL:', getBackendUrl());
console.log('Connected:', getDeviceInfo().connected);
```

### 3. EAS Build Test
```bash
# Development build yapın
eas build --profile development --platform ios

# Build tamamlandıktan sonra
eas build:run -p ios

# Expo Dev başlatın
npx expo start --dev-client

# Uygulamayı açın ve backend bağlantısını kontrol edin
```

---

## 🔒 GÜVENLİK

### Production İçin:

**1. CORS Ayarları:**
```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://your-frontend-domain.com',
    'exp://your-expo-url',
    // Development için
    /^https:\/\/.*\.expo\.dev$/
  ],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
```

**2. Environment Variables:**
```env
# Railway/Render/Fly.io'da
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 🆘 SORUN GİDERME

### "Connection refused" Hatası
- ✅ Backend deploy edildi mi?
- ✅ URL doğru mu? (`https://` ile başlamalı)
- ✅ Health check çalışıyor mu?

### "CORS Error" Hatası
- ✅ `server.js` içinde CORS ayarları var mı?
- ✅ Development için `origin: "*"` kullanın

### "WebSocket connection failed"
- ✅ Backend URL'i `https://` ile mi başlıyor?
- ✅ Socket.IO CORS ayarları doğru mu?

### EAS Build Hatası
- ✅ Apple Development hesabı bağlı mı?
- ✅ `eas.json` dosyası var mı?
- ✅ `app.json` içinde `bundleIdentifier` doğru mu?

---

## ✅ SONUÇ

Artık:
- ✅ Backend cloud'da çalışıyor
- ✅ iPhone'da EAS Build ile kullanabilirsiniz
- ✅ Expo Dev ile test edebilirsiniz
- ✅ Her yerden erişilebilir

**Hazır!** 🎉

