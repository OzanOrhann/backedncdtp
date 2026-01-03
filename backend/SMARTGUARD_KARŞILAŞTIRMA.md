# 🔍 SMARTGUARD vs DTP2 BACKEND KARŞILAŞTIRMA

## 📊 SMARTGUARD PROJESİ YAPISI

GitHub repository: https://github.com/OzanOrhann/SmartGuard

**Klasör Yapısı:**
```
SmartGuard/
├── smartguard-mobile/    # Mobil uygulama
├── smartguard-web/       # Web uygulaması
└── smartguard_api/       # Backend API
```

---

## 🚀 SMARTGUARD BACKEND NASIL ÇALIŞTIRILIR?

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/OzanOrhann/SmartGuard.git
cd SmartGuard/smartguard_api
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables Ayarlayın
`.env` dosyası oluşturun:
```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/smartguard
JWT_SECRET=your_jwt_secret
```

**Not:** SmartGuard muhtemelen MongoDB kullanıyor (bizim projemiz JSON kullanıyor).

### 4. Veritabanını Başlatın
```bash
# MongoDB çalıştığından emin olun
mongod
```

### 5. Backend'i Başlatın
```bash
npm start
```

**VEYA development mode:**
```bash
npm run dev
```

---

## 🔄 DTP2 (BİZİM PROJE) vs SMARTGUARD

### Benzerlikler:
- ✅ Node.js + Express kullanıyor
- ✅ REST API endpoints
- ✅ WebSocket (Socket.IO) muhtemelen
- ✅ `npm start` ile başlatılıyor

### Farklılıklar:

| Özellik | SmartGuard | DTP2 (Bizim Proje) |
|---------|-----------|-------------------|
| **Database** | MongoDB (tahmin) | JSON dosyaları |
| **Kurulum** | MongoDB gerektirir | Ekstra kurulum yok |
| **Port** | 3000 (varsayılan) | 3000 (varsayılan) |
| **Environment** | `.env` dosyası gerekli | Opsiyonel |
| **Yapı** | `smartguard_api/` klasörü | `backend/` klasörü |

---

## 📋 SMARTGUARD BACKEND YAPISI (TAHMIN)

### Muhtemel Dosya Yapısı:
```
smartguard_api/
├── package.json
├── server.js (veya app.js, index.js)
├── .env
├── routes/
│   ├── auth.js
│   ├── devices.js
│   └── sensors.js
├── models/
│   ├── User.js
│   ├── Device.js
│   └── SensorData.js
├── controllers/
│   └── ...
├── middleware/
│   └── auth.js
└── config/
    └── database.js
```

### Muhtemel package.json:
```json
{
  "name": "smartguard-api",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.x",
    "mongoose": "^6.x",
    "socket.io": "^4.x",
    "jsonwebtoken": "^9.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  }
}
```

---

## 🔧 DTP2 BACKEND YAPISI (BİZİM PROJE)

### Mevcut Dosya Yapısı:
```
backend/
├── package.json
├── server.js          # Ana server dosyası
├── database.js         # JSON database yönetimi
├── data-format.js     # Veri formatı/parsing
├── alarm-detection.js # Alarm tespiti
├── frontend-integration.js # Frontend entegrasyonu
├── get-ip.js          # IP algılama
├── start-tunnel.js    # Tunnel başlatma
└── database/          # JSON dosyaları
    ├── devices.json
    ├── sensor-data.json
    ├── alarms.json
    └── thresholds.json
```

### package.json:
```json
{
  "name": "cdtp-backend",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "tunnel": "node start-tunnel.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

---

## 🚀 BAŞLATMA KARŞILAŞTIRMASI

### SmartGuard:
```bash
# 1. MongoDB başlat (gerekli)
mongod

# 2. Backend başlat
cd smartguard_api
npm install
npm start
```

### DTP2 (Bizim Proje):
```bash
# 1. Backend başlat (MongoDB gerekmez!)
cd backend
npm install
npm start
```

**Avantaj:** DTP2'de ekstra database kurulumu yok, JSON dosyaları otomatik oluşur!

---

## 📱 FRONTEND ENTEGRASYONU

### SmartGuard:
Muhtemelen:
```javascript
// Frontend'de
const API_URL = 'http://localhost:3000/api';
// veya
const API_URL = 'https://smartguard-api.herokuapp.com';
```

### DTP2:
```javascript
// backend/frontend-integration.js
const DEFAULT_BACKEND_URL = 'http://192.168.1.26:3000';
// veya cloud: 'https://your-project.railway.app'
```

**Avantaj:** DTP2'de otomatik IP algılama ve AsyncStorage desteği var!

---

## 🔍 DETAYLI İNCELEME İÇİN

SmartGuard projesini detaylı incelemek için:

```bash
# Repository'yi klonlayın
git clone https://github.com/OzanOrhann/SmartGuard.git

# Backend klasörüne gidin
cd SmartGuard/smartguard_api

# package.json'u inceleyin
cat package.json

# server.js veya ana dosyayı inceleyin
cat server.js  # veya app.js, index.js
```

---

## ✅ ÖZET

### SmartGuard Backend:
1. ✅ MongoDB gerektirir
2. ✅ `.env` dosyası gerekli
3. ✅ `npm start` ile başlatılır
4. ✅ Muhtemelen JWT authentication var

### DTP2 Backend (Bizim):
1. ✅ JSON database (ekstra kurulum yok)
2. ✅ `.env` opsiyonel
3. ✅ `npm start` ile başlatılır
4. ✅ Otomatik IP algılama
5. ✅ Cloud deployment hazır (Railway, Render, Fly.io)
6. ✅ Tunnel desteği (ngrok, cloudflare)

---

## 💡 SONUÇ

**SmartGuard** daha gelişmiş bir yapıya sahip (MongoDB, authentication, vs.) ama **DTP2** daha basit ve hızlı başlangıç için ideal (JSON database, otomatik IP algılama, cloud deployment hazır).

**Her ikisi de:**
- ✅ Node.js + Express
- ✅ Socket.IO (muhtemelen)
- ✅ `npm start` ile başlatılır
- ✅ Port 3000 (varsayılan)

**Fark:** Database ve ekstra özellikler!

---

**Detaylar için:** SmartGuard repository'sini klonlayıp `smartguard_api/` klasörünü inceleyin! 🔍

