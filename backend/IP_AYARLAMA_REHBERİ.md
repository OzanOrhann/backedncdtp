# 🌐 IP AYARLAMA REHBERİ

## ✅ OTOMATIK IP ALGILAMA

Server artık **otomatik olarak IP adresinizi algılar** ve ekranda gösterir!

### Server Başlatıldığında:
```
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://192.168.1.26:3000

📱 Frontend için bu IP'yi kullanın: 192.168.1.26

📋 Tüm IP Adresleri:
   1. Wi-Fi: http://192.168.1.26:3000
   2. Ethernet: http://192.168.1.27:3000
============================================================
```

**Server'ın gösterdiği IP'yi frontend'de kullanın!**

---

## 📱 FRONTEND'DE IP AYARLAMA

### Seçenek 1: Otomatik (AsyncStorage) - ÖNERİLEN

```typescript
// App.tsx içinde
import { setBackendUrl, connectToBackend } from './backend/frontend-integration';

// Server'ın gösterdiği IP'yi ayarlayın
await setBackendUrl('http://192.168.1.26:3000');

// Sonra bağlanın
await connectToBackend('patient', {...});
```

**Avantajlar:**
- ✅ IP adresi AsyncStorage'da saklanır
- ✅ Uygulama kapanıp açılsa bile hatırlanır
- ✅ Kolayca değiştirilebilir

### Seçenek 2: Manuel (Kod İçinde)

```javascript
// backend/frontend-integration.js içinde
const DEFAULT_BACKEND_URL = 'http://192.168.1.26:3000'; // Server'ın gösterdiği IP
```

### Seçenek 3: Tunnel URL (İnternet)

```javascript
// backend/frontend-integration.js içinde
const TUNNEL_URL = 'https://abc123.ngrok.io'; // ngrok URL'i
const BACKEND_URL = TUNNEL_URL;
```

---

## 🔄 IP DEĞİŞTİRME

### Frontend'de IP Değiştirme

```typescript
import { setBackendUrl, getBackendUrl } from './backend/frontend-integration';

// Mevcut IP'yi görüntüle
console.log('Mevcut IP:', getBackendUrl());

// Yeni IP ayarla
await setBackendUrl('http://192.168.1.30:3000');

// Yeniden bağlan
await connectToBackend('patient', {...});
```

---

## 🌍 TUNNEL KULLANIMI

### ngrok ile Tunnel

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: ngrok
ngrok http 3000
```

**ngrok çıktısı:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Frontend'de kullanın:**
```javascript
await setBackendUrl('https://abc123.ngrok.io');
```

### Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

**Frontend'de kullanın:**
```javascript
await setBackendUrl('https://your-tunnel-url.trycloudflare.com');
```

### LocalTunnel

```bash
lt --port 3000
```

**Frontend'de kullanın:**
```javascript
await setBackendUrl('https://your-subdomain.loca.lt');
```

---

## 📱 TELEFONDA ÇALIŞTIRMA

### Android (Termux)

1. **Termux'u açın**
2. **Server'ı başlatın:**
   ```bash
   cd ~/dtp2/backend
   npm start
   ```
3. **IP adresini bulun:**
   ```bash
   ifconfig
   ```
   Genellikle: `192.168.43.1` (hotspot) veya `192.168.1.x` (WiFi)

4. **Frontend'de kullanın:**
   ```javascript
   await setBackendUrl('http://192.168.43.1:3000');
   ```

### iOS (iSH)

1. **iSH'u açın**
2. **Server'ı başlatın:**
   ```bash
   cd ~/dtp2/backend
   npm start
   ```
3. **IP adresini bulun:**
   ```bash
   ifconfig
   ```

---

## 🔧 PORT DEĞİŞTİRME

### Server Port Değiştirme

**Seçenek 1: .env dosyası**
```env
PORT=8080
```

**Seçenek 2: Komut satırı**
```bash
PORT=8080 npm start
```

**Seçenek 3: server.js**
```javascript
const PORT = process.env.PORT || 8080;
```

### Frontend Port Güncelleme

```javascript
await setBackendUrl('http://192.168.1.26:8080');
```

---

## ✅ KONTROL LİSTESİ

- [ ] Server başlatıldı mı? (`npm start`)
- [ ] IP adresi ekranda görünüyor mu?
- [ ] Frontend'de IP ayarlandı mı? (`setBackendUrl()`)
- [ ] Aynı WiFi ağında mısınız? (veya tunnel kullanıyorsanız)
- [ ] Port doğru mu? (3000 veya seçtiğiniz port)

---

## 🆘 SORUN GİDERME

### "Connection refused" Hatası
- ✅ Server çalışıyor mu?
- ✅ IP adresi doğru mu? (Server'ın gösterdiği IP)
- ✅ Port doğru mu?
- ✅ Aynı WiFi ağında mısınız?

### IP Adresi Bulunamıyor
- ✅ `ipconfig` (Windows) veya `ifconfig` (Mac/Linux) ile kontrol edin
- ✅ WiFi'ye bağlı mısınız?
- ✅ Server'ın gösterdiği IP'yi kullanın

### Tunnel Çalışmıyor
- ✅ Tunnel aracı kurulu mu? (ngrok, cloudflared, vs.)
- ✅ Backend server çalışıyor mu?
- ✅ Tunnel URL'i doğru mu?

---

## 🎉 HAZIR!

Artık:
- ✅ IP adresi otomatik algılanır
- ✅ Frontend'de kolayca ayarlanabilir
- ✅ Tunnel ile internet üzerinden erişilebilir
- ✅ Telefonda da çalışır

**Kolay gelsin!** 🚀

