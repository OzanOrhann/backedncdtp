# 🏥 ÇDTP Backend Server

**Çift Dokunmatik Telefon Projesi** - Gerçek zamanlı sağlık izleme sistemi için backend server.

---

## 📚 Dokümantasyon

### 🚀 Başlangıç
- **[BAŞLATMA.md](BAŞLATMA.md)** - Hızlı başlatma rehberi (EN ÖNEMLİ)
- **[İKİ_TELEFON_BAĞLANTI_REHBERİ.md](İKİ_TELEFON_BAĞLANTI_REHBERİ.md)** - Telefonları nasıl bağlanır

### 📖 Detaylı Bilgi
- **[PROJE_AÇIKLAMASI.md](PROJE_AÇIKLAMASI.md)** - Tüm sistem detaylı açıklama
- **[SİSTEM_NASIL_ÇALIŞIYOR.md](SİSTEM_NASIL_ÇALIŞIYOR.md)** - Veri akış diyagramları
- **[UYUMLULUK_KONTROLÜ.md](UYUMLULUK_KONTROLÜ.md)** - Frontend-Backend uyumluluk

### 🔧 Geliştirme
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Cloud'a yükleme rehberi
- **[data-format.js](data-format.js)** - Veri formatı özelleştirme

---

## ⚡ Hızlı Başlangıç

```bash
# 1. Kurulum
npm install

# 2. Başlatma
npm start

# 3. IP adresini bul
ipconfig  # Windows
ifconfig  # Mac/Linux
```

**Backend çalışır:** `http://localhost:3000`

---

## 🎯 Ne Yapar?

Bu backend, **iki telefon** arasında gerçek zamanlı iletişim sağlar:

### 📱 Telefon 1 (HASTA)
- Bluetooth'tan bileklikten veri alır
- Backend'e WebSocket ile gönderir

### 📱 Telefon 2 (MONITÖR)
- Backend'den hasta verilerini alır
- Alarm gösterir
- Eşik değerleri gönderir

### 🖥️ Backend Server
- İki telefonu bağlar (WebSocket)
- Verileri saklar (JSON Database)
- Gerçek zamanlı iletişim sağlar

---

## 🔌 Teknolojiler

- **Node.js + Express** - Web server
- **Socket.IO** - WebSocket (gerçek zamanlı)
- **JSON Files** - Database (basit, kolay)
- **CORS** - Cross-origin ayarları

---

## 📁 Dosya Yapısı

```
backend/
├── server.js                  # Ana server
├── database.js                # Database yönetimi
├── data-format.js             # Veri formatı parser
├── frontend-integration.js    # Frontend entegrasyon kodu
├── package.json              
├── .env                       # Yapılandırma
├── database/                  # Veriler (otomatik oluşur)
│   ├── sensor-data.json
│   ├── alarms.json
│   ├── thresholds.json
│   └── devices.json
└── docs/                      # Dokümantasyon
    ├── PROJE_AÇIKLAMASI.md
    ├── İKİ_TELEFON_BAĞLANTI_REHBERİ.md
    └── ...
```

---

## 🔄 Veri Akışı

```
Bileklik → Bluetooth → Telefon 1 → WebSocket → Backend
                                                   ↓
                                              Database
                                                   ↓
                                              WebSocket → Telefon 2
```

---

## 🚨 Alarm Sistemi

Backend otomatik olarak şu alarmları yönetir:

- 🚨 **Düşme Tespiti** (ivme > 2.5g)
- 💔 **Düşük Nabız** (< 40 BPM)
- 💓 **Yüksek Nabız** (> 120 BPM)
- ⏰ **Hareketsizlik** (> 5 dakika)
- 🆘 **Manuel Alarm** (kullanıcı tetiklerse)

---

## 💾 Database

- **Tip:** JSON dosyaları
- **Konum:** `backend/database/`
- **Otomatik:** Kendisi oluşturur
- **Temizlik:** 30 günde bir eski veriler silinir
- **Limit:** Cihaz başına 500 sensör verisi, 200 alarm

---

## 🔧 Yapılandırma

**.env dosyası:**
```env
PORT=3000
NODE_ENV=development
```

**Veri formatı değiştirme:**
```javascript
// data-format.js dosyasını düzenle
function parseWearableData(rawData) {
  // Kendi formatını yaz
}
```

---

## 📡 API Endpoints

### REST API
- `GET /` - Server bilgisi
- `GET /health` - Sağlık kontrolü
- `GET /api/devices` - Bağlı cihazlar
- `GET /api/sensor-data/:deviceId` - Sensör geçmişi
- `GET /api/alarms/:deviceId` - Alarm geçmişi

### WebSocket Events
- `register` - Cihaz kaydı
- `send_sensor_data` - Sensör verisi gönder
- `receive_sensor_data` - Sensör verisi al
- `send_alarm` - Alarm gönder
- `receive_alarm` - Alarm al
- `send_thresholds` - Eşik gönder
- `receive_thresholds` - Eşik al
- `acknowledge_alarm` - Alarm onayla

---

## 🧪 Test

Backend çalışıyor mu kontrol et:

```bash
# Terminal
curl http://localhost:3000/health

# veya tarayıcıda
http://localhost:3000
```

---

## 📞 Sorun Giderme

### Port zaten kullanımda:
```bash
PORT=3001 npm start
```

### Backend'e bağlanamıyor:
1. Backend çalışıyor mu?
2. IP adresi doğru mu?
3. Aynı WiFi'de misiniz?
4. Firewall kapalı mı?

---

## 🎉 Özet

1. **Backend'i başlat:** `npm start`
2. **IP'ni bul:** `ipconfig`
3. **Frontend'te IP'yi güncelle**
4. **İki telefonu bağla** (biri patient, diğeri monitor)
5. **Sistem çalışır!** 🎉

---

## 📚 Daha Fazla Bilgi

- Detaylı açıklama → `PROJE_AÇIKLAMASI.md`
- Telefon bağlantısı → `İKİ_TELEFON_BAĞLANTI_REHBERİ.md`
- Veri akışı → `SİSTEM_NASIL_ÇALIŞIYOR.md`
- Cloud deployment → `DEPLOYMENT.md`

---

## 📄 Lisans

ISC

---

**Proje Durumu:** ✅ Kullanıma Hazır
