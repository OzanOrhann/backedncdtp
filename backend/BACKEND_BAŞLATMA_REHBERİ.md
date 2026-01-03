# 🚀 BACKEND BAŞLATMA VE KURULUM REHBERİ

## 📋 İçindekiler

1. [Kurulum](#kurulum)
2. [Başlatma](#başlatma)
3. [Yapılandırma](#yapılandırma)
4. [Veritabanı (JSON)](#veritabanı-json)
5. [Sorun Giderme](#sorun-giderme)

---

## 📦 KURULUM

### 1. Node.js Kurulumu

**Windows:**
- [Node.js](https://nodejs.org/) sitesinden LTS versiyonunu indirin
- Kurulumu tamamlayın
- Terminal'de kontrol edin:
  ```bash
  node --version
  npm --version
  ```

**Mac/Linux:**
```bash
# Homebrew ile (Mac)
brew install node

# veya direkt indirin: https://nodejs.org/
```

### 2. Proje Klasörüne Gidin

```bash
cd backend
```

### 3. Paketleri Yükleyin

```bash
npm install
```

**Beklenen çıktı:**
```
added 150 packages in 30s
```

**Not:** JSON database kullanılıyor, ekstra kurulum gerekmez.

---

## 🚀 BAŞLATMA

### Yöntem 1: Normal Başlatma

```bash
npm start
```

### Yöntem 2: Development Mode (Otomatik Yeniden Başlatma)

```bash
npm run dev
```

**Beklenen çıktı:**
```
============================================================
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://[YOUR_IP]:3000
⏰  Zaman: 2024-01-15 14:30:00
============================================================

✅  Server hazır, cihaz bağlantıları bekleniyor...
```

---

## ⚙️ YAPILANDIRMA

### 1. Port Ayarlama

`.env` dosyası oluşturun (backend klasöründe):

```env
PORT=3000
NODE_ENV=development
```

**Veya direkt kodda değiştirin:**
`server.js` dosyasında:
```javascript
const PORT = process.env.PORT || 3000; // Burayı değiştirin
```

### 2. IP Adresini Bulma

**Windows:**
```bash
ipconfig
# "IPv4 Address" satırına bakın (örn: 192.168.1.100)
```

**Mac/Linux:**
```bash
ifconfig
# veya
hostname -I
```

**ÖNEMLİ:** Bu IP adresini frontend'de kullanacaksınız!

### 3. Firewall Ayarları

**Windows:**
1. Windows Defender Firewall → Gelişmiş Ayarlar
2. Gelen Kurallar → Yeni Kural
3. Port → TCP → 3000 → İzin Ver

**Mac:**
```bash
# Terminal'de
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

**Linux:**
```bash
sudo ufw allow 3000
```

---

## ✅ SERVER KONTROLÜ

### 1. Server Çalışıyor mu?

Tarayıcıda açın:
```
http://localhost:3000
```

**Beklenen çıktı:**
```json
{
  "message": "🏥 ÇDTP Backend Server",
  "version": "2.0.0",
  "status": "online",
  "connectedDevices": 0,
  "activePairs": 0
}
```

### 2. Health Check

```
http://localhost:3000/health
```

**Beklenen çıktı:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "uptime": 120.5,
  "connectedDevices": 0
}
```

---

## 📱 İKİ TELEFON BAĞLANTISI

### Adım 1: Backend'i Başlatın

```bash
cd backend
npm start
```

### Adım 2: IP Adresini Not Edin

```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

Örnek: `192.168.1.100`

### Adım 3: Frontend'de Backend URL'ini Ayarlayın

`backend/frontend-integration.js` dosyasında:

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

### Adım 4: İki Telefonu Bağlayın

**Telefon 1 (PATIENT):**
```javascript
connectToBackend('patient', { deviceName: 'Hasta Telefon' });
```

**Telefon 2 (MONITOR):**
```javascript
connectToBackend('monitor', { deviceName: 'Monitör Telefon' });
```

### Adım 5: Cihazları Eşleştirin

**Monitör telefonundan:**
```javascript
pairDevices(patientDeviceId, monitorDeviceId);
```

---

## 🔄 VERİ AKIŞI

### Telefon 1 (PATIENT) → Backend → Telefon 2 (MONITOR)

```
1. Bileklik → Bluetooth → Telefon 1
2. Telefon 1 → WebSocket → Backend
3. Backend → Database (JSON) → Kaydet
4. Backend → WebSocket → Telefon 2
5. Telefon 2 → UI'da Göster
```

### Telefon 2 (MONITOR) → Backend → Telefon 1 (PATIENT)

```
1. Telefon 2 → Eşik Değerleri → WebSocket → Backend
2. Backend → Database (JSON) → Kaydet
3. Backend → WebSocket → Telefon 1
4. Telefon 1 → Eşik Değerlerini Güncelle
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

- ✅ **JSON** - En basit ve sorunsuz çözüm
- ✅ **Dosya tabanlı** - Kurulum gerektirmez
- ✅ **Hızlı** - Küçük veriler için yeterli
- ✅ **Kolay** - Dosyaları açıp okuyabilirsiniz
- ✅ **Otomatik** - Backend kendisi oluşturur
- ✅ **Temizlik** - 30 günden eski veriler otomatik silinir

### Veri Yapısı

**sensor-data.json:**
```json
{
  "device_123": [
    {
      "heartRate": 75,
      "accelX": 0.1,
      "accelY": 0.2,
      "accelZ": 9.8,
      "movement": "active",
      "battery": 85,
      "timestamp": 1234567890,
      "savedAt": 1234567890
    }
  ]
}
```

**alarms.json:**
```json
{
  "device_123": [
    {
      "id": "alarm_123",
      "type": "fall",
      "message": "Düşme tespit edildi!",
      "timestamp": 1234567890,
      "acknowledged": false,
      "savedAt": 1234567890
    }
  ]
}
```

**thresholds.json:**
```json
{
  "device_123": {
    "minHeartRate": 40,
    "maxHeartRate": 120,
    "inactivityMinutes": 5,
    "fallThreshold": 2.5,
    "updatedAt": 1234567890
  }
}
```

### Veri Formatını Değiştirme

`backend/data-format.js` dosyasını düzenleyin:

```javascript
function parseWearableData(rawData) {
  // Bileklikten gelen veri formatını buraya yazın
  return {
    heartRate: rawData.hr || null,
    accelX: rawData.ax || null,
    // ...
  };
}
```

**Not:** JSON formatı değişmez, sadece gelen veri formatı değişir.

---

## 🔌 WEBSOCKET EVENT'LERİ

### Cihaz Kaydı

**Gönder:**
```javascript
socket.emit('register', {
  deviceId: 'device_123',
  deviceType: 'patient', // veya 'monitor'
  deviceInfo: { /* opsiyonel */ }
});
```

**Al:**
```javascript
socket.on('registered', (data) => {
  console.log('Kayıt başarılı:', data);
  // data.thresholds içinde eşik değerleri var
});
```

### Sensör Verisi Gönderme (PATIENT)

**Gönder:**
```javascript
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

**Al (MONITOR):**
```javascript
socket.on('receive_sensor_data', (data) => {
  console.log('Sensör verisi:', data.sensorData);
  console.log('Gönderen:', data.fromDeviceId);
});
```

### Alarm Gönderme (PATIENT)

**Gönder:**
```javascript
socket.emit('send_alarm', {
  alarm: {
    id: 'alarm_123',
    type: 'fall',
    message: 'Düşme tespit edildi!',
    timestamp: Date.now(),
    acknowledged: false
  }
});
```

**Al (MONITOR):**
```javascript
socket.on('receive_alarm', (data) => {
  console.log('ALARM:', data.alarm);
  // Bildirim göster
});
```

### Eşik Değerleri Gönderme (MONITOR → PATIENT)

**Gönder:**
```javascript
socket.emit('send_thresholds', {
  targetDeviceId: 'device_patient_123',
  thresholds: {
    minHeartRate: 40,
    maxHeartRate: 120,
    inactivityMinutes: 5,
    fallThreshold: 2.5
  }
});
```

**Al (PATIENT):**
```javascript
socket.on('receive_thresholds', (data) => {
  console.log('Eşik değerleri güncellendi:', data.thresholds);
  // setThresholds(data.thresholds) çağır
});
```

### Cihaz Eşleştirme

**Gönder:**
```javascript
socket.emit('pair_devices', {
  patientId: 'device_patient_123',
  monitorId: 'device_monitor_456'
});
```

**Al:**
```javascript
socket.on('paired', (data) => {
  console.log('Eşleştirildi:', data.pairedWith);
  console.log('Rol:', data.role); // 'patient' veya 'monitor'
});
```

---

## 🐛 SORUN GİDERME

### Port Zaten Kullanımda

**Hata:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Çözüm:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMARASI] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Veya farklı port kullanın
PORT=3001 npm start
```

### Backend'e Bağlanamıyor

**Kontrol Listesi:**
- [ ] Backend çalışıyor mu? (`npm start`)
- [ ] IP adresi doğru mu? (`ipconfig` / `ifconfig`)
- [ ] Aynı WiFi ağında mısınız?
- [ ] Firewall kapalı mı?
- [ ] Port açık mı? (3000)

### Veriler Database'e Kaydedilmiyor

**Kontrol:**
```bash
# Database klasörünü kontrol edin
ls backend/database/

# Dosyalar oluştu mu?
cat backend/database/sensor-data.json
```

**Sorun:** Dosyalar oluşmuyorsa:
- `backend/database/` klasörü yazılabilir mi?
- Disk dolu mu?
- Backend çalışıyor mu? (`npm start`)

### WebSocket Bağlantısı Kopuyor

**Çözüm:**
- `pingTimeout` ve `pingInterval` ayarlarını kontrol edin
- Heartbeat mekanizması çalışıyor mu?
- Network bağlantısı stabil mi?

---

## 📊 MONİTÖRLEME

### Bağlı Cihazları Görüntüleme

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
      "deviceId": "device_123",
      "deviceType": "patient",
      "connected": true,
      "lastSeen": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

### Sensör Verisi Geçmişi

```
GET http://localhost:3000/api/sensor-data/device_123?limit=50
```

**JSON'da:**
```bash
# Dosyayı açıp kontrol edin
cat backend/database/sensor-data.json
```

### Alarm Geçmişi

```
GET http://localhost:3000/api/alarms/device_123?limit=20
```

**JSON'da:**
```bash
# Dosyayı açıp kontrol edin
cat backend/database/alarms.json
```

---

## 🔒 GÜVENLİK NOTLARI

⚠️ **ÖNEMLİ:**
- Bu backend **development** için hazırlanmıştır
- Production için:
  - Authentication ekleyin
  - HTTPS kullanın
  - Rate limiting ekleyin
  - Input validation güçlendirin

---

## 📝 ÖZET

1. **Kurulum:** `npm install`
2. **Başlatma:** `npm start`
3. **IP Bul:** `ipconfig` / `ifconfig`
4. **Frontend'e IP'yi Ver:** `frontend-integration.js` içinde
5. **Test Et:** Tarayıcıda `http://localhost:3000`

---

## ✅ HAZIR!

Backend çalışıyor ve iki telefonu bağlamaya hazır! 🎉

**Sonraki Adım:** Frontend'de `frontend-integration.js` dosyasını kullanarak backend'e bağlanın.

---

## 📞 DESTEK

Sorun yaşarsanız:
1. Console loglarını kontrol edin
2. `backend/database/` klasörünü kontrol edin
3. Network bağlantısını kontrol edin
4. Firewall ayarlarını kontrol edin

---

**Backend Versiyonu:** 2.0.0  
**Son Güncelleme:** 2024-01-15

