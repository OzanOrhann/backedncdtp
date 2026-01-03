# 📦 BACKEND ARKADAŞINIZA GÖNDERİLECEK

## 🎯 Bu Klasörü Arkadaşınıza Gönderin

`backend` klasörünün tamamını gönderin. İçinde:

✅ **server.js** - Ana backend server
✅ **data-format.js** - Veri formatı (bileklik verisi için özelleştirilebilir)
✅ **frontend-integration.js** - Frontend'e entegrasyon kodu
✅ **test-client.js** - Test scriptleri
✅ **package.json** - Gerekli kütüphaneler
✅ **README.md** - Detaylı dokümantasyon
✅ **QUICKSTART.md** - Hızlı başlangıç
✅ **DEPLOYMENT.md** - Cloud'a yükleme rehberi
✅ **TEST_SONUÇLARI.md** - Test sonuçları

---

## 🚀 Arkadaşınız Ne Yapacak?

### 1. Kurulum:
```bash
cd backend
npm install
```

### 2. Server'ı Başlat:
```bash
npm start
```

### 3. IP Adresini Bul:
```bash
ipconfig
# IPv4 adresini not edin (örn: 192.168.1.100)
```

### 4. Frontend'i Güncelle:
`frontend-integration.js` dosyasındaki IP'yi değiştir:
```javascript
const BACKEND_URL = 'http://192.168.1.100:3000';
```

### 5. Test Et:
```bash
npm test
# İki telefon simülasyonu çalışır
```

---

## ✅ Backend Özellikleri

### İki Telefon Bağlantısı:
- **MONITOR** - Takip eden kişinin telefonu
- **PATIENT** - Takip edilen kişinin telefonu

### Veri Akışı:
```
MONITOR → PATIENT: Eşik değerleri
PATIENT → MONITOR: Sensör verileri (kalp atışı, ivme, batarya)
PATIENT → MONITOR: Alarmlar (düşme, acil durum)
MONITOR → PATIENT: Alarm onayları
```

### Gerçek Zamanlı:
- WebSocket ile anlık iletişim
- Latency < 10ms (local network)
- Otomatik yeniden bağlanma

---

## 🔧 Bileklik Veri Formatı

**Bileklikten gelecek format belli olduğunda:**

`data-format.js` dosyasını açın ve `parseWearableData()` fonksiyonunu düzenleyin.

Desteklenen formatlar:
- JSON: `{ hr: 75, ax: 0.1, ... }`
- CSV: `"75,0.1,0.2,9.8,85"`
- Hex: `"4B0A14620055"`

---

## 📱 Mobil Uygulama Entegrasyonu

Frontend'e eklenecek kod `frontend-integration.js` dosyasında.

Örnek kullanım:
```javascript
import { connectToBackend, sendSensorData } from './backend-integration';

// Bağlan
await connectToBackend('patient');

// Sensör verisi gönder
sendSensorData({
  heartRate: 75,
  accelX: 0.1,
  accelY: 0.2,
  accelZ: 9.8,
  battery: 85
});
```

---

## 🧪 Test Edildi ve Çalışıyor!

✅ İki telefon bağlantısı - **BAŞARILI**
✅ Eşik değerleri iletimi - **BAŞARILI**
✅ Sensör verisi iletimi - **BAŞARILI**  
✅ Alarm sistemi - **BAŞARILI**
✅ Alarm onaylama - **BAŞARILI**

Detaylar: `TEST_SONUÇLARI.md`

---

## 🌐 Cloud'a Yükleme (Opsiyonel)

Backend'i ücretsiz cloud platformlara yükleyebilirsiniz:
- Heroku
- Render.com
- Railway

Detaylar: `DEPLOYMENT.md`

---

## 📞 Sorun mu var?

1. `QUICKSTART.md` - Hızlı başlangıç
2. `README.md` - Detaylı dokümantasyon
3. `TEST_SONUÇLARI.md` - Test sonuçları
