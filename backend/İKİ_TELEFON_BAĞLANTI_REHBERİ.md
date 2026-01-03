# 📱 İKİ TELEFON BACKEND BAĞLANTI REHBERİ

## 🎯 Senaryo

**TELEFON 1 (HASTA/BİLEKLİK TAŞIYAN)**
- Bluetooth ile bileklikten veri alır
- Aldığı verileri Backend'e gönderir
- Monitör'den gelen eşik değerlerini alır
- Acil durumda alarm gönderir

**TELEFON 2 (MONITOR/TAKİPÇİ)**
- Backend'den hasta verilerini alır
- Eşik değerlerini hasta telefonuna gönderir
- Alarmları alır ve bildirim gösterir
- Alarm onaylar

---

## 🚀 ADIM 1: BACKEND SERVER'I BAŞLAT

### Windows/Mac/Linux:

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
🌐  Network: http://[YOUR_IP]:3000
============================================================
```

### Server'ın IP Adresini Bul:

**Windows:**
```bash
ipconfig
# "IPv4 Address" satırına bak (örn: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# veya
hostname -I
```

**ÖNEMLİ:** Bu IP adresini not edin! (örnek: `192.168.1.100`)

---

## 📱 ADIM 2: FRONTEND ENTEGRASYONU

### 2.1. Socket.io-client Kur

React Native projenizde:

```bash
npm install socket.io-client @react-native-async-storage/async-storage
```

### 2.2. Backend Bağlantı Dosyası Oluştur

`services/backend-service.js` dosyası oluşturun:

```javascript
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// BACKEND SERVER IP'Sİ - KEND IP'NİZİ YAZIN!
const BACKEND_URL = 'http://192.168.1.100:3000';

let socket = null;
let deviceId = null;

/**
 * Backend'e bağlan
 * @param {string} deviceType - 'patient' veya 'monitor'
 */
