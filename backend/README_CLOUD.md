# ☁️ CLOUD DEPLOYMENT - HIZLI BAŞLANGIÇ

## 🎯 iPhone'da EAS Build + Expo Dev İçin

Backend'i cloud'a deploy ederek iPhone'da kullanabilirsiniz!

---

## 🚀 EN KOLAY YOL: RAILWAY (5 DAKİKA)

### 1. Railway'a Git
https://railway.app → "Start a New Project" → "Deploy from GitHub repo"

### 2. Repository Seç
- Repository: `dtp2`
- Root Directory: `backend`
- Deploy!

### 3. URL'i Al
Railway size bir URL verir: `https://your-project.railway.app`

### 4. Frontend'de Kullan
```javascript
// backend/frontend-integration.js (satır ~25)
const DEFAULT_BACKEND_URL = 'https://your-project.railway.app';
```

**VEYA App.tsx içinde:**
```typescript
import { setBackendUrl } from './backend/frontend-integration';
await setBackendUrl('https://your-project.railway.app');
```

### 5. EAS Build Yap
```bash
eas build --profile development --platform ios
```

**Hazır!** ✅

---

## 📚 DETAYLI REHBERLER

- **Cloud Deployment:** `DEPLOY_CLOUD.md`
- **EAS Build:** `EAS_BUILD_REHBERİ.md`
- **Kolay Kurulum:** `KOLAY_KURULUM.md`

---

## ✅ KONTROL

Backend çalışıyor mu?
```bash
curl https://your-project.railway.app/health
```

**Beklenen:**
```json
{"status":"OK","connectedDevices":0}
```

---

## 🆘 SORUN MU VAR?

1. Backend deploy edildi mi?
2. URL doğru mu? (`https://` ile başlamalı)
3. Frontend'de URL ayarlandı mı?

**Detaylar:** `DEPLOY_CLOUD.md` ve `EAS_BUILD_REHBERİ.md`

---

**Kolay gelsin!** 🚀

