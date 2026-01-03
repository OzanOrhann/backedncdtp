# 🚀 SERVER NASIL ÇALIŞIR?

## ✅ SERVER ŞU AN ÇALIŞIYOR!

**Port:** `3000`  
**Durum:** `LISTENING` (Dinlemede)  
**URL:** `http://localhost:3000`

---

## 📋 SERVER YAPISI

### 1. **Express + Socket.IO Server**
```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" },
  pingTimeout: 60000,
  pingInterval: 25000
});
```

**Ne yapar?**
- ✅ HTTP API sunar (REST endpoints)
- ✅ WebSocket bağlantıları kabul eder
- ✅ Real-time iletişim sağlar

---

## 🔌 API ENDPOINTS (REST)

### 1. **Ana Sayfa**
```
GET http://localhost:3000/
```
**Yanıt:**
```json
{
  "message": "🏥 ÇDTP Backend Server",
  "version": "2.0.0",
  "status": "online",
  "connectedDevices": 0,
  "activePairs": 0
}
```

### 2. **Health Check**
```
GET http://localhost:3000/health
```
**Yanıt:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45,
  "memory": {...},
  "connectedDevices": 0
}
```

### 3. **Bağlı Cihazlar**
```
GET http://localhost:3000/api/devices
```
**Yanıt:**
```json
{
  "success": true,
  "count": 2,
  "devices": [
    {
      "deviceId": "patient-123",
      "deviceType": "patient",
      "deviceInfo": {...},
      "lastSeen": "2024-01-01T12:00:00.000Z",
      "connected": true
    }
  ]
}
```

### 4. **Sensör Verileri**
```
GET http://localhost:3000/api/sensor-data/:deviceId?limit=100
```
**Yanıt:**
```json
{
  "success": true,
  "deviceId": "patient-123",
  "count": 50,
  "data": [
    {
      "sensorData": {
        "heartRate": 75,
        "accelX": 0.1,
        "accelY": 0.2,
        "accelZ": 0.3,
        "movement": 0.5,
        "battery": 85,
        "timestamp": 1234567890
      },
      "timestamp": 1234567890
    }
  ]
}
```

### 5. **Alarmlar**
```
GET http://localhost:3000/api/alarms/:deviceId?limit=50
```

### 6. **Eşik Değerleri**
```
GET http://localhost:3000/api/thresholds/:deviceId
```

### 7. **Cihaz Eşleştirmeleri**
```
GET http://localhost:3000/api/pairs
```

---

## 🔄 WEBSOCKET EVENT'LERİ

### **Cihaz Bağlantısı**

#### 1. **register** (Cihaz Kaydı)
**Frontend gönderir:**
```javascript
socket.emit('register', {
  deviceId: 'patient-123',
  deviceType: 'patient',
  deviceInfo: { deviceName: 'Hasta Telefon' }
});
```

**Backend yanıt verir:**
```javascript
socket.emit('registered', {
  success: true,
  deviceId: 'patient-123',
  deviceType: 'patient',
  thresholds: { minHeartRate: 40, maxHeartRate: 120, ... }
});
```

#### 2. **pair_devices** (Cihaz Eşleştirme)
**Frontend gönderir:**
```javascript
socket.emit('pair_devices', {
  patientId: 'patient-123',
  monitorId: 'monitor-456'
});
```

**Backend yanıt verir:**
```javascript
// Her iki cihaza da gönderir
socket.emit('paired', {
  success: true,
  pairedWith: 'monitor-456',
  role: 'patient'
});
```

---

### **Veri İletişimi**

#### 3. **send_sensor_data** (Sensör Verisi Gönderme)
**PATIENT gönderir:**
```javascript
socket.emit('send_sensor_data', {
  sensorData: {
    heartRate: 75,
    accelX: 0.1,
    accelY: 0.2,
    accelZ: 0.3,
    movement: 0.5,
    battery: 85,
    timestamp: Date.now()
  }
});
```

**Backend işler:**
1. ✅ Veriyi database'e kaydeder
2. ✅ Eşleştirilmiş MONITOR'a gönderir
3. ✅ MONITOR'a `receive_sensor_data` event'i gönderir

**MONITOR alır:**
```javascript
socket.on('receive_sensor_data', (data) => {
  // data.sensorData
  // data.fromDeviceId
  // data.timestamp
});
```

#### 4. **send_alarm** (Alarm Gönderme)
**PATIENT gönderir:**
```javascript
socket.emit('send_alarm', {
  alarm: {
    id: 'alarm-123',
    type: 'high_heart_rate',
    message: 'Kalp atışı yüksek!',
    timestamp: Date.now()
  }
});
```

**Backend işler:**
1. ✅ Alarmı database'e kaydeder
2. ✅ Eşleştirilmiş MONITOR'a gönderir
3. ✅ MONITOR'a `receive_alarm` event'i gönderir

**MONITOR alır:**
```javascript
socket.on('receive_alarm', (data) => {
  // data.alarm
  // data.fromDeviceId
  // data.timestamp
});
```

#### 5. **send_thresholds** (Eşik Değerleri Gönderme)
**MONITOR gönderir:**
```javascript
socket.emit('send_thresholds', {
  targetDeviceId: 'patient-123',
  thresholds: {
    minHeartRate: 50,
    maxHeartRate: 100,
    inactivityMinutes: 10,
    fallThreshold: 3.0
  }
});
```

**Backend işler:**
1. ✅ Eşik değerlerini database'e kaydeder
2. ✅ PATIENT'a gönderir
3. ✅ PATIENT'a `receive_thresholds` event'i gönderir

**PATIENT alır:**
```javascript
socket.on('receive_thresholds', (data) => {
  // data.thresholds
  // data.fromDeviceId
  // data.timestamp
});
```

---

## 💾 VERİ YÖNETİMİ

### **In-Memory (RAM)**
- `connectedDevices` - Bağlı cihazlar
- `devicePairs` - Cihaz eşleştirmeleri
- `thresholds` - Eşik değerleri (cache)

### **Database (JSON Files)**
- `sensorData` - Sensör verileri
- `alarms` - Alarmlar
- `thresholds` - Eşik değerleri (kalıcı)
- `devices` - Cihaz bilgileri

**Dosya Konumları:**
```
backend/
├── data/
│   ├── sensor-data.json
│   ├── alarms.json
│   ├── thresholds.json
│   └── devices.json
```

---

## 🔄 VERİ AKIŞI

### **PATIENT → MONITOR**
```
1. PATIENT: Bileklikten veri alır
2. PATIENT: App.tsx → sendSensorData()
3. PATIENT: Socket.IO → send_sensor_data event
4. BACKEND: Veriyi database'e kaydeder
5. BACKEND: Eşleştirilmiş MONITOR'u bulur
6. BACKEND: MONITOR'a receive_sensor_data gönderir
7. MONITOR: RemoteMonitoring.tsx → onReceiveSensorData()
8. MONITOR: Ekranda gösterir
```

### **MONITOR → PATIENT**
```
1. MONITOR: Eşik değerlerini ayarlar
2. MONITOR: RemoteMonitoring.tsx → sendThresholds()
3. MONITOR: Socket.IO → send_thresholds event
4. BACKEND: Eşik değerlerini database'e kaydeder
5. BACKEND: PATIENT'a receive_thresholds gönderir
6. PATIENT: App.tsx → onReceiveThresholds()
7. PATIENT: Eşik değerlerini günceller
```

### **Alarm Akışı**
```
1. PATIENT: Alarm tespit eder
2. PATIENT: sendAlarm() → send_alarm event
3. BACKEND: Alarmı database'e kaydeder
4. BACKEND: MONITOR'a receive_alarm gönderir
5. MONITOR: Ekranda gösterir + bildirim gönderir

