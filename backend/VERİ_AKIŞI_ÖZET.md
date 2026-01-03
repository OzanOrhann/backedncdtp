# 📊 VERİ AKIŞI ÖZET - PATIENT ve MONITOR

## 🎯 AMAÇ

### PATIENT Telefonu (Hasta):
- ✅ Bileklikten veri alır (Bluetooth)
- ✅ Verileri ekranda gösterir
- ✅ Eşik değerlerini ekranda gösterir
- ✅ Verileri MONITOR'a gönderir (WebSocket)
- ✅ Alarmları MONITOR'a gönderir (WebSocket)
- ✅ MONITOR'dan eşik değerlerini alır

### MONITOR Telefonu (Bakıcı):
- ✅ PATIENT'ın verilerini ekranda gösterir
- ✅ Alarmları ekranda gösterir
- ✅ Eşik değerlerini ayarlar ve PATIENT'a gönderir
- ✅ Alarm tespit ederse PATIENT'a gönderir

---

## 🔄 VERİ AKIŞI

### 1. PATIENT → MONITOR (Sensör Verileri)

```
Bileklik (Bluetooth)
  ↓
PATIENT Telefon (Verileri alır, ekranda gösterir)
  ↓ WebSocket: send_sensor_data
Backend (Database'e kaydeder)
  ↓ WebSocket: receive_sensor_data
MONITOR Telefon (Verileri alır, ekranda gösterir)
```

**Kod (PATIENT):**
```javascript
// Bileklikten veri geldiğinde
const parsedData = parseSensorData(rawData);
setSensorData(parsedData); // Ekranda göster

// Backend'e gönder
sendSensorData(parsedData);
```

**Kod (MONITOR):**
```javascript
// PATIENT'tan veri geldiğinde
onReceiveSensorData((sensorData) => {
  setSensorData(sensorData); // Ekranda göster
});
```

---

### 2. PATIENT → MONITOR (Alarmlar)

```
PATIENT Telefon (Alarm tespit eder)
  ↓ WebSocket: send_alarm
Backend (Database'e kaydeder)
  ↓ WebSocket: receive_alarm
MONITOR Telefon (Alarmı alır, ekranda gösterir)
```

**Kod (PATIENT):**
```javascript
// Alarm tespit edildiğinde
const alarms = detectAlarms(sensorData);
setAlarms(prev => [...alarms, ...prev]); // Ekranda göster

// Backend'e gönder
alarms.forEach(alarm => sendAlarm(alarm));
```

**Kod (MONITOR):**
```javascript
// PATIENT'tan alarm geldiğinde
onReceiveAlarm((alarm) => {
  setAlarms(prev => [alarm, ...prev]); // Ekranda göster
  sendNotification('🚨 ALARM', alarm.message);
});
```

---

### 3. MONITOR → PATIENT (Eşik Değerleri)

```
MONITOR Telefon (Eşik değerlerini ayarlar)
  ↓ WebSocket: send_thresholds
Backend (Database'e kaydeder)
  ↓ WebSocket: receive_thresholds
PATIENT Telefon (Eşik değerlerini alır, ekranda gösterir)
```

**Kod (MONITOR):**
```javascript
// Eşik değerlerini ayarla
const newThresholds = { minHeartRate: 40, maxHeartRate: 120, ... };
setThresholds(newThresholds); // Ekranda göster

// PATIENT'a gönder
sendThresholds(patientDeviceId, newThresholds);
```

**Kod (PATIENT):**
```javascript
// MONITOR'dan eşik değerleri geldiğinde
onReceiveThresholds((thresholds) => {
  setThresholds(thresholds); // Ekranda göster
});
```

---

### 4. MONITOR → PATIENT (Alarmlar - MONITOR Tespit Eder)

```
MONITOR Telefon (Sensör verilerini alır, alarm tespit eder)
  ↓ Otomatik alarm tespiti
  ↓ WebSocket: send_alarm (targetDeviceId ile)
Backend (Database'e kaydeder)
  ↓ WebSocket: receive_alarm
PATIENT Telefon (Alarmı alır, ekranda gösterir)
```

**Kod (MONITOR):**
```javascript
// Sensör verisi geldiğinde otomatik alarm tespiti
onReceiveSensorData(
  (sensorData) => setSensorData(sensorData),
  {
    enableAutoAlarmDetection: true,
    thresholds: thresholds,
    patientDeviceId: patientDeviceId,
    onAlarmDetected: (alarm) => {
      // Otomatik olarak PATIENT'a gönderilir
      setAlarms(prev => [alarm, ...prev]); // MONITOR'da da göster
    }
  }
);
```

**Kod (PATIENT):**
```javascript
// MONITOR'dan alarm geldiğinde
onReceiveAlarm((alarm) => {
  setAlarms(prev => [alarm, ...prev]); // Ekranda göster
  sendNotification('🚨 MONITOR ALARM', alarm.message);
});
```

---

## 📱 EKRANDA GÖSTERİM

### PATIENT Telefonu Ekranında:
- ✅ Sensör verileri (kalp atışı, ivme, batarya)
- ✅ Eşik değerleri (min/max nabız, hareketsizlik, düşme)
- ✅ Alarmlar (PATIENT'ın tespit ettiği + MONITOR'dan gelen)

### MONITOR Telefonu Ekranında:
- ✅ PATIENT'ın sensör verileri (kalp atışı, ivme, batarya)
- ✅ Alarmlar (PATIENT'tan gelen + MONITOR'un tespit ettiği)
- ✅ Eşik değerleri ayarlama arayüzü

---

## ✅ SONUÇ

**Tüm veri akışları hazır:**
- ✅ PATIENT → MONITOR: Sensör verileri
- ✅ PATIENT → MONITOR: Alarmlar
- ✅ MONITOR → PATIENT: Eşik değerleri
- ✅ MONITOR → PATIENT: Alarmlar (MONITOR tespit eder)

**Ekranda gösterim:**
- ✅ PATIENT: Veriler + Eşik değerleri + Alarmlar
- ✅ MONITOR: PATIENT'ın verileri + Alarmlar + Eşik ayarlama

**Frontend uyumlu:** Tüm veriler App.tsx'teki state'lerle uyumlu

