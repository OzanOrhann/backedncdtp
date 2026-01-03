# 🚨 MONITOR ALARM TESPİT REHBERİ

## 📋 ÖZET

MONITOR telefonunda sensör verilerini alıp, eşik değerlerine göre alarm tespit eder ve PATIENT telefonuna geri gönderir.

---

## 🔄 VERİ AKIŞI

```
1. Bileklik → Bluetooth → PATIENT Telefon
2. PATIENT → WebSocket → Backend → Database
3. Backend → WebSocket → MONITOR Telefon
4. MONITOR → Alarm Tespit (eşik değerlerine göre)
5. MONITOR → WebSocket → Backend → PATIENT Telefon
6. PATIENT → Ekranda Göster (alarm listesi)
```

---

## 💻 KULLANIM

### MONITOR Telefonunda

```javascript
import { 
  connectToBackend, 
  onReceiveSensorData, 
  sendThresholds,
  setMonitorThresholds,
  setPatientDeviceId
} from './backend/frontend-integration';

// 1. Backend'e bağlan (MONITOR olarak)
await connectToBackend('monitor', { deviceName: 'Monitör Telefon' });

// 2. Eşik değerlerini ayarla (MONITOR'da kullanılacak)
const thresholds = {
  minHeartRate: 40,
  maxHeartRate: 120,
  inactivityMinutes: 5,
  fallThreshold: 2.5
};
setMonitorThresholds(thresholds);

// 3. PATIENT cihaz ID'sini ayarla (eşleştirme sonrası)
setPatientDeviceId('patient_device_123');

// 4. Sensör verilerini dinle ve otomatik alarm tespiti yap
onReceiveSensorData(
  (sensorData, fromDeviceId) => {
    // UI'da göster
    setSensorData(sensorData);
  },
  {
    enableAutoAlarmDetection: true, // Otomatik alarm tespiti aktif
    thresholds: thresholds, // Eşik değerleri
    patientDeviceId: 'patient_device_123', // PATIENT cihaz ID'si
    onAlarmDetected: (alarm, fromDeviceId) => {
      // Alarm tespit edildiğinde
      console.log('🚨 Alarm tespit edildi:', alarm);
      setAlarms(prev => [alarm, ...prev]);
      sendNotification('🚨 MONITOR ALARM', alarm.message);
    }
  }
);
```

---

## 🎯 ALARM TESPİT MANTIĞI

### 1. Düşme Tespiti
```javascript
if (sensorData.movement === 'fall') {
  // Alarm oluştur
}
```

### 2. Düşük/Yüksek Nabız Tespiti
```javascript
if (sensorData.heartRate < thresholds.minHeartRate) {
  // Düşük nabız alarmı
}
if (sensorData.heartRate > thresholds.maxHeartRate) {
  // Yüksek nabız alarmı
}
```

### 3. Hareketsizlik Tespiti
```javascript
if (sensorData.movement === 'idle' && 
    inactivityDuration >= thresholds.inactivityMinutes) {
  // Hareketsizlik alarmı
}
```

---

## 📱 PATIENT TELEFONUNDA

PATIENT telefonunda alarm geldiğinde otomatik olarak ekranda gösterilir:

```javascript
import { onReceiveAlarm } from './backend/frontend-integration';

// Alarmları dinle
onReceiveAlarm((alarm, fromDeviceId) => {
  console.log('🚨 Alarm alındı (MONITOR\'dan):', alarm);
  
  // Alarm listesine ekle
  setAlarms(prev => [alarm, ...prev]);
  
  // Bildirim göster
  sendNotification('🚨 ACİL DURUM', alarm.message);
});
```

---

## ✅ FRONTEND UYUMLULUĞU

Tüm alarm tipleri frontend'deki `Alarm` interface ile uyumlu:

```typescript
interface Alarm {
  id: string;
  type: 'fall' | 'inactivity' | 'low_heart_rate' | 'high_heart_rate' | 'manual';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}
```

---

## 🔧 BACKEND DEĞİŞİKLİKLERİ

Backend'de `send_alarm` event'i güncellendi:

```javascript
// MONITOR'dan PATIENT'a gönderim
socket.emit('send_alarm', {
  alarm: { ... },
  targetDeviceId: 'patient_device_123' // PATIENT'a gönder
});
```

Backend otomatik olarak:
1. Alarm'ı database'e kaydeder
2. PATIENT'a WebSocket ile iletir
3. PATIENT ekranda gösterir

---

## 📊 ÖZET

✅ **MONITOR'da alarm tespiti** - Hazır  
✅ **PATIENT'a alarm gönderme** - Hazır  
✅ **Frontend uyumluluğu** - Hazır  
✅ **Ekranda gösterme** - Hazır  

**Sistem tamamen hazır!** 🎉

