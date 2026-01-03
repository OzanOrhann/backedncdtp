# 🎯 BACKEND ÖZET - İKİ TELEFON BAĞLANTISI

## ✅ BACKEND HAZIR VE ÇALIŞIYOR

Backend, frontend ile **%100 uyumlu** ve iki telefon arası bağlantı için hazır.

---

## 🔄 VERİ AKIŞI

### 1️⃣ TELEFON 1 (PATIENT) → BACKEND → DATABASE

```
Bileklik (Bluetooth) 
  → Telefon 1 
  → WebSocket (send_sensor_data) 
  → Backend 
  → Database (JSON) 
  → Kaydedildi ✅
```

**Kod:**
```javascript
// Telefon 1'de (frontend-integration.js kullanarak)
socket.emit('send_sensor_data', {
  sensorData: {
    heartRate: 75,
    accelX: 0.1,
    accelY: 0.2,
    accelZ: 9.8,
    movement: 'active',
    timestamp: Date.now(),
    battery: 85
  }
});
```

**Backend yapıyor:**
1. ✅ Veriyi alır
2. ✅ Database'e kaydeder (`backend/database/sensor-data.json`)
3. ✅ Telefon 2'ye (Monitor) gönderir

---

### 2️⃣ BACKEND → DATABASE → TELEFON 2 (MONITOR)

```
Backend (Database'den okur)
  → WebSocket (receive_sensor_data)
  → Telefon 2
  → UI'da gösterilir ✅
```

**Kod:**
```javascript
// Telefon 2'de (otomatik alınır)
socket.on('receive_sensor_data', (data) => {
  console.log('Sensör verisi:', data.sensorData);
  // UI'da göster
  setSensorData(data.sensorData);
});
```

---

### 3️⃣ TELEFON 2 (MONITOR) → BACKEND → TELEFON 1 (PATIENT)

**Eşik Değerleri Gönderme:**

```
Telefon 2 (Eşik değerleri ayarlar)
  → WebSocket (send_thresholds)
  → Backend
  → Database (JSON) → Kaydedildi ✅
  → WebSocket (receive_thresholds)
  → Telefon 1
  → Eşik değerleri güncellendi ✅
```

**Kod:**
```javascript
// Telefon 2'de
socket.emit('send_thresholds', {
  targetDeviceId: 'device_patient_123',
  thresholds: {
    minHeartRate: 40,
    maxHeartRate: 120,
    inactivityMinutes: 5,
    fallThreshold: 2.5
  }
});

// Telefon 1'de (otomatik alınır)
socket.on('receive_thresholds', (data) => {
  console.log('Eşik değerleri:', data.thresholds);
  setThresholds(data.thresholds);
});
```

---

### 4️⃣ TELEFON 1 (PATIENT) → BACKEND → TELEFON 2 (MONITOR)

**Alarm Gönderme:**

```
Telefon 1 (Alarm tespit edildi)
  → WebSocket (send_alarm)
  → Backend
  → Database (JSON) → Kaydedildi ✅
  → WebSocket (receive_alarm)
  → Telefon 2
  → Bildirim gösterilir ✅
```

**Kod:**
```javascript
// Telefon 1'de
socket.emit('send_alarm', {
  alarm: {
    id: 'alarm_123',
    type: 'fall',
    message: 'Düşme tespit edildi!',
    timestamp: Date.now(),
    acknowledged: false
  }
});

// Telefon 2'de (otomatik alınır)
socket.on('receive_alarm', (data) => {
  console.log('ALARM:', data.alarm);
  // Bildirim göster
  sendNotification('🚨 ACİL DURUM', data.alarm.message);
});
```

---

## 💾 VERİTABANI (JSON)

### Konum
```
backend/database/
├── sensor-data.json    # Sensör verileri
├── alarms.json         # Alarmlar
├── thresholds.json     # Eşik değerleri
└── devices.json        # Cihaz bilgileri
```

### Özellikler
- ✅ **JSON:** En basit ve sorunsuz çözüm
- ✅ **Dosya tabanlı:** Kurulum gerektirmez
- ✅ **Hızlı:** Küçük veriler için yeterli
- ✅ **Kolay:** Dosyaları açıp okuyabilirsiniz
- ✅ **Otomatik:** Backend kendisi oluşturur
- ✅ **Temizlik:** 30 günden eski veriler otomatik silinir

### Veri Formatı Değiştirme

`backend/data-format.js` dosyasını düzenleyin:

