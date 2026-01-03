# 🔄 SİSTEM NASIL ÇALIŞIYOR - DETAYLI AKIŞ

## 📊 VERİ AKIŞ DİYAGRAMI

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   BİLEKLİK      │         │  TELEFON 1      │         │    BACKEND      │
│  (ESP32/BLE)    │         │   (HASTA)       │         │    SERVER       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │                            │
        │ 1. Bluetooth Veri          │                            │
        │─────────────────────────>  │                            │
        │   (Kalp atışı: 75)         │                            │
        │                            │                            │
        │                            │ 2. WebSocket Gönder        │
        │                            │ ─────────────────────────> │
        │                            │   socket.emit(             │
        │                            │     'send_sensor_data'     │
        │                            │   )                        │
        │                            │                            │
        │                            │                            │ 3. Database'e Kaydet
        │                            │                            │ ──────────────────────>
        │                            │                            │   sensor-data.json
        │                            │                            │
        │                            │                            │
        │                            │                            │ 4. Monitöre İlet
        │                            │                            │ <──────────────┐
        │                            │                            │                │
        │                            │                            │                │
        │                            │                            │                ▼
        │                            │                            │         ┌─────────────────┐
        │                            │                            │         │   TELEFON 2     │
        │                            │                            │         │   (MONITÖR)     │
        │                            │                            │         └─────────────────┘
        │                            │                            │                │
        │                            │                            │ <──────────────┘
        │                            │                            │   socket.on(
        │                            │                            │     'receive_sensor_data'
        │                            │                            │   )
        │                            │                            │
        │                            │                            │
        │                            │ 5. Eşik Kontrolü          │
        │                            │ <────────────────────────  │
        │                            │   (75 > 70 OK)             │
        │                            │                            │
        │                            │                            │
        │                            │ 6. ALARM! (Düşük Nabız)    │
        │                            │ ─────────────────────────> │
        │                            │   socket.emit(             │
        │                            │     'send_alarm'           │
        │                            │   )                        │
        │                            │                            │
        │                            │                            │ 7. Database'e Kaydet
        │                            │                            │ ──────────────────────>
        │                            │                            │   alarms.json
        │                            │                            │
        │                            │                            │ 8. Monitöre İlet
        │                            │                            │ ──────────────────────>
        │                            │                            │   (WebSocket)
```

---

## 🔄 ADIM ADIM AKIŞ

### 1️⃣ TELEFON 1 (HASTA) - Veri Toplama ve Gönderme

```javascript
// Bluetooth'tan veri geldiğinde (BLE Characteristic'ten)
BleManager.onCharacteristicChange((characteristic) => {
  const rawData = characteristic.value;
  
  // Veriyi parse et
  const sensorData = {
    heartRate: 75,
    accelX: 0.1,
    accelY: 0.2,
    accelZ: 9.8,
    battery: 85,
    timestamp: Date.now()
  };
  
  // ✅ BACKEND'E WEBSOCKET İLE GÖNDER
  sendSensorData(sensorData);
  
  // Bu fonksiyon şunu yapar:
  // socket.emit('send_sensor_data', { sensorData });
});
```

### 2️⃣ BACKEND - Veriyi Al, Kaydet, İlet

```javascript
// Server.js içinde

