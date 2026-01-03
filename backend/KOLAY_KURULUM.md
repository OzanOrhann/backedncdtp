# 🚀 KOLAY KURULUM REHBERİ

## ✅ Server Her Yerde Çalışır!

Bu rehber ile server'ı:
- ✅ Bilgisayarda çalıştırabilirsiniz
- ✅ Telefonda çalıştırabilirsiniz
- ✅ Tunnel (ngrok, cloudflare) ile internet üzerinden erişebilirsiniz
- ✅ IP adresi otomatik algılanır

---

## 📱 SEÇENEK 1: BİLGİSAYARDA ÇALIŞTIRMA (En Kolay)

### Adım 1: Kurulum
```bash
cd backend
npm install
```

### Adım 2: Başlatma
```bash
npm start
```

**Server otomatik olarak:**
- ✅ IP adresini algılar
- ✅ Ekranda gösterir
- ✅ Frontend için hazır hale gelir

**Çıktı:**
```
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://192.168.1.26:3000

📱 Frontend için bu IP'yi kullanın: 192.168.1.26
============================================================
```

### Adım 3: Frontend'de IP'yi Ayarlama

**Otomatik (Önerilen):**
```javascript
// App.tsx veya frontend-integration.js içinde
import { setBackendUrl } from './backend/frontend-integration';

// Server'ın gösterdiği IP'yi kullanın
await setBackendUrl('http://192.168.1.26:3000');
```

**Manuel:**
```javascript
// backend/frontend-integration.js içinde
const DEFAULT_BACKEND_URL = 'http://192.168.1.26:3000'; // Server'ın gösterdiği IP
```

---

## 📱 SEÇENEK 2: TUNNEL İLE İNTERNET ÜZERİNDEN ERİŞİM

### ngrok Kullanımı (Önerilen)

#### 1. ngrok Kurulumu
```bash
# Windows: Chocolatey
choco install ngrok

# Mac: Homebrew
brew install ngrok

# Veya: https://ngrok.com/download
```

#### 2. ngrok Başlatma
```bash
# Terminal 1: Backend server
cd backend
npm start

# Terminal 2: ngrok tunnel
ngrok http 3000
```

**Çıktı:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

#### 3. Frontend'de Tunnel URL'ini Kullanma
```javascript
// backend/frontend-integration.js içinde
const TUNNEL_URL = 'https://abc123.ngrok.io'; // ngrok'un verdiği URL
const BACKEND_URL = TUNNEL_URL;
```

**VEYA otomatik script:**
```bash
# backend/start-tunnel.js kullanın
node start-tunnel.js
```

### Cloudflare Tunnel Kullanımı

#### 1. Cloudflared Kurulumu
```bash
# Windows: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
# Mac: brew install cloudflare/cloudflare/cloudflared
```

#### 2. Cloudflare Tunnel Başlatma
```bash
cloudflared tunnel --url http://localhost:3000
```

#### 3. Frontend'de Kullanma
```javascript
// Cloudflare'in verdiği URL'i kullanın
const BACKEND_URL = 'https://your-tunnel-url.trycloudflare.com';
```

### LocalTunnel Kullanımı

#### 1. LocalTunnel Kurulumu
```bash
npm install -g localtunnel
```

#### 2. LocalTunnel Başlatma
```bash
lt --port 3000
```

#### 3. Frontend'de Kullanma
```javascript
// LocalTunnel'in verdiği URL'i kullanın
const BACKEND_URL = 'https://your-subdomain.loca.lt';
```

---

## 📱 SEÇENEK 3: TELEFONDA ÇALIŞTIRMA

### Android (Termux)

#### 1. Termux Kurulumu
- Google Play Store'dan "Termux" uygulamasını indirin

#### 2. Node.js Kurulumu
```bash
# Termux içinde
pkg update
pkg install nodejs
pkg install git
```

#### 3. Proje Kurulumu
```bash
# WiFi hotspot açın veya aynı WiFi'ye bağlanın
cd ~
git clone [your-repo-url]
cd dtp2/backend
npm install
```

#### 4. Server Başlatma
```bash
npm start
```

**IP Adresi:**
- Termux içinde: `ifconfig` komutu ile IP'yi bulun
- Genellikle: `192.168.43.1` (hotspot) veya `192.168.1.x` (WiFi)