export async function connectBackend(deviceType) {
  try {
    // Cihaz ID'si oluştur veya kayıtlı olanı kullan
    deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `${deviceType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }

    console.log('Backend\'e bağlanılıyor:', BACKEND_URL);
    console.log('Cihaz ID:', deviceId);
    console.log('Cihaz Tipi:', deviceType);

    // Socket bağlantısı
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    // Bağlantı başarılı
    socket.on('connect', () => {
      console.log('✅ Backend\'e bağlandı!');
      
      // Cihazı kaydet
      socket.emit('register', {
        deviceId,
        deviceType,
        deviceName: deviceType === 'patient' ? 'Hasta Telefon' : 'Monitör Telefon'
      });
    });

    // Kayıt başarılı
    socket.on('registered', (data) => {
      console.log('✅ Cihaz kaydedildi:', data);
      Alert.alert('Bağlantı Başarılı', 'Backend\'e bağlandınız!');
    });

    // Bağlantı koptu
    socket.on('disconnect', () => {
      console.log('❌ Backend bağlantısı kesildi');
    });

    // Hata
    socket.on('error', (error) => {
      console.error('❌ Socket hatası:', error);
      Alert.alert('Hata', error.message || 'Bağlantı hatası');
    });

    return { socket, deviceId };

  } catch (error) {
    console.error('Bağlantı hatası:', error);
    Alert.alert('Hata', 'Backend\'e bağlanılamadı!');
    throw error;
  }
}

/**
 * Eşik değerlerini gönder (MONITOR -> PATIENT)
 */
export function sendThresholds(targetDeviceId, thresholds) {
  if (!socket || !socket.connected) {
    console.error('Socket bağlantısı yok!');
    return;
  }

  socket.emit('send_thresholds', {
    targetDeviceId,
    thresholds
  });

  console.log('📊 Eşik değerleri gönderildi:', thresholds);
}

/**
 * Sensör verilerini gönder (PATIENT -> MONITOR)
 */
export function sendSensorData(sensorData) {
  if (!socket || !socket.connected) {
    console.error('Socket bağlantısı yok!');
    return;
  }

  socket.emit('send_sensor_data', {
    sensorData
  });

  console.log('📡 Sensör verisi gönderildi');
}

/**
 * Alarm gönder (PATIENT -> MONITOR)
 */
export function sendAlarm(alarm) {
  if (!socket || !socket.connected) {
    console.error('Socket bağlantısı yok!');
    return;
  }

  socket.emit('send_alarm', {
    alarm
  });

  console.log('🚨 Alarm gönderildi:', alarm);
}

/**
 * Alarm onayla (MONITOR -> PATIENT)
 */
export function acknowledgeAlarm(alarmId, targetDeviceId) {
  if (!socket || !socket.connected) {
    console.error('Socket bağlantısı yok!');
    return;
  }

  socket.emit('acknowledge_alarm', {
    alarmId,
    targetDeviceId
  });

  console.log('✅ Alarm onaylandı');
}

/**
 * Event listener'lar ekle
 */
export function setupListeners(callbacks) {
  if (!socket) return;

  // Eşik değerleri alındı (PATIENT için)
  if (callbacks.onReceiveThresholds) {
    socket.on('receive_thresholds', (data) => {
      console.log('📊 Eşik değerleri alındı:', data.thresholds);
      callbacks.onReceiveThresholds(data.thresholds);
    });
  }

  // Sensör verisi alındı (MONITOR için)
  if (callbacks.onReceiveSensorData) {
    socket.on('receive_sensor_data', (data) => {
      console.log('📡 Sensör verisi alındı:', data.sensorData);
      callbacks.onReceiveSensorData(data.sensorData);
    });
  }

  // Alarm alındı (MONITOR için)
  if (callbacks.onReceiveAlarm) {
    socket.on('receive_alarm', (data) => {
      console.log('🚨 ALARM ALINDI:', data.alarm);
      callbacks.onReceiveAlarm(data.alarm);
    });
  }

  // Alarm onayı alındı (PATIENT için)
  if (callbacks.onAlarmAcknowledged) {
    socket.on('alarm_acknowledged', (data) => {
      console.log('✅ Alarm onaylandı:', data.alarmId);
      callbacks.onAlarmAcknowledged(data.alarmId);
    });
  }
}

/**
 * Bağlantıyı kes
 */
export function disconnectBackend() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('❌ Backend bağlantısı kapatıldı');
  }
}

/**
 * Bağlantı durumunu kontrol et
 */
export function isConnected() {
  return socket && socket.connected;
}

export { deviceId };
```

---

## 📱 ADIM 3: HASTA TELEFONU (PATIENT)

### App.tsx'e ekleyin:

```javascript
import { 
  connectBackend, 
  sendSensorData, 
  sendAlarm,
  setupListeners 
} from './services/backend-service';

export default function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  // Uygulama başlarken backend'e bağlan
  useEffect(() => {
    const initBackend = async () => {
      try {
        await connectBackend('patient'); // HASTA TELEFONU
        setIsBackendConnected(true);
        
        // Event listener'ları ayarla
        setupListeners({
          // Monitör'den eşik değerleri geldiğinde
          onReceiveThresholds: (newThresholds) => {
            console.log('Yeni eşik değerleri alındı:', newThresholds);
            setThresholds(newThresholds);
            Alert.alert('Eşik Değerleri Güncellendi', 
              `Min Nabız: ${newThresholds.minHeartRate}\n` +
              `Max Nabız: ${newThresholds.maxHeartRate}`
            );
          },
          
          // Alarm onaylandığında
          onAlarmAcknowledged: (alarmId) => {
            console.log('Alarm onaylandı:', alarmId);
            // Alarm listesini güncelle
            setAlarms(prev => prev.map(alarm => 
              alarm.id === alarmId 
                ? { ...alarm, acknowledged: true }
                : alarm
            ));
          }
        });
        
      } catch (error) {
        console.error('Backend bağlantı hatası:', error);
        Alert.alert('Hata', 'Backend\'e bağlanılamadı!');
      }
    };
    
    initBackend();
  }, []);
  
  // Bluetooth'tan veri geldiğinde backend'e gönder
  useEffect(() => {
    if (isBackendConnected && sensorData.heartRate !== null) {
      // Backend'e gönder
      sendSensorData(sensorData);
    }
  }, [sensorData, isBackendConnected]);
  
  // Alarm oluştuğunda backend'e gönder
  const triggerAlarm = (type, message) => {
    const alarm = {
      id: `alarm_${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
      acknowledged: false
    };
    
    // Local state'e ekle
    setAlarms(prev => [...prev, alarm]);
    
    // Backend'e gönder
    if (isBackendConnected) {
      sendAlarm(alarm);
    }
    
    // Bildirim göster
    sendNotification(type, message);
  };
  
  // ... geri kalan kod
}
```

---

## 📱 ADIM 4: MONITÖR TELEFONU (MONITOR)

### App.tsx'e ekleyin:

```javascript
import { 
  connectBackend, 
  sendThresholds,
  acknowledgeAlarm,
  setupListeners 
} from './services/backend-service';

