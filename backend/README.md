# 🏥 ÇDTP Backend Server

**Çift Dokunmatik Telefon Projesi** - Gerçek zamanlı sağlık izleme sistemi için backend server.

---

## ⚡ Hızlı Başlangıç

```bash
# 1. Kurulum
cd backend
npm install

# 2. Başlatma
npm start

# 3. IP adresini bul
ipconfig  # Windows
ifconfig  # Mac/Linux
```

**Backend çalışır:** `http://localhost:3000`

**ÖNEMLİ:** `frontend-integration.js` dosyasında (satır 18) IP adresini ayarlayın!

---

## 📚 Dokümantasyon

### 🚀 Başlangıç
- **[BACKEND_BAŞLATMA_REHBERİ.md](BACKEND_BAŞLATMA_REHBERİ.md)** - Detaylı kurulum ve başlatma rehberi
- **[FRONTEND_ENTEGRASYON_REHBERİ.md](FRONTEND_ENTEGRASYON_REHBERİ.md)** - Frontend'e nasıl entegre edilir

### 📖 Sistem Bilgisi
- **[PROJE_AÇIKLAMASI.md](PROJE_AÇIKLAMASI.md)** - Tüm sistem detaylı açıklama
- **[SİSTEM_NASIL_ÇALIŞIYOR.md](SİSTEM_NASIL_ÇALIŞIYOR.md)** - Veri akış diyagramları
- **[VERİ_AKIŞI_ÖZET.md](VERİ_AKIŞI_ÖZET.md)** - Veri akışı özeti
- **[BACKEND_ÖZET.md](BACKEND_ÖZET.md)** - Backend özeti

### 🔧 Geliştirme
- **[MONITOR_ALARM_TESPİT_REHBERİ.md](MONITOR_ALARM_TESPİT_REHBERİ.md)** - MONITOR alarm tespiti
- **[UYUMLULUK_KONTROLÜ.md](UYUMLULUK_KONTROLÜ.md)** - Frontend-Backend uyumluluk
- **[SİSTEM_DURUM_RAPORU.md](SİSTEM_DURUM_RAPORU.md)** - Sistem durumu
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Cloud'a yükleme rehberi

---

## 🎯 Ne Yapar?

Bu backend, **iki telefon** arasında gerçek zamanlı iletişim sağlar:

### 📱 Telefon 1 (PATIENT - Hasta)
- Bluetooth'tan bileklikten veri alır
- Backend'e WebSocket ile gönderir
- MONITOR'dan eşik değerlerini alır
- Alarmları MONITOR'a gönderir

### 📱 Telefon 2 (MONITOR - Bakıcı)
- PATIENT'ın verilerini alır
- Eşik değerlerini PATIENT'a gönderir
- Alarmları alır ve gösterir
- Otomatik alarm tespiti yapar

---

## 💾 Database

**JSON dosyaları** kullanılıyor (basit ve sorunsuz):
- `backend/database/sensor-data.json` - Sensör verileri
- `backend/database/alarms.json` - Alarmlar
- `backend/database/thresholds.json` - Eşik değerleri
- `backend/database/devices.json` - Cihaz bilgileri

---

## 🔧 Yapılandırma

### 1. Backend URL (Frontend için)

`frontend-integration.js` dosyasında (satır 18):
```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

### 2. Port Ayarlama

`.env` dosyası oluşturun (backend klasöründe):
```env
PORT=3000
NODE_ENV=development
```

Veya `server.js` dosyasında:
```javascript
const PORT = process.env.PORT || 3000;
```

### 3. Veri Formatı

`data-format.js` dosyasını düzenleyerek bileklik veri formatını değiştirebilirsiniz.

---

## 📡 API Endpoints

### REST API
- `GET /` - Server bilgisi
- `GET /health` - Sağlık kontrolü
- `GET /api/devices` - Bağlı cihazlar
- `GET /api/sensor-data/:deviceId` - Sensör geçmişi
- `GET /api/alarms/:deviceId` - Alarm geçmişi
- `GET /api/thresholds/:deviceId` - Eşik değerleri
- `GET /api/pairs` - Eşleştirilmiş cihazlar

### WebSocket Events
- `register` - Cihaz kaydı
- `pair_devices` - Cihaz eşleştirme
- `send_sensor_data` - Sensör verisi gönder
- `receive_sensor_data` - Sensör verisi al
- `send_alarm` - Alarm gönder
- `receive_alarm` - Alarm al
- `send_thresholds` - Eşik değerleri gönder
- `receive_thresholds` - Eşik değerleri al
- `acknowledge_alarm` - Alarm onayla

---

## ✅ Özellikler

- ✅ İki telefon arası gerçek zamanlı iletişim
- ✅ WebSocket ile anlık veri akışı
- ✅ JSON database (basit ve sorunsuz)
- ✅ Otomatik alarm tespiti (MONITOR'da)
- ✅ Frontend ile %100 uyumlu
- ✅ Veri formatı özelleştirilebilir

---

## 📝 Özet

1. **Kurulum:** `npm install`
2. **Başlatma:** `npm start`
3. **IP Bul:** `ipconfig` / `ifconfig`
4. **Frontend'e IP'yi Ver:** `frontend-integration.js` içinde
5. **Test Et:** Tarayıcıda `http://localhost:3000`

---

## ✅ HAZIR!

Backend çalışıyor ve iki telefonu bağlamaya hazır! 🎉

**Detaylı bilgi için:** [BACKEND_BAŞLATMA_REHBERİ.md](BACKEND_BAŞLATMA_REHBERİ.md)

---

**Backend Versiyonu:** 2.0.0  
**Son Güncelleme:** 2024-01-15
