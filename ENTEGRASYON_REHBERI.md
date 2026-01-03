# 🔗 Frontend-Backend Entegrasyon Rehberi

## ⚠️ ÖNEMLİ: App.tsx Değiştirilmeden Entegrasyon

Backend hazır ve çalışıyor. Frontend entegrasyonu için **minimal** değişiklik gerekiyor.

---

## 🎯 Seçenek 1: Otomatik Entegrasyon (ÖNERİLEN - Minimal Kod)

App.tsx'e **sadece 2 satır** ekleyin:

### 1. Import ekleyin (dosyanın başına):

```typescript
// App.tsx - en üste ekleyin
import {
  autoIntegrate,
  autoSendSensorData,
  autoSendAlarm,
} from './backend/frontend-integration';
```

### 2. useEffect ekleyin (mevcut useEffect'lerden sonra):

```typescript
// App.tsx - useEffect içinde
useEffect(() => {
  // Otomatik backend entegrasyonu
  autoIntegrate({
    setSensorData,
    setAlarms,
    setThresholds,
    sendNotification,
  });
}, []);
```

### 3. Sensör verisi ve alarm gönderme (mevcut kodunuza ekleyin):

```typescript
// parseSensorData sonrası (satır ~307)
const parsedData = parseSensorData(decodedData);
if (parsedData) {
  setSensorData(parsedData);
  
  // ✅ Backend'e gönder
  autoSendSensorData(parsedData);
  
  // Alarm tespiti
  const newAlarms = detectAlarms(parsedData);
  if (newAlarms.length > 0) {
    setAlarms((prev) => [...newAlarms, ...prev]);
    
    newAlarms.forEach((alarm) => {
      sendNotification('🚨 ACİL DURUM', alarm.message);
      
      // ✅ Backend'e gönder
      autoSendAlarm(alarm);
    });
  }
}
```

**Toplam değişiklik: ~10 satır**

---

## 🎯 Seçenek 2: Manuel Entegrasyon (Daha Fazla Kontrol)

### 1. Import:

```typescript
import {
  connectToBackend,
  sendSensorData,
  sendAlarm,
  onReceiveThresholds,
  onReceiveSensorData,
  onReceiveAlarm,
  isConnected,
} from './backend/frontend-integration';
```

### 2. Backend bağlantısı:

```typescript
useEffect(() => {
  // Backend'e bağlan
  connectToBackend('patient', {
    deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
  });
  
  // Eşik değerlerini dinle
  onReceiveThresholds((newThresholds) => {
    setThresholds(newThresholds);
  });
  
  // Alarmları dinle (monitor için)
  onReceiveAlarm((alarm) => {
    setAlarms((prev) => [alarm, ...prev]);
    sendNotification('🚨 ACİL DURUM', alarm.message);
  });
  
  // Sensör verilerini dinle (monitor için)
  onReceiveSensorData((data) => {
    setSensorData(data);
  });
}, []);
```

### 3. Veri gönderme:

```typescript
// parseSensorData sonrası
if (parsedData) {
  setSensorData(parsedData);
  
  // Backend'e gönder
  if (isConnected()) {
    sendSensorData(parsedData);
  }
}

// detectAlarms sonrası
if (newAlarms.length > 0) {
  newAlarms.forEach((alarm) => {
    if (isConnected()) {
      sendAlarm(alarm);
    }
  });
}
```

---

## ⚙️ Yapılandırma

### Backend URL'i Ayarlayın

`backend/frontend-integration.js` dosyasında:

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

**IP adresini bulmak için:**
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

---

## ✅ Test

1. Backend'i başlatın:
   ```bash
   cd backend
   npm start
   ```

2. Frontend'de backend bağlantısını kontrol edin:
   - Console'da "✅ Backend'e bağlandı" mesajını görmelisiniz
   - Sensör verileri geldiğinde backend'e gönderilmeli
   - Alarmlar tespit edildiğinde backend'e gönderilmeli

---

## 📝 Notlar

- **Device Type:** Varsayılan `'patient'`. İki telefon kullanırken birini `'monitor'` yapın
- **Backend URL:** Mutlaka kendi server IP'nizi yazın
- **Paketler:** `socket.io-client` ve `@react-native-async-storage/async-storage` yüklü olmalı

---

## 🚨 Sorun Giderme

### Backend'e bağlanamıyor:
- Backend çalışıyor mu? (`npm start` ile başlatın)
- IP adresi doğru mu? (`backend/frontend-integration.js` içinde)
- Aynı WiFi ağında mısınız?

### Veriler gönderilmiyor:
- `isConnected()` kontrolü yapın
- Console loglarını kontrol edin
- Backend console'unda veri geliyor mu?

---

**Toplam değişiklik: Minimum 2-3 satır, maksimum 10-15 satır**

