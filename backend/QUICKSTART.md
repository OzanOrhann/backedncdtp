# 🚀 ÇDTP Backend - Hızlı Başlatma Rehberi

## ⚡ 3 Adımda Başlat

### 1️⃣ Kurulum
```bash
cd backend
npm install
```

### 2️⃣ Çalıştır
```bash
npm start
```

### 3️⃣ Test Et
Tarayıcıda aç: **http://localhost:3000**

✅ Eğer bu ekranı görüyorsanız backend çalışıyor!
```json
{
  "message": "🏥 ÇDTP Backend Server",
  "status": "online",
  "connectedDevices": 0
}
```

---

## 📱 Mobil Uygulamaya Bağlama

### Adım 1: Server IP Adresini Bul

**Windows'ta:**
```bash
ipconfig
```
IPv4 Address satırını kopyala (örn: 192.168.1.100)

**Mac/Linux'ta:**
```bash
ifconfig | grep "inet "
```

### Adım 2: Frontend'i Yapılandır

`frontend-integration.js` dosyasını mobil projenize kopyalayın:

```bash
# Projenizin ana dizinine kopyalayın
cp backend/frontend-integration.js ../utils/backendService.js
```

Dosyayı açın ve `BACKEND_URL` değişkenini güncelleyin:

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

### Adım 3: App.tsx'e Entegre Et

```javascript
import { 
  connectToBackend, 
  sendSensorData,
  onReceiveAlarm,
  sendAlarm,
  sendThresholds,
  onReceiveThresholds
} from './utils/backendService';

export default function App() {
  // Mevcut state'leriniz...
  
  useEffect(() => {
    // Backend'e bağlan
    const deviceType = 'patient'; // veya 'monitor'
    
    connectToBackend(deviceType, {
      deviceName: 'İPhone 13',
      appVersion: '1.0.0'
    });
    
    // EĞER MONITOR İSE: Alarmları dinle
    if (deviceType === 'monitor') {
      onReceiveAlarm((alarm, fromDeviceId) => {
        console.log('🚨 Alarm geldi:', alarm);
        setAlarms(prev => [alarm, ...prev]);
        
        // Bildirim gönder
        sendNotification('🚨 ACİL DURUM', alarm.message);
      });
      
      // Sensör verilerini dinle
      onReceiveSensorData((data, fromDeviceId) => {
        console.log('📡 Sensör verisi:', data);
        setSensorData(data);
      });
    }
    
    // EĞER PATIENT İSE: Eşik değerlerini dinle
    if (deviceType === 'patient') {
      onReceiveThresholds((newThresholds) => {
        console.log('📊 Eşik değerleri güncellendi:', newThresholds);
        setThresholds(newThresholds);
      });
    }
  }, []);
  
  // Sensör verisi güncellendiğinde backend'e gönder (PATIENT)
  useEffect(() => {
    if (sensorData.heartRate !== null) {
      sendSensorData(sensorData);
    }
  }, [sensorData]);
  
  // Alarm oluştuğunda backend'e gönder (PATIENT)
  const handleAlarmDetected = (type, message) => {
    const alarm = {
      id: `alarm_${Date.now()}`,
      type, // 'fall' | 'inactivity' | 'low_heart_rate' | etc.
      message,
      timestamp: Date.now(),
      acknowledged: false
    };
    
    sendAlarm(alarm);
    setAlarms(prev => [alarm, ...prev]);
  };
  
  // Eşik değerleri değiştiğinde backend'e gönder (MONITOR)
  const handleThresholdsChange = (newThresholds) => {
    setThresholds(newThresholds);
    
    // Eşleştirilmiş patient cihazına gönder
    const patientDeviceId = 'TARGET_PATIENT_ID'; // Eşleşme yapılacak
    sendThresholds(patientDeviceId, newThresholds);
  };
  
  // Mevcut render kodunuz...
}
```

---

## 🧪 Test Senaryoları

### Test 1: İki Telefon Bağlantısı

**Telefon 1 (Hasta):**
1. Uygulamayı aç
2. Device type: `patient`
3. Backend bağlantısı otomatik kurulur

**Telefon 2 (Monitör):**
1. Uygulamayı aç
2. Device type: `monitor`
3. Backend bağlantısı otomatik kurulur

**Server loglarında görünmeli:**
```
✅ YENİ CİHAZ BAĞLANDI
📱 CİHAZ KAYDEDİLDİ
Device ID: device_1234_abc
Cihaz Türü: patient
Toplam Cihaz: 1
```

### Test 2: Eşik Değerleri Gönderme

**Monitör telefonunda:**
```javascript
sendThresholds('patient-device-id', {
  minHeartRate: 40,
  maxHeartRate: 120,
  inactivityMinutes: 5,
  fallThreshold: 2.5
});
```

**Hasta telefonunda otomatik alınır:**
```javascript
onReceiveThresholds((newThresholds) => {
  console.log('Eşik değerleri güncellendi!', newThresholds);
});
```

### Test 3: Sensör Verisi Gönderme

**Hasta telefonunda:**
```javascript
sendSensorData({
  heartRate: 75,
  accelX: 0.1,
  accelY: 0.2,
  accelZ: 9.8,
  movement: 'active',
  timestamp: Date.now(),
  battery: 85
});
```

**Monitör telefonunda otomatik alınır!**

### Test 4: Alarm Gönderme

**Hasta telefonunda:**
```javascript
sendAlarm({
  id: `alarm_${Date.now()}`,
  type: 'fall',
  message: 'Düşme tespit edildi!',
  timestamp: Date.now(),
  acknowledged: false
});
```

**Monitör telefonunda alarm çalar! 🚨**

---

## ⚠️ Sorun Giderme

### Server başlamıyor
```bash
# Port kullanımda hatası
PORT=3001 npm start
```

### Telefon bağlanamıyor
- ✅ Server çalışıyor mu? (http://localhost:3000 kontrol et)
- ✅ IP adresi doğru mu?
- ✅ Telefon ve bilgisayar aynı WiFi'de mi?
- ✅ Firewall kapalı mı?

### Mesajlar gitmiyor
- ✅ Her iki telefon da `register` eventi gönderdi mi?
- ✅ Server loglarını kontrol et
- ✅ Socket bağlantısı aktif mi? (`isConnected()` çağır)

---

## 📊 API Test (Browser'da)

```bash
# Sağlık kontrolü
curl http://localhost:3000/health

# Bağlı cihazlar
curl http://localhost:3000/api/devices

# Sensör verileri
curl http://localhost:3000/api/sensor-data/device_123

# Alarmlar
curl http://localhost:3000/api/alarms/device_123
```

---

## 🎯 Production'a Geçiş

Backend'i cloud'a deploy etmek için `DEPLOYMENT.md` dosyasına bakın.

Önerilen platformlar:
- 🆓 **Heroku** - Ücretsiz, kolay
- 🆓 **Render.com** - Ücretsiz, hızlı
- 🆓 **Railway** - Ücretsiz, otomatik deploy

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. Server loglarını kontrol edin (`npm start`)
2. Tarayıcıda `http://localhost:3000` açın
3. Her iki telefonda da console loglarını kontrol edin

✅ **Backend çalışıyor, frontend'e entegre etmeye hazır!**