socket.on('send_sensor_data', (data) => {
  const { sensorData } = data;
  
  // 1. DATABASE'E KAYDET (JSON dosyası)
  db.saveSensorData(deviceId, sensorData);
  // → backend/database/sensor-data.json
  
  // 2. MONITÖR TELEFONLARA İLET (WebSocket)
  connectedDevices.forEach((device) => {
    if (device.deviceType === 'monitor') {
      // ✅ WEBSOCKET İLE GÖNDER
      socket.to(device.socketId).emit('receive_sensor_data', {
        sensorData,
        fromDeviceId: deviceId,
        timestamp: Date.now()
      });
    }
  });
});
```

### 3️⃣ TELEFON 2 (MONITÖR) - Veriyi Al, Analiz Et, Karar Ver

```javascript
// WebSocket listener
setupListeners({
  onReceiveSensorData: (sensorData) => {
    console.log('📡 Veri alındı:', sensorData);
    
    // 1. UI'DA GÖSTER
    setSensorData(sensorData);
    
    // 2. EŞİK KONTROLÜ YAP
    if (sensorData.heartRate < thresholds.minHeartRate) {
      // Düşük nabız!
      Alert.alert('⚠️ Uyarı', 'Düşük kalp atışı tespit edildi!');
      
      // 3. NOTIFICATION GÖSTER (Telefonda)
      showNotification('Düşük Kalp Atışı', 'Nabız: ' + sensorData.heartRate);
    }
    
    if (sensorData.heartRate > thresholds.maxHeartRate) {
      // Yüksek nabız!
      Alert.alert('⚠️ Uyarı', 'Yüksek kalp atışı!');
      showNotification('Yüksek Kalp Atışı', 'Nabız: ' + sensorData.heartRate);
    }
  }
});

// Eşik değerlerini hasta'ya gönder
const sendThresholdsToPatient = () => {
  // ✅ WEBSOCKET İLE GÖNDER
  sendThresholds(patientDeviceId, {
    minHeartRate: 40,
    maxHeartRate: 120,
    inactivityMinutes: 5,
    fallThreshold: 2.5
  });
  
  // Bu fonksiyon şunu yapar:
  // socket.emit('send_thresholds', { targetDeviceId, thresholds });
};
```

### 4️⃣ TELEFON 1 (HASTA) - Eşik Değerlerini Al

```javascript
setupListeners({
  onReceiveThresholds: (newThresholds) => {
    console.log('📊 Yeni eşik değerleri:', newThresholds);
    
    // 1. STATE'İ GÜNCELLE
    setThresholds(newThresholds);
    
    // 2. NOTIFICATION GÖSTER
    showNotification(
      'Eşik Değerleri Güncellendi',
      `Min: ${newThresholds.minHeartRate}, Max: ${newThresholds.maxHeartRate}`
    );
  }
});
```

---

## 🔌 WEBSOCKET vs NOTIFICATION

### ✅ WEBSOCKET (Telefonlar arası iletişim)

**Ne için kullanılır:**
- Telefon ↔ Backend ↔ Telefon iletişimi
- Gerçek zamanlı veri gönderme/alma
- İki yönlü sürekli bağlantı

**Nasıl çalışır:**
```javascript
// Gönderme
socket.emit('send_sensor_data', data);

// Alma
socket.on('receive_sensor_data', (data) => {
  // Veri geldi!
});
```

**Özellikleri:**
- ⚡ Çok hızlı (< 10ms latency)
- 🔄 İki yönlü (gönder + al)
- 🔌 Sürekli bağlantı
- 📡 Backend üzerinden

### ✅ NOTIFICATION (Kullanıcıya bildirim)

**Ne için kullanılır:**
- Telefon ekranında bildirim gösterme
- Kullanıcıyı uyarma
- Ses/titreşim

**Nasıl çalışır:**
```javascript
import * as Notifications from 'expo-notifications';

// Bildirim göster
await Notifications.scheduleNotificationAsync({
  content: {
    title: '🚨 ALARM',
    body: 'Düşme tespit edildi!',
    sound: true,
  },
  trigger: null, // Hemen göster
});
```

**Özellikleri:**
- 📱 Sadece o telefonda görünür
- 🔔 Ses/titreşim çıkarır
- 👤 Kullanıcı etkileşimi
- 🔕 Backend'e bağlı değil

---

## 📝 ÖZET: NASIL ÇALIŞIYOR

### VERİ AKIŞI:

```
BİLEKLİK (Bluetooth)
    ↓
TELEFON 1 (Hasta)
    ↓ WebSocket ile gönder
BACKEND SERVER
    ↓ Database'e kaydet (sensor-data.json)
    ↓ WebSocket ile ilet
TELEFON 2 (Monitör)
    ↓ Analiz et
    ↓ Eşik kontrolü yap
    ↓ Karar ver
    ↓
  [ALARM mı?]
    ↙     ↘
  EVET    HAYIR
    ↓       ↓