VEYA

1. MONITOR: Sensör verisi alır
2. MONITOR: Otomatik alarm tespiti yapar
3. MONITOR: sendAlarm() → send_alarm event
4. BACKEND: Alarmı database'e kaydeder
5. BACKEND: PATIENT'a receive_alarm gönderir
6. PATIENT: Ekranda gösterir + bildirim gönderir
```

---

## 🛠️ SERVER BAŞLATMA

### **Komut:**
```bash
cd backend
npm start
```

### **Çıktı:**
```
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://[YOUR_IP]:3000
⏰  Zaman: 01.01.2024 12:00:00
============================================================

✅  Server hazır, cihaz bağlantıları bekleniyor...
```

### **Cihaz Bağlandığında:**
```
==================================================
✅ YENİ CİHAZ BAĞLANDI
Socket ID: abc123
IP: ::ffff:192.168.1.100
Zaman: 01.01.2024 12:00:00
==================================================

📱 CİHAZ KAYDEDİLDİ
Device ID: patient-123
Cihaz Türü: patient
Socket ID: abc123
Toplam Cihaz: 1
```

---

## 🔍 DEBUGGING

### **Server Logları:**
- ✅ Cihaz bağlantıları
- ✅ Veri gönderimi/alımı
- ✅ Alarm işlemleri
- ✅ Eşik değeri güncellemeleri
- ✅ Hata mesajları

### **Test Etmek İçin:**
```bash
# Health check
curl http://localhost:3000/health

# Bağlı cihazlar
curl http://localhost:3000/api/devices

# Sensör verileri
curl http://localhost:3000/api/sensor-data/patient-123
```

---

## ✅ SONUÇ

**Server şu an çalışıyor ve hazır!**

- ✅ Port 3000'de dinliyor
- ✅ API endpoints hazır
- ✅ WebSocket bağlantıları kabul ediyor
- ✅ Database hazır
- ✅ Cihaz bağlantıları bekleniyor

**Frontend'den bağlanmak için:**
1. `frontend-integration.js` içinde IP adresini ayarlayın
2. App.tsx otomatik olarak bağlanacak
3. Server loglarında bağlantıyı göreceksiniz

🚀 **Hazır!**

