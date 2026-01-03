# 📱 ÇDTP (Çift Dokunmatik Telefon Projesi) - Detaylı Proje Açıklaması

## 🎯 Proje Amacı

Bu proje, yaşlı veya hasta kişilerin sağlık durumlarını gerçek zamanlı olarak izlemek için geliştirilmiş bir **mobil sağlık takip sistemidir**. Sistem, **iki telefon** ve **bir backend server** üzerinden çalışır.

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                        SİSTEM MİMARİSİ                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  BİLEKLİK    │         │  TELEFON 1   │         │   BACKEND    │
│  (ESP32)     │         │   (HASTA)    │         │   SERVER     │
│              │         │              │         │              │
│ • Kalp Atışı │ ──BLE──>│ • Bluetooth  │ ─WebSocket─>│ • Node.js    │
│ • İvmeölçer  │         │   Alıcı      │         │ • Socket.IO  │
│ • Batarya    │         │ • Veri       │         │ • Database   │
│              │         │   Gönderici  │         │   (JSON)     │
└──────────────┘         └──────────────┘         └──────────────┘
                                                          │
                                                    WebSocket
                                                          │
                                                          ↓
                                                   ┌──────────────┐
                                                   │  TELEFON 2   │
                                                   │  (MONITÖR)   │
                                                   │              │
                                                   │ • Veri İzle  │
                                                   │ • Alarm Al   │
                                                   │ • Eşik Ayar  │
                                                   └──────────────┘
```

---

## 👤 Kullanıcı Rolleri

### 🏥 Telefon 1 - HASTA (Patient)

**Kim kullanır:** Yaşlı/hasta kişi

**Görevleri:**
1. **Bluetooth ile bileklikten veri alır:**
   - Kalp atış hızı (BPM)
   - İvme verileri (X, Y, Z)
   - Hareket durumu (aktif/pasif/düşme)
   - Batarya seviyesi

2. **Backend'e veri gönderir:**
   - WebSocket ile gerçek zamanlı
   - Her 30 saniyede bir (değiştirilebilir)
   - Anlık alarm durumlarında hemen

3. **Monitör'den komut alır:**
   - Yeni eşik değerleri
   - Alarm onayları

4. **Bildirim gösterir:**
   - "Eşik değerleri güncellendi"
   - "Alarm onaylandı"
   - "Backend'e bağlandı"

### 👨‍⚕️ Telefon 2 - MONITÖR (Monitor)

**Kim kullanır:** Yakın, bakıcı, sağlık personeli

**Görevleri:**
1. **Backend'den veri alır:**
   - Hasta'nın gerçek zamanlı sağlık verileri
   - Alarmlar
   - Güncel durum

2. **Veri analizi yapar:**
   - Eşik kontrolü (nabız yüksek/düşük mü?)
   - Hareket kontrolü (düşme var mı?)
   - Hareketsizlik kontrolü (uzun süre durağan mı?)

3. **Hasta'ya komut gönderir:**
   - Eşik değerleri güncelleme
   - Alarm onaylama

4. **Bildirim gösterir:**
   - "🚨 ALARM! Düşük kalp atışı"
   - "🚨 Düşme tespit edildi!"
   - "⚠️ Uzun süre hareketsizlik"

---

## 🔄 Veri Akışı - Adım Adım

### 1️⃣ Sistem Başlatma

```
ADIM 1: Backend Server Başlatılır
└─> Bilgisayarda: cd backend && npm start
└─> Port 3000'de dinlemeye başlar
└─> Database klasörü oluşturulur
└─> WebSocket server hazır

ADIM 2: Hasta Telefonu Açılır
└─> Uygulama başlar
└─> Backend'e WebSocket ile bağlanır
└─> Cihaz tipi: "patient" olarak kaydolur
└─> Bluetooth taraması başlar

ADIM 3: Bileklik Bağlanır
└─> ESP32 BLE cihazı bulunur
└─> Bluetooth bağlantısı kurulur
└─> Veri akışı başlar