#### 5. Frontend'de Kullanma
```javascript
// Telefonun IP adresini kullanın
const BACKEND_URL = 'http://192.168.43.1:3000';
```

### iOS (iSH veya benzeri)

#### 1. iSH Kurulumu
- App Store'dan "iSH" uygulamasını indirin

#### 2. Node.js Kurulumu
```bash
# iSH içinde
apk add nodejs npm git
```

#### 3. Proje Kurulumu
```bash
cd ~
git clone [your-repo-url]
cd dtp2/backend
npm install
```

#### 4. Server Başlatma
```bash
npm start
```

---

## 🔧 OTOMATIK IP AYARLAMA

### Frontend'de Otomatik IP Algılama

**App.tsx içinde:**
```typescript
import { setBackendUrl, getBackendUrl } from './backend/frontend-integration';

// Server'ın IP'sini otomatik algıla (QR kod, manuel giriş, vs.)
const detectBackendIP = async () => {
  // Seçenek 1: QR kod okuma
  // Seçenek 2: Manuel giriş
  // Seçenek 3: Aynı WiFi'de otomatik tarama
  
  const ip = '192.168.1.26'; // Kullanıcıdan alın veya otomatik bulun
  await setBackendUrl(`http://${ip}:3000`);
};
```

---

## 📋 PORT DEĞİŞTİRME

### Server Port Değiştirme

**Seçenek 1: .env dosyası**
```env
PORT=8080
```

**Seçenek 2: Komut satırı**
```bash
PORT=8080 npm start
```

**Seçenek 3: server.js içinde**
```javascript
const PORT = process.env.PORT || 8080; // 3000 yerine 8080
```

### Frontend Port Güncelleme
```javascript
// backend/frontend-integration.js içinde
const DEFAULT_BACKEND_URL = 'http://192.168.1.26:8080'; // Port'u güncelleyin
```

---

## 🔥 HIZLI BAŞLANGIÇ

### 1. Bilgisayarda (En Kolay)
```bash
cd backend
npm install
npm start
# Ekranda gösterilen IP'yi frontend'de kullanın
```

### 2. Tunnel ile (İnternet)
```bash
cd backend
npm install
npm start  # Terminal 1
ngrok http 3000  # Terminal 2
# ngrok'un verdiği URL'i frontend'de kullanın
```

### 3. Telefonda (Termux)
```bash
# Termux içinde
pkg install nodejs git
cd ~ && git clone [repo] && cd dtp2/backend
npm install
npm start
# ifconfig ile IP'yi bulun ve frontend'de kullanın
```

---

## ✅ KONTROL LİSTESİ

- [ ] Backend server çalışıyor mu? (`npm start`)
- [ ] IP adresi ekranda görünüyor mu?
- [ ] Frontend'de IP adresi ayarlandı mı?
- [ ] Aynı WiFi ağında mısınız? (veya tunnel kullanıyorsanız)
- [ ] Port açık mı? (3000 veya seçtiğiniz port)
- [ ] Firewall ayarları yapıldı mı?

---

## 🆘 SORUN GİDERME

### "Connection refused" Hatası
- ✅ Server çalışıyor mu? (`npm start`)
- ✅ IP adresi doğru mu? (Server'ın gösterdiği IP)
- ✅ Port doğru mu? (3000)
- ✅ Aynı WiFi ağında mısınız?

### "Network request failed" Hatası
- ✅ localhost kullanmayın, gerçek IP kullanın
- ✅ Tunnel kullanıyorsanız URL doğru mu?
- ✅ Firewall port'u engelliyor mu?

### IP Adresi Bulunamıyor
- ✅ `ipconfig` (Windows) veya `ifconfig` (Mac/Linux) ile kontrol edin
- ✅ WiFi'ye bağlı mısınız?
- ✅ Server'ın gösterdiği IP'yi kullanın

---

## 🎉 HAZIR!

Artık server'ınız:
- ✅ Her yerde çalışabilir
- ✅ IP adresi otomatik algılanır
- ✅ Tunnel ile internet üzerinden erişilebilir
- ✅ Telefonda da çalışabilir

**Kolay gelsin!** 🚀