export default function App() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [patientDeviceId, setPatientDeviceId] = useState(null);
  
  // Uygulama başlarken backend'e bağlan
  useEffect(() => {
    const initBackend = async () => {
      try {
        await connectBackend('monitor'); // MONITÖR TELEFONU
        setIsBackendConnected(true);
        
        // Event listener'ları ayarla
        setupListeners({
          // Hasta'dan sensör verisi geldiğinde
          onReceiveSensorData: (sensorData) => {
            console.log('Sensör verisi alındı:', sensorData);
            setSensorData(sensorData);
            
            // Eşik kontrolü yap
            checkThresholds(sensorData);
          },
          
          // Hasta'dan alarm geldiğinde
          onReceiveAlarm: (alarm) => {
            console.log('🚨 ALARM ALINDI:', alarm);
            
            // Alarm listesine ekle
            setAlarms(prev => [...prev, alarm]);
            
            // Bildirim göster
            sendNotification(alarm.type, alarm.message);
            
            // Ses çal
            playAlarmSound();
          }
        });
        
      } catch (error) {
        console.error('Backend bağlantı hatası:', error);
        Alert.alert('Hata', 'Backend\'e bağlanılamadı!');
      }
    };
    
    initBackend();
  }, []);
  
  // Eşik değerlerini hasta'ya gönder
  const sendThresholdsToPatient = () => {
    if (!isBackendConnected) {
      Alert.alert('Hata', 'Backend bağlantısı yok!');
      return;
    }
    
    if (!patientDeviceId) {
      Alert.alert('Hata', 'Hasta cihazı seçilmedi!');
      return;
    }
    
    sendThresholds(patientDeviceId, thresholds);
    Alert.alert('Başarılı', 'Eşik değerleri gönderildi!');
  };
  
  // Alarm'ı onayla
  const handleAcknowledgeAlarm = (alarmId) => {
    if (!isBackendConnected || !patientDeviceId) return;
    
    // Backend'e gönder
    acknowledgeAlarm(alarmId, patientDeviceId);
    
    // Local state'i güncelle
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, acknowledged: true }
        : alarm
    ));
  };
  
  // ... geri kalan kod
}
```

---

## 🔧 ADIM 5: VERİ FORMATI ÖZELLEŞTİRME

Bileklikten gelen veri formatı belli olduğunda:

`backend/data-format.js` dosyasını açın ve `parseWearableData()` fonksiyonunu düzenleyin:

```javascript
function parseWearableData(rawData) {
  // ÖRNEK: Eğer bileklik "HR:75,AX:0.1,AY:0.2" formatında gönderiyorsa
  if (typeof rawData === 'string' && rawData.includes('HR:')) {
    const parts = rawData.split(',');
    const hr = parseFloat(parts[0].split(':')[1]);
    const ax = parseFloat(parts[1].split(':')[1]);
    const ay = parseFloat(parts[2].split(':')[1]);
    // ...
    
    return {
      heartRate: hr,
      accelX: ax,
      accelY: ay,
      // ...
    };
  }
  
  // Varsayılan işleme
  return rawData;
}
```

---

## 🗄️ DATABASE

Veriler otomatik olarak `backend/database/` klasörüne kaydedilir:

```
backend/database/
├── sensor-data.json    # Sensör verileri
├── alarms.json         # Alarmlar
├── thresholds.json     # Eşik değerleri
└── devices.json        # Cihaz bilgileri
```

**Not:** 30 günden eski veriler otomatik silinir.

---

## ✅ TEST SENARYOSU

### 1. Backend'i başlat:
```bash
cd backend
npm start
```

### 2. Hasta telefonunu aç:
- Uygulama açılır açılmaz backend'e bağlanır
- Bluetooth'tan veri almaya başlar
- Verileri backend'e gönderir

### 3. Monitör telefonunu aç:
- Backend'e bağlanır
- Hasta verisini almaya başlar
- Eşik değerlerini gönderir

### 4. Test:
- Hasta telefonunda alarm tetikle
- Monitör telefonunda alarm gösterilir
- Monitörden onay gönder
- Hasta telefonunda onay alınır

---

## 🔍 SORUN GİDERME

### Backend'e bağlanamıyor:

1. Backend çalışıyor mu?
```bash
curl http://localhost:3000/health
```

2. IP adresi doğru mu?
- `ipconfig` (Windows) veya `ifconfig` (Mac/Linux)
- `BACKEND_URL`'i kontrol et

3. Aynı WiFi'de misiniz?
- Her iki telefon ve bilgisayar aynı ağda olmalı

4. Firewall engelliyor mu?
- Port 3000'i aç
- Veya backend'i başka porta taşı: `PORT=3001 npm start`

### Veriler gelmiyor:

1. Console loglarını kontrol et
2. Backend loglarına bak
3. Socket bağlantısını test et:
```javascript
console.log('Backend bağlı mı?', isConnected());
```

---

## 📞 ÖNEMLİ NOTLAR

✅ Backend çalışırken telefonları başlatın
✅ Aynı WiFi ağında olun
✅ IP adresini doğru yazın
✅ Bileklik veri formatını `data-format.js`'de ayarlayın
✅ Database otomatik oluşturulur, elle bir şey yapmanıza gerek yok

---

## 🎯 ÖZET

1. **Backend** → Bilgisayarda çalışır, iki telefonu bağlar
2. **Hasta Telefonu** → Bluetooth'tan veri alır, backend'e gönderir
3. **Monitör Telefonu** → Backend'den veri alır, alarm gösterir
4. **Database** → Tüm veriler otomatik kaydedilir
5. **Veri Formatı** → Kolayca özelleştirilebilir