ADIM 4: Monitör Telefonu Açılır
└─> Uygulama başlar
└─> Backend'e WebSocket ile bağlanır
└─> Cihaz tipi: "monitor" olarak kaydolur
└─> Veri dinlemeye başlar
```

### 2️⃣ Normal Veri Akışı

```
[09:00:00] Bileklik → Bluetooth → Hasta Telefonu
│          Veri: { hr: 75, ax: 0.1, ay: 0.2, az: 9.8, bat: 85 }
│
[09:00:01] Hasta Telefonu → WebSocket → Backend
│          socket.emit('send_sensor_data', { sensorData })
│
[09:00:01] Backend: Veriyi İşle
│          ├─> Parse et (data-format.js)
│          ├─> Database'e kaydet (sensor-data.json)
│          └─> Monitöre ilet
│
[09:00:02] Backend → WebSocket → Monitör Telefonu
│          socket.emit('receive_sensor_data', { sensorData })
│
[09:00:02] Monitör Telefonu: Göster
│          ├─> UI'da göster (Kalp atışı: 75 BPM)
│          ├─> Eşik kontrolü yap (75 > 40 ve 75 < 120 ✅)
│          └─> Normal durum
```

### 3️⃣ Alarm Durumu

```
[09:10:00] Bileklik → Bluetooth → Hasta Telefonu
│          Veri: { hr: 35, ax: 0.1, ay: 0.2, az: 9.8, bat: 80 }
│          ⚠️ Kalp atışı düşük!
│
[09:10:01] Hasta Telefonu: Alarm Oluştur
│          ├─> Eşik kontrolü: 35 < 40 (minHeartRate)
│          ├─> Alarm objesi oluştur:
│          │   {
│          │     id: "alarm_1704279001234",
│          │     type: "low_heart_rate",
│          │     message: "Düşük kalp atışı!",
│          │     timestamp: 1704279001234,
│          │     acknowledged: false
│          │   }
│          └─> Backend'e gönder
│
[09:10:02] Hasta Telefonu → WebSocket → Backend
│          socket.emit('send_alarm', { alarm })
│
[09:10:02] Backend: Alarm İşle
│          ├─> Database'e kaydet (alarms.json)
│          └─> Tüm monitörlere ilet
│
[09:10:03] Backend → WebSocket → Monitör Telefonu
│          socket.emit('receive_alarm', { alarm })
│
[09:10:03] Monitör Telefonu: ALARM!
│          ├─> Bildirim göster: "🚨 Düşük kalp atışı!"
│          ├─> Ses çal (alarm.mp3)
│          ├─> Titreşim
│          └─> UI'da kırmızı uyarı
│
[09:10:30] Monitör: Alarm'ı Onayla
│          └─> "Onaylıyorum" butonuna bas
│
[09:10:31] Monitör Telefonu → WebSocket → Backend
│          socket.emit('acknowledge_alarm', { alarmId })
│
[09:10:31] Backend → WebSocket → Hasta Telefonu
│          socket.emit('alarm_acknowledged', { alarmId })
│
[09:10:32] Hasta Telefonu: Onay Alındı
│          └─> Bildirim: "✅ Alarm onaylandı"
```

### 4️⃣ Eşik Değerleri Güncelleme

```
[10:00:00] Monitör Telefonu: Eşikleri Değiştir
│          ├─> UI'da ayarlar
│          │   minHeartRate: 40 → 45
│          │   maxHeartRate: 120 → 115
│          └─> Kaydet butonuna bas
│
[10:00:01] Monitör Telefonu → WebSocket → Backend
│          socket.emit('send_thresholds', {
│            targetDeviceId: 'patient_device_001',
│            thresholds: { minHeartRate: 45, maxHeartRate: 115, ... }
│          })
│
[10:00:01] Backend: Eşikleri İşle
│          ├─> Doğrula (validateThresholds)
│          ├─> Database'e kaydet (thresholds.json)
│          └─> Hasta telefonuna ilet
│
[10:00:02] Backend → WebSocket → Hasta Telefonu
│          socket.emit('receive_thresholds', { thresholds })
│
[10:00:02] Hasta Telefonu: Eşikleri Güncelle
│          ├─> State'i güncelle
│          ├─> Local storage'a kaydet
│          └─> Bildirim: "📊 Eşik değerleri güncellendi"
```

---

## 💾 Database Yapısı

Backend'de JSON dosyaları olarak saklanır:

### 📁 backend/database/

#### 1. sensor-data.json
```json
{
  "patient_device_001": [
    {
      "heartRate": 75,
      "accelX": 0.1,
      "accelY": 0.2,
      "accelZ": 9.8,
      "movement": "active",
      "battery": 85,
      "timestamp": 1704279001234,
      "savedAt": 1704279001500
    },
    // ... son 500 veri
  ]
}
```

#### 2. alarms.json
```json
{
  "patient_device_001": [
    {
      "id": "alarm_1704279001234",
      "type": "low_heart_rate",
      "message": "Düşük kalp atışı!",
      "timestamp": 1704279001234,
      "acknowledged": true,
      "acknowledgedAt": 1704279030000,
      "savedAt": 1704279001500
    },
    // ... son 200 alarm
  ]
}
```

#### 3. thresholds.json
```json
{
  "patient_device_001": {
    "minHeartRate": 45,
    "maxHeartRate": 115,
    "inactivityMinutes": 5,
    "fallThreshold": 2.5,
    "updatedAt": 1704279001234
  }
}
```

#### 4. devices.json
```json
{
  "patient_device_001": {
    "deviceId": "patient_device_001",
    "deviceType": "patient",
    "deviceName": "Hasta Telefon",
    "lastSeen": 1704279001234
  },
  "monitor_device_001": {
    "deviceId": "monitor_device_001",
    "deviceType": "monitor",
    "deviceName": "Monitör Telefon",
    "lastSeen": 1704279001234
  }
}
```

---

## 🔧 Teknolojiler

### Frontend (React Native + Expo)

```javascript
├─ React Native 0.81.5        // Mobil framework
├─ Expo ~54.0.30              // Geliştirme platformu
├─ expo-dev-client            // Development build
├─ react-native-ble-manager   // Bluetooth bağlantısı
├─ expo-notifications         // Push bildirimleri
├─ socket.io-client           // WebSocket client
└─ @react-native-async-storage // Local storage
```

### Backend (Node.js + Express)

```javascript
├─ Node.js                    // Runtime
├─ Express 4.18.2             // Web framework
├─ Socket.IO 4.6.1            // WebSocket server
├─ CORS 2.8.5                 // Cross-origin ayarları
├─ dotenv 16.0.3              // Environment değişkenleri
└─ fs (built-in)              // Dosya işlemleri (Database)
```

---

## 📡 İletişim Protokolleri

### 1. Bluetooth Low Energy (BLE)

**Kullanım:** Bileklik ↔ Hasta Telefonu

**Özellikler:**
- Düşük enerji tüketimi
- 10 metre menzil
- UUID tabanlı servisler
- Characteristic'ler ile veri okuma

**Örnek Kod:**
```javascript
// Bileklikten veri okuma
BleManager.startNotification(
  deviceId,
  serviceUUID,
  characteristicUUID
).then(() => {
  BleManager.onCharacteristicChange((data) => {
    // Veri geldi!
  });
});
```

### 2. WebSocket (Socket.IO)

**Kullanım:** Telefonlar ↔ Backend

**Özellikler:**
- Gerçek zamanlı, iki yönlü
- Otomatik yeniden bağlanma
- Event-based (emit/on)
- Düşük latency (< 10ms)

**Örnek Kod:**
```javascript
// Veri gönderme
socket.emit('send_sensor_data', { sensorData });

