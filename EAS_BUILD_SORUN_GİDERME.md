# 🔧 EAS BUILD SORUN GİDERME

## 🎯 YAYGIN SORUNLAR VE ÇÖZÜMLERİ

### 1. ❌ "Module not found" veya Import Hatası

**Sorun:** Backend dosyaları frontend'de import edilirken hata veriyor.

**Çözüm:**

#### A. `backend/frontend-integration.js` Import Sorunları

**Sorun:** `backend/alarm-detection.js` CommonJS kullanıyor, ES6 import ile uyumsuz.

**Çözüm:** `backend/alarm-detection.js` dosyasını kontrol edin:

```javascript
// backend/alarm-detection.js - SON SATIRLAR
// ES6 Modules export (React Native için)
export { detectAlarms, calculateMovement };

// CommonJS export (Node.js backend için - uyumluluk için)
module.exports = {
  detectAlarms,
  calculateMovement
};
```

**Kontrol:**
```bash
# backend/alarm-detection.js dosyasının sonunda her iki export da olmalı
cat backend/alarm-detection.js | tail -10
```

#### B. `backend/frontend-integration.js` Import Yolu

**Sorun:** `import { detectAlarms } from './alarm-detection';` yolu yanlış olabilir.

**Çözüm:** Dosya yolu doğru mu kontrol edin:
```javascript
// backend/frontend-integration.js (satır 11)
import { detectAlarms } from './alarm-detection'; // ✅ Doğru (aynı klasörde)
```

---

### 2. ❌ "Cannot find module 'socket.io-client'"

**Sorun:** `socket.io-client` paketi yüklü değil.

**Çözüm:**
```bash
# Root dizinde (dtp2/)
npm install socket.io-client
```

**Kontrol:**
```bash
# package.json'da olmalı
cat package.json | grep socket.io-client
```

---

### 3. ❌ "Cannot find module '@react-native-async-storage/async-storage'"

**Sorun:** AsyncStorage paketi yüklü değil.

**Çözüm:**
```bash
npm install @react-native-async-storage/async-storage
```

**Kontrol:**
```bash
cat package.json | grep async-storage
```

---

### 4. ❌ "Backend URL is not defined" veya Connection Error

**Sorun:** `DEFAULT_BACKEND_URL` tanımlı değil veya yanlış.

**Çözüm:**

#### A. `backend/frontend-integration.js` içinde URL kontrolü:
```javascript
// backend/frontend-integration.js (satır ~28)
const DEFAULT_BACKEND_URL = 
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_BACKEND_URL) ||
  'http://192.168.1.26:3000'; // ⚠️ Cloud URL veya local IP yazın
```

#### B. Cloud deployment kullanıyorsanız:
```javascript
const DEFAULT_BACKEND_URL = 'https://your-project.railway.app';
```

#### C. Environment variable kullanın:
```bash
# .env dosyası oluşturun (root dizinde)
EXPO_PUBLIC_BACKEND_URL=https://your-project.railway.app
```

---

### 5. ❌ "TypeScript Error" veya Type Hataları

**Sorun:** TypeScript type tanımları eksik.

**Çözüm:**

#### A. `backend/frontend-integration.js` için type tanımları:
```typescript
// types/backend-integration.d.ts (oluşturun)
declare module './backend/frontend-integration' {
  export function connectToBackend(type: string, deviceInfo?: any): Promise<any>;
  export function sendSensorData(data: any): void;
  export function sendAlarm(alarm: any): void;
  // ... diğer fonksiyonlar
}
```

#### B. VEYA `backend/frontend-integration.js` dosyasını `.ts` yapın:
```bash
mv backend/frontend-integration.js backend/frontend-integration.ts
```

---

### 6. ❌ "Build failed" - Native Module Hatası

**Sorun:** Native modüller (Bluetooth, Notifications) düzgün yüklenmemiş.

**Çözüm:**

#### A. `app.json` kontrolü:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "...",
        "NSBluetoothPeripheralUsageDescription": "..."
      }
    }
  }
}
```

#### B. Prebuild yapın:
```bash
npx expo prebuild --clean
```

#### C. Yeni build yapın:
```bash
eas build --platform ios --profile development --clear-cache
```

---

### 7. ❌ "Bundle failed" - Metro Bundler Hatası

**Sorun:** Metro bundler kodları derleyemiyor.

**Çözüm:**

#### A. Cache temizleme:
```bash
npx expo start --clear
```

#### B. node_modules temizleme:
```bash
rm -rf node_modules
npm install
```

#### C. Watchman temizleme (Mac):
```bash
watchman watch-del-all
```

---

### 8. ❌ "Apple Development Account" Hatası

**Sorun:** Apple Development hesabı bağlı değil.

**Çözüm:**

#### A. EAS'a giriş yapın:
```bash
eas login
```

#### B. Apple Development hesabını bağlayın:
```bash
eas credentials
```

#### C. `eas.json` kontrolü:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    }
  }
}
```