WebSocket  Normal
ile geri   göster
gönder
    ↓
BACKEND
    ↓ Database'e kaydet (alarms.json)
    ↓ WebSocket ile ilet
TELEFON 1 (Hasta)
    ↓ Notification göster
  🔔 "Alarm onaylandı"
```

---

## 🎯 PROTOKOL KULLANIMI

### WEBSOCKET kullanılır:
- ✅ Telefon 1 → Backend (sensör verisi gönder)
- ✅ Backend → Telefon 2 (sensör verisi al)
- ✅ Telefon 2 → Backend (eşik değerleri gönder)
- ✅ Backend → Telefon 1 (eşik değerleri al)
- ✅ Telefon 1 → Backend (alarm gönder)
- ✅ Backend → Telefon 2 (alarm al)
- ✅ Telefon 2 → Backend (alarm onayla)
- ✅ Backend → Telefon 1 (onay al)

### NOTIFICATION kullanılır:
- 🔔 Telefon 2'de alarm geldiğinde → Kullanıcıya göster
- 🔔 Telefon 1'de onay geldiğinde → Kullanıcıya göster
- 🔔 Eşik değiştiğinde → Kullanıcıya göster

---

## 💾 DATABASE KULLANIMI

### Backend'de Otomatik Kaydedilir:

```javascript
// 1. Sensör verisi geldiğinde
db.saveSensorData(deviceId, sensorData);
// → backend/database/sensor-data.json

// 2. Alarm geldiğinde
db.saveAlarm(deviceId, alarm);
// → backend/database/alarms.json

// 3. Eşik değerleri güncellendiğinde
db.saveThresholds(deviceId, thresholds);
// → backend/database/thresholds.json
```

### Monitör Telefon İhtiyaç Duyarsa Okur:

```javascript
// Backend API'den geçmiş verileri çek
fetch('http://192.168.1.100:3000/api/sensor-data/patient_device_001?limit=100')
  .then(res => res.json())
  .then(data => {
    console.log('Son 100 veri:', data);
    // Grafik çizebilirsin
  });
```

---

## 🔍 GERÇEK ZAMANLIDA NELER OLUYOR?

### Telefon 1 (Hasta):
```
09:00:00 → Bluetooth'tan veri al (HR: 75)
09:00:00 → WebSocket ile backend'e gönder
09:00:01 → Backend kaydetti ✅
09:00:01 → Backend monitöre iletti ✅
```

### Backend Server:
```
09:00:00 → Hasta'dan veri alındı
09:00:00 → Database'e kaydediliyor...
09:00:01 → ✅ Kaydedildi: sensor-data.json
09:00:01 → Monitör telefon aranıyor...
09:00:01 → ✅ WebSocket ile gönderildi
```

### Telefon 2 (Monitör):
```
09:00:01 → Veri alındı (HR: 75)
09:00:01 → Ekranda gösteriliyor
09:00:01 → Eşik kontrolü yapılıyor...
09:00:01 → ✅ Normal (40 < 75 < 120)
```

**Eğer alarm olsaydı:**
```
09:00:10 → Veri alındı (HR: 35) ⚠️
09:00:10 → EŞİK AŞILDI! (35 < 40)
09:00:10 → 🔔 NOTIFICATION GÖSTER: "Düşük kalp atışı!"
09:00:10 → Monitörden otomatik mesaj gönder
09:00:11 → WebSocket ile backend'e alarm onayı gönder
09:00:11 → Backend hasta telefonuna iletir
09:00:11 → Hasta telefonunda 🔔 "Alarm onaylandı" bildirimi
```

---

## ✅ SONUÇ

**WEBSOCKET:** Telefonlar arası iletişim (Backend üzerinden)
**NOTIFICATION:** Kullanıcıya bildirim gösterme (Telefon içinde)
**DATABASE:** Backend'de veri saklama (JSON dosyaları)

**HEPSİ BİRLİKTE ÇALIŞIR!** 🎉