// Veri alma
socket.on('receive_sensor_data', (data) => {
  // Veri geldi!
});
```

### 3. Push Notifications

**Kullanım:** Uygulama → Kullanıcı

**Özellikler:**
- Ses/titreşim/badge
- Android & iOS uyumlu
- Arka planda bile çalışır

**Örnek Kod:**
```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "🚨 ALARM",
    body: "Düşük kalp atışı!",
    sound: true,
  },
  trigger: null, // Hemen göster
});
```

---

## ⚙️ Yapılandırma

### 1. Backend Başlatma

```bash
cd backend
npm install
npm start
```

**Çıktı:**
```
============================================================
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://192.168.1.100:3000
============================================================
```

### 2. IP Adresini Bulma

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Not edin: `192.168.1.100` (örnek)

### 3. Frontend'te IP Güncelleme

`services/backend-service.js` dosyasını oluştur:

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'n
```

### 4. Cihaz Tipi Ayarlama

```javascript
// Hasta telefonu
await connectBackend('patient');

// Monitör telefonu
await connectBackend('monitor');
```

---

## 🚨 Alarm Tipleri

### 1. fall - Düşme Tespiti
```javascript
{
  type: 'fall',
  message: '🚨 Düşme tespit edildi!',
  condition: ivme > 2.5g
}
```

### 2. inactivity - Hareketsizlik
```javascript
{
  type: 'inactivity',
  message: '⏰ 5 dakikadır hareketsiz',
  condition: hareket yok > 5 dakika
}
```