```javascript
function parseWearableData(rawData) {
  // Bileklikten gelen veri formatını buraya yazın
  // Örnek: JSON, CSV, Hex, vs.
  return {
    heartRate: rawData.hr || null,
    accelX: rawData.ax || null,
    // ...
  };
}
```

---

## 🔌 WEBSOCKET BAĞLANTISI

### İki Telefon Nasıl Bağlanır?

**1. Backend'i Başlatın:**
```bash
cd backend
npm start
```

**2. IP Adresini Bulun:**
```bash
ipconfig  # Windows → IPv4 Address
ifconfig  # Mac/Linux
```

**3. Her İki Telefonda:**
```javascript
// frontend-integration.js dosyasında
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

**4. Telefon 1 (PATIENT) Bağlan:**
```javascript
connectToBackend('patient', { deviceName: 'Hasta Telefon' });
```

**5. Telefon 2 (MONITOR) Bağlan:**
```javascript
connectToBackend('monitor', { deviceName: 'Monitör Telefon' });
```

**6. Eşleştirin (Opsiyonel):**
```javascript
// Monitör telefonundan
pairDevices(patientDeviceId, monitorDeviceId);
```

---

## ✅ FRONTEND UYUMLULUĞU

### SensorData Interface

**Frontend (App.tsx):**
```typescript
interface SensorData {
  heartRate: number | null;
  accelX: number | null;
  accelY: number | null;
  accelZ: number | null;
  movement: 'active' | 'idle' | 'fall' | 'unknown';
  timestamp: number;
  battery: number | null;
}
```

**Backend (server.js):**
```javascript
// Aynı format kabul ediliyor ✅
socket.on('send_sensor_data', (data) => {
  const { sensorData } = data;
  // sensorData.heartRate, sensorData.accelX, vs. ✅
});
```

**✅ UYUMLU**

---

### Alarm Interface

**Frontend (App.tsx):**
```typescript
interface Alarm {
  id: string;
  type: 'fall' | 'inactivity' | 'low_heart_rate' | 'high_heart_rate' | 'manual';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}
```

**Backend (server.js):**
```javascript
// Aynı format kabul ediliyor ✅
socket.on('send_alarm', (data) => {
  const { alarm } = data;
  // alarm.id, alarm.type, alarm.message, vs. ✅
});
```

**✅ UYUMLU**

---

### Thresholds Interface

**Frontend (App.tsx):**
```typescript
interface Thresholds {
  minHeartRate: number;
  maxHeartRate: number;
  inactivityMinutes: number;
  fallThreshold: number;
}
```

**Backend (server.js):**
```javascript
// Aynı format kabul ediliyor ✅
socket.on('send_thresholds', (data) => {
  const { thresholds } = data;
  // thresholds.minHeartRate, thresholds.maxHeartRate, vs. ✅
});
```

**✅ UYUMLU**

---

## 🎯 ÖZET: İKİ TELEFON ARASI BAĞLANTI

### Telefon 1 (PATIENT) Yapıyor:
1. ✅ Bluetooth ile bileklikten veri alır (frontend hazır)
2. ✅ Backend'e WebSocket ile gönderir (`send_sensor_data`)
3. ✅ Backend Database'e kaydeder (JSON)
4. ✅ Alarmları backend'e gönderir (`send_alarm`)
5. ✅ Monitör'den eşik değerlerini alır (`receive_thresholds`)

### Telefon 2 (MONITOR) Yapıyor:
1. ✅ Backend'den sensör verilerini alır (`receive_sensor_data`)
2. ✅ Backend Database'den verileri okur (REST API)
3. ✅ Eşik değerlerini hasta'ya gönderir (`send_thresholds`)
4. ✅ Alarmları alır (`receive_alarm`)
5. ✅ Bildirim gösterir

### Backend Yapıyor:
1. ✅ İki telefonu WebSocket ile bağlar
2. ✅ Verileri JSON Database'e kaydeder
3. ✅ Verileri telefonlar arasında iletir
4. ✅ Eşik değerlerini yönetir
5. ✅ Alarmları yönetir

---

## ✅ SONUÇ

**Backend:**
- ✅ Frontend ile uyumlu
- ✅ İki telefon arası bağlantı hazır
- ✅ WebSocket çalışıyor
- ✅ JSON Database çalışıyor
- ✅ Veri formatı değiştirilebilir
- ✅ Tüm event'ler hazır

**Hazır!** 🎉