---

### 9. ❌ "Bundle Identifier" Hatası

**Sorun:** `bundleIdentifier` yanlış veya çakışıyor.

**Çözüm:**

#### A. `app.json` kontrolü:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.anonymous.expocdtp" // ✅ Benzersiz olmalı
    }
  }
}
```

#### B. Benzersiz bir bundle identifier kullanın:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourname.expocdtp"
  }
}
```

---

### 10. ❌ "SDK Version" Uyumsuzluğu

**Sorun:** Expo SDK versiyonu uyumsuz.

**Çözüm:**

#### A. `package.json` kontrolü:
```json
{
  "dependencies": {
    "expo": "~54.0.30" // ✅ app.json'daki SDK ile uyumlu olmalı
  }
}
```

#### B. SDK versiyonunu güncelleyin:
```bash
npx expo install expo@latest
```

---

## 🔍 BUILD LOGLARINI İNCELEME

### Build loglarını görüntüleme:
```bash
# Build ID ile logları görüntüle
eas build:view [BUILD_ID]

# VEYA web'de
# https://expo.dev/accounts/[your-account]/builds/[BUILD_ID]
```

### Hata mesajlarını arama:
```bash
# Loglarda "error" kelimesini ara
eas build:view [BUILD_ID] | grep -i error
```

---

## ✅ KONTROL LİSTESİ

Build yapmadan önce:

- [ ] `npm install` yapıldı mı? (root dizinde)
- [ ] `backend/frontend-integration.js` import'ları doğru mu?
- [ ] `backend/alarm-detection.js` hem ES6 hem CommonJS export ediyor mu?
- [ ] `socket.io-client` yüklü mü? (`package.json`)
- [ ] `@react-native-async-storage/async-storage` yüklü mü?
- [ ] `DEFAULT_BACKEND_URL` tanımlı mı?
- [ ] `app.json` içinde `bundleIdentifier` benzersiz mi?
- [ ] `eas.json` dosyası var mı?
- [ ] Apple Development hesabı bağlı mı? (`eas credentials`)
- [ ] Expo SDK versiyonu uyumlu mu?

---

## 🚀 HIZLI ÇÖZÜM (En Yaygın Sorunlar)

### 1. Tüm bağımlılıkları yeniden yükleyin:
```bash
rm -rf node_modules
npm install
```

### 2. Cache temizleyin:
```bash
npx expo start --clear
```

### 3. Prebuild yapın:
```bash
npx expo prebuild --clean
```

### 4. Yeni build yapın (cache temizleyerek):
```bash
eas build --platform ios --profile development --clear-cache
```

---

## 📋 BUILD DURUMU KONTROLÜ

### Build durumunu kontrol etme:
```bash
# Tüm build'leri listele
eas build:list

# Belirli bir build'i görüntüle
eas build:view [BUILD_ID]
```

### Build durumları:
- **in-progress**: Build devam ediyor
- **finished**: Build tamamlandı ✅
- **errored**: Build başarısız ❌
- **canceled**: Build iptal edildi

---

## 🆘 HALA ÇALIŞMIYORSA

1. **Build loglarını inceleyin:**
   ```bash
   eas build:view [BUILD_ID]
   ```

2. **Hata mesajını paylaşın:**
   - Build ID
   - Hata mesajı
   - Hangi adımda hata verdi?

3. **Minimal test yapın:**
   - `backend/frontend-integration.js` import'larını kaldırın
   - Basit bir build yapın
   - Adım adım ekleyin

---

## 💡 İPUÇLARI

1. **Development build** kullanın (production değil)
2. **Cache temizleyerek** build yapın (`--clear-cache`)
3. **Build loglarını** mutlaka okuyun
4. **Küçük değişiklikler** yapın, her seferinde test edin
5. **Cloud backend** kullanın (localhost yerine)

---

**Detaylı hata mesajını paylaşırsanız daha spesifik çözüm önerebilirim!** 🔍