### 3. low_heart_rate - Düşük Nabız
```javascript
{
  type: 'low_heart_rate',
  message: '💔 Düşük kalp atışı (35 BPM)',
  condition: nabız < 40
}
```

### 4. high_heart_rate - Yüksek Nabız
```javascript
{
  type: 'high_heart_rate',
  message: '💓 Yüksük kalp atışı (135 BPM)',
  condition: nabız > 120
}
```

### 5. manual - Manuel Acil Durum
```javascript
{
  type: 'manual',
  message: '🆘 Manuel acil durum butonu',
  condition: kullanıcı butona bastı
}
```

---

## 🔐 Güvenlik

### 1. Network Güvenliği
- WebSocket üzerinden şifrelenmemiş (local network)
- Production'da HTTPS/WSS kullanılmalı

### 2. Veri Güvenliği
- Database dosyaları sadece server'da
- Şifreleme yok (local network için yeterli)
- Production'da encryption eklenebilir

### 3. Erişim Kontrolü
- Cihaz ID ile tanımlama
- Monitör sadece kendi hastasının verisini görür
- Eşleştirme sistemi (pair_devices)

---

## 📊 Performans

### Latency
- Bluetooth → Telefon: ~50ms
- Telefon → Backend: ~5ms
- Backend → Telefon: ~5ms
- **Toplam:** ~60ms (gerçek zamanlı)

### Veri Boyutu
- Sensör verisi: ~200 bytes
- Alarm: ~150 bytes
- Eşik değerleri: ~100 bytes

### Database
- Cihaz başına max 500 sensör verisi
- Cihaz başına max 200 alarm
- Otomatik temizlik: 30 gün

---

## 🎯 Kullanım Senaryoları

### Senaryo 1: Normal İzleme
```
1. Hasta evde oturuyor
2. Bileklik kalp atışını ölçüyor (75 BPM)
3. Monitör telefonunda görüyor
4. "Normal" yazıyor, yeşil
```

### Senaryo 2: Düşük Nabız
```
1. Hasta uyuyor, nabız düşüyor (35 BPM)
2. Eşik altı alarm oluşur
3. Monitör'de bildirim: "🚨 Düşük kalp atışı!"
4. Bakıcı kontrol eder, hasta uyuyor (normal)
5. Alarm'ı onaylar
```

### Senaryo 3: Düşme
```
1. Hasta banyoya gidiyor
2. Kayıyor, düşüyor (ivme spike: 3.2g)
3. Otomatik alarm: "🚨 Düşme tespit edildi!"
4. Monitör'de kırmızı uyarı
5. Bakıcı hemen yardıma koşuyor
```

### Senaryo 4: Eşik Ayarlama
```
1. Doktor nabız eşiğini değiştiriyor
2. Min: 40 → 45, Max: 120 → 110
3. Monitör telefonunda ayarlıyor
4. Hasta telefonuna otomatik iletiyor
5. Yeni eşikler aktif
```

---

## 🔄 Veri Formatı Özelleştirme

Bileklikten farklı format gelirse:

**data-format.js** dosyasını düzenle:

```javascript
function parseWearableData(rawData) {
  // ÖRN: "HR:75,AX:0.1,AY:0.2,AZ:9.8,BAT:85"
  if (typeof rawData === 'string' && rawData.includes('HR:')) {
    const parts = rawData.split(',');
    return {
      heartRate: parseFloat(parts[0].split(':')[1]),
      accelX: parseFloat(parts[1].split(':')[1]),
      accelY: parseFloat(parts[2].split(':')[1]),
      accelZ: parseFloat(parts[3].split(':')[1]),
      battery: parseFloat(parts[4].split(':')[1]),
      timestamp: Date.now(),
      movement: calculateMovement(ax, ay, az)
    };
  }
  
  // Varsayılan
  return rawData;
}
```

---

## 🎉 Özet

Bu sistem, yaşlı/hasta kişilerin sağlık durumlarını gerçek zamanlı izlemek için:

1. **Bileklik** → Bluetooth → **Hasta Telefonu**
2. **Hasta Telefonu** → WebSocket → **Backend Server**
3. **Backend Server** → Database (JSON) + WebSocket → **Monitör Telefonu**
4. **Monitör Telefonu** → Analiz + Bildirim + Kontrol

**Hedef:** Acil durumlarda hızlı müdahale, sürekli izleme, güvenli yaşam!
