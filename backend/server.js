const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Veri formatı modülü
const {
  parseWearableData,
  validateThresholds,
  createAlarm,
  DEFAULT_THRESHOLDS
} = require('./data-format');

// Database modülü
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors());
app.use(express.json());

// Port
const PORT = process.env.PORT || 3000;

// ============================================
// IN-MEMORY DATABASE (Basit ve hızlı)
// ============================================

// Bağlı cihazlar
const connectedDevices = new Map();
// deviceId -> { socketId, deviceType, deviceInfo, lastSeen }

// Cihaz çiftleri (hangi hasta hangi monitöre bağlı)
const devicePairs = new Map();
// patientId -> monitorId

// Sensör verileri geçmişi (son 100 veri)
const sensorDataHistory = new Map();
// deviceId -> [{sensorData, timestamp}, ...]

// Alarm geçmişi
const alarmHistory = new Map();
// deviceId -> [{alarm, timestamp}, ...]

// Eşik değerleri
const thresholds = new Map();
// deviceId -> {minHeartRate, maxHeartRate, inactivityMinutes, fallThreshold}

// ============================================
// CIHAZ TÜRLERİ
// ============================================

const DEVICE_TYPES = {
  MONITOR: 'monitor',  // Takip eden (yakın, bakıcı)
  PATIENT: 'patient'   // Takip edilen (hasta, yaşlı)
};

// ============================================
// API ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({ 
    message: '🏥 ÇDTP Backend Server',
    version: '2.0.0',
    status: 'online',
    connectedDevices: connectedDevices.size,
    activePairs: devicePairs.size,
    endpoints: {
      health: 'GET /health',
      devices: 'GET /api/devices',
      sensorData: 'GET /api/sensor-data/:deviceId',
      alarms: 'GET /api/alarms/:deviceId',
      thresholds: 'GET /api/thresholds/:deviceId',
      pairs: 'GET /api/pairs'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connectedDevices: connectedDevices.size
  });
});

app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.entries()).map(([deviceId, device]) => ({
    deviceId,
    deviceType: device.deviceType,
    deviceInfo: device.deviceInfo,
    lastSeen: new Date(device.lastSeen).toISOString(),
    connected: true
  }));
  
  res.json({ 
    success: true,
    count: devices.length,
    devices 
  });
});

app.get('/api/sensor-data/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;
    
    // Database'den oku
    const dbData = db.getSensorData(deviceId, parseInt(limit));
    
    // Format: [{sensorData, timestamp}, ...]
    // dbData zaten doğru formatta (JSON'dan direkt geliyor)
    const formattedData = dbData.map(row => ({
      sensorData: {
        heartRate: row.heartRate,
        accelX: row.accelX,
        accelY: row.accelY,
        accelZ: row.accelZ,
        movement: row.movement,
        battery: row.battery,
        timestamp: row.timestamp
      },
      timestamp: row.timestamp || row.savedAt
    }));
    
    res.json({
      success: true,
      deviceId,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error('API hatası (sensor-data):', error);
    res.status(500).json({
      success: false,
      error: 'Veri okunamadı'
    });
  }
});

app.get('/api/alarms/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50 } = req.query;
    
    // Database'den oku
    const dbAlarms = db.getAlarms(deviceId, parseInt(limit));
    
    // Format: [{alarm, timestamp}, ...]
    // dbAlarms zaten doğru formatta (JSON'dan direkt geliyor)
    const formattedAlarms = dbAlarms.map(row => ({
      alarm: {
        id: row.id,
        type: row.type,
        message: row.message,
        timestamp: row.timestamp,
        acknowledged: row.acknowledged || false
      },
      timestamp: row.timestamp || row.savedAt
    }));
    
    res.json({
      success: true,
      deviceId,
      count: formattedAlarms.length,
      alarms: formattedAlarms
    });
  } catch (error) {
    console.error('API hatası (alarms):', error);
    res.status(500).json({
      success: false,
      error: 'Alarmlar okunamadı'
    });
  }
});

app.get('/api/thresholds/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // Önce in-memory'den kontrol et (daha hızlı)
    let deviceThresholds = thresholds.get(deviceId);
    
    // Yoksa database'den oku
    if (!deviceThresholds) {
      deviceThresholds = db.getThresholds(deviceId);
      if (deviceThresholds) {
        thresholds.set(deviceId, deviceThresholds);
      }
    }
    
    res.json({
      success: true,
      deviceId,
      thresholds: deviceThresholds || null
    });
  } catch (error) {
    console.error('API hatası (thresholds):', error);
    res.status(500).json({
      success: false,
      error: 'Eşik değerleri okunamadı'
    });
  }
});

app.get('/api/pairs', (req, res) => {
  const pairs = Array.from(devicePairs.entries()).map(([patientId, monitorId]) => ({
    patientId,
    monitorId,
    patientConnected: connectedDevices.has(patientId),
    monitorConnected: connectedDevices.has(monitorId)
  }));
  
  res.json({
    success: true,
    count: pairs.length,
    pairs
  });
});

// ============================================
// WEBSOCKET BAĞLANTI YÖNETİMİ
// ============================================

io.on('connection', (socket) => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ YENİ CİHAZ BAĞLANDI');
  console.log('Socket ID:', socket.id);
  console.log('IP:', socket.handshake.address);
  console.log('Zaman:', new Date().toLocaleString('tr-TR'));
  console.log('='.repeat(50) + '\n');

  // ============================================
  // 1. CİHAZ KAYDI
  // ============================================
  
  socket.on('register', (data) => {
    try {
      const { deviceId, deviceType, deviceInfo } = data;
      
      if (!deviceId || !Object.values(DEVICE_TYPES).includes(deviceType)) {
        socket.emit('error', { message: 'Geçersiz cihaz bilgisi' });
        console.error('❌ Geçersiz kayıt denemesi:', data);
        return;
      }

      connectedDevices.set(deviceId, {
        socketId: socket.id,
        deviceType,
        deviceInfo: deviceInfo || {},
        lastSeen: Date.now()
      });

      // Varsayılan eşik değerleri ayarla (eğer yoksa)
      if (!thresholds.has(deviceId)) {
        thresholds.set(deviceId, {
          minHeartRate: 40,
          maxHeartRate: 120,
          inactivityMinutes: 5,
          fallThreshold: 2.5
        });
      }

      console.log('\n📱 CİHAZ KAYDEDİLDİ');
      console.log('Device ID:', deviceId);
      console.log('Cihaz Türü:', deviceType);
      console.log('Socket ID:', socket.id);
      console.log('Toplam Cihaz:', connectedDevices.size);
      console.log('');

      socket.emit('registered', { 
        success: true,
        deviceId, 
        deviceType,
        thresholds: thresholds.get(deviceId)
      });

      // Tüm cihazlara güncelleme gönder
      io.emit('devices_updated', {
        totalDevices: connectedDevices.size,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      socket.emit('error', { message: 'Kayıt işlemi başarısız' });
    }
  });

  // ============================================
  // 2. CİHAZ EŞLEŞTİRME (Monitör + Hasta)
  // ============================================
  
  socket.on('pair_devices', (data) => {
    try {
      const { patientId, monitorId } = data;
      
      if (!patientId || !monitorId) {
        socket.emit('error', { message: 'Geçersiz eşleştirme bilgisi' });
        return;
      }
      
      // Cihazların bağlı olup olmadığını kontrol et
      const patientDevice = connectedDevices.get(patientId);
      const monitorDevice = connectedDevices.get(monitorId);
      
      if (!patientDevice) {
        socket.emit('error', { message: 'Hasta cihazı bağlı değil' });
        return;
      }
      
      if (!monitorDevice) {
        socket.emit('error', { message: 'Monitör cihazı bağlı değil' });
        return;
      }

      devicePairs.set(patientId, monitorId);
      
      console.log('\n🔗 CİHAZLAR EŞLEŞTİRİLDİ');
      console.log('Hasta ID:', patientId);
      console.log('Monitör ID:', monitorId);
      console.log('');

      // Her iki cihaza da bildir (zaten yukarıda aldık)
      io.to(patientDevice.socketId).emit('paired', {
        success: true,
        pairedWith: monitorId,
        role: 'patient'
      });

      io.to(monitorDevice.socketId).emit('paired', {
        success: true,
        pairedWith: patientId,
        role: 'monitor'
      });

      socket.emit('pair_success', { patientId, monitorId });

    } catch (error) {
      console.error('❌ Eşleştirme hatası:', error);
      socket.emit('error', { message: 'Eşleştirme başarısız' });
    }
  });

  // ============================================
  // 3. EŞİK DEĞERLERİ GÖNDERME (Monitor -> Patient)
  // ============================================
  
  socket.on('send_thresholds', (data) => {
    try {
      const { targetDeviceId, thresholds: newThresholds } = data;
      
      if (!targetDeviceId) {
        console.error('❌ Hedef cihaz ID belirtilmedi');
        socket.emit('error', { message: 'Hedef cihaz ID gerekli' });
        return;
      }
      
      console.log('\n📊 EŞİK DEĞERLERİ GÖNDERİLİYOR');
      console.log('Hedef:', targetDeviceId);
      console.log('Eşik Değerleri:', newThresholds);

      // Eşik değerlerini kaydet
      if (newThresholds) {
        const validatedThresholds = {
          minHeartRate: newThresholds.minHeartRate || 40,
          maxHeartRate: newThresholds.maxHeartRate || 120,
          inactivityMinutes: newThresholds.inactivityMinutes || 5,
          fallThreshold: newThresholds.fallThreshold || 2.5
        };
        thresholds.set(targetDeviceId, validatedThresholds);
        
        // Database'e kaydet
        db.saveThresholds(targetDeviceId, validatedThresholds);
      }

      const targetDevice = connectedDevices.get(targetDeviceId);
      
      if (targetDevice) {
        io.to(targetDevice.socketId).emit('receive_thresholds', {
          thresholds: thresholds.get(targetDeviceId),
          fromDeviceId: getDeviceIdBySocketId(socket.id),
          timestamp: Date.now()
        });
        
        socket.emit('thresholds_sent', { 
          success: true, 
          targetDeviceId 
        });
        
        console.log('✅ Eşik değerleri iletildi\n');
      } else {
        socket.emit('error', { message: 'Hedef cihaz bulunamadı' });
        console.log('❌ Hedef cihaz bulunamadı\n');
      }

    } catch (error) {
      console.error('❌ Eşik değerleri gönderme hatası:', error);
      socket.emit('error', { message: 'Eşik değerleri gönderilemedi' });
    }
  });

  // ============================================
  // 4. SENSÖR VERİLERİNİ GÖNDERME (Patient -> Monitor)
  // ============================================
  
  socket.on('send_sensor_data', (data) => {
    try {
      const { sensorData } = data;
      const fromDeviceId = getDeviceIdBySocketId(socket.id);
      
      if (!fromDeviceId) {
        console.error('❌ Cihaz ID bulunamadı (kayıtlı değil)');
        socket.emit('error', { message: 'Cihaz kayıtlı değil' });
        return;
      }
      
      // Database'e kaydet
      db.saveSensorData(fromDeviceId, sensorData);
      
      // Sensör verisini kaydet
      if (!sensorDataHistory.has(fromDeviceId)) {
        sensorDataHistory.set(fromDeviceId, []);
      }
      const history = sensorDataHistory.get(fromDeviceId);
      history.unshift({ sensorData, timestamp: Date.now() });
      
      // Son 100 veriyi tut
      if (history.length > 100) {
        history.pop();
      }

      console.log('\n📡 SENSÖR VERİSİ ALINDI');
      console.log('Cihaz:', fromDeviceId);
      console.log('Kalp Atışı:', sensorData.heartRate, 'BPM');
      console.log('Hareket:', sensorData.movement);
      console.log('Batarya:', sensorData.battery, '%');
      console.log('');

      // Eşleştirilmiş monitöre gönder
      const monitorId = devicePairs.get(fromDeviceId);
      if (monitorId) {
        const monitorDevice = connectedDevices.get(monitorId);
        if (monitorDevice) {
          io.to(monitorDevice.socketId).emit('receive_sensor_data', {
            sensorData,
            fromDeviceId,
            timestamp: Date.now()
          });
        }
      }

      // Tüm monitörlere de yayınla (eşleştirme yoksa)
      connectedDevices.forEach((device, deviceId) => {
        if (device.deviceType === DEVICE_TYPES.MONITOR && deviceId !== monitorId) {
          io.to(device.socketId).emit('receive_sensor_data', {
            sensorData,
            fromDeviceId,
            timestamp: Date.now()
          });
        }
      });

      socket.emit('sensor_data_sent', { success: true });

    } catch (error) {
      console.error('❌ Sensör verisi gönderme hatası:', error);
      socket.emit('error', { message: 'Sensör verisi gönderilemedi' });
    }
  });

  // ============================================
  // 5. ALARM GÖNDERME (Patient -> Monitor)
  // ============================================
  
  socket.on('send_alarm', (data) => {
    try {
      const { alarm, targetDeviceId } = data; // targetDeviceId: MONITOR'dan PATIENT'a gönderim için
      const fromDeviceId = getDeviceIdBySocketId(socket.id);
      
      if (!fromDeviceId) {
        console.error('❌ Cihaz ID bulunamadı (kayıtlı değil)');
        socket.emit('error', { message: 'Cihaz kayıtlı değil' });
        return;
      }
      
      // Database'e kaydet
      db.saveAlarm(fromDeviceId, alarm);
      
      // Alarm geçmişine kaydet
      if (!alarmHistory.has(fromDeviceId)) {
        alarmHistory.set(fromDeviceId, []);
      }
      const history = alarmHistory.get(fromDeviceId);
      history.unshift({ alarm, timestamp: Date.now() });
      
      // Son 50 alarmı tut
      if (history.length > 50) {
        history.pop();
      }

      console.log('\n🚨 ALARM ALINDI');
      console.log('Cihaz:', fromDeviceId);
      console.log('Alarm Tipi:', alarm.type);
      console.log('Mesaj:', alarm.message);
      console.log('Zaman:', new Date(alarm.timestamp).toLocaleString('tr-TR'));
      console.log('');

      // Eğer targetDeviceId varsa (MONITOR'dan PATIENT'a gönderim)
      if (targetDeviceId) {
        const targetDevice = connectedDevices.get(targetDeviceId);
        if (targetDevice) {
          io.to(targetDevice.socketId).emit('receive_alarm', {
            alarm,
            fromDeviceId,
            timestamp: Date.now()
          });
          console.log(`✅ Alarm ${targetDeviceId} cihazına iletildi (MONITOR → PATIENT)`);
        } else {
          console.error(`❌ Hedef cihaz bulunamadı: ${targetDeviceId}`);
        }
      } else {
        // PATIENT'tan MONITOR'a gönderim (normal akış)
        // Eşleştirilmiş monitöre gönder
        const monitorId = devicePairs.get(fromDeviceId);
        if (monitorId) {
          const monitorDevice = connectedDevices.get(monitorId);
          if (monitorDevice) {
            io.to(monitorDevice.socketId).emit('receive_alarm', {
              alarm,
              fromDeviceId,
              timestamp: Date.now()
            });
            console.log(`✅ Alarm ${monitorId} monitörüne iletildi (PATIENT → MONITOR)`);
          }
        } else {
          // Eşleştirilmemiş ise tüm monitörlere yayınla
          connectedDevices.forEach((device, deviceId) => {
            if (device.deviceType === DEVICE_TYPES.MONITOR) {
              io.to(device.socketId).emit('receive_alarm', {
                alarm,
                fromDeviceId,
                timestamp: Date.now()
              });
            }
          });
          console.log('✅ Alarm tüm monitörlere iletildi');
        }
      }

      socket.emit('alarm_sent', { success: true });
      console.log('');

    } catch (error) {
      console.error('❌ Alarm gönderme hatası:', error);
      socket.emit('error', { message: 'Alarm gönderilemedi' });
    }
  });

  // ============================================
  // 6. ALARM ONAYLAMA (Monitor -> Patient)
  // ============================================
  
  socket.on('acknowledge_alarm', (data) => {
    try {
      const { alarmId, targetDeviceId } = data;
      const fromDeviceId = getDeviceIdBySocketId(socket.id);
      
      console.log('\n✅ ALARM ONAYLANDI');
      console.log('Alarm ID:', alarmId);
      console.log('Onaylayan:', fromDeviceId);
      console.log('Hedef:', targetDeviceId);
      console.log('');

      const targetDevice = connectedDevices.get(targetDeviceId);
      if (targetDevice) {
        io.to(targetDevice.socketId).emit('alarm_acknowledged', {
          alarmId,
          acknowledgedBy: fromDeviceId,
          timestamp: Date.now()
        });
      }

      socket.emit('acknowledgement_sent', { success: true, alarmId });

    } catch (error) {
      console.error('❌ Alarm onaylama hatası:', error);
      socket.emit('error', { message: 'Alarm onaylanamadı' });
    }
  });

  // ============================================
  // 7. MANUEL MESAJ GÖNDERME
  // ============================================
  
  socket.on('send_message', (data) => {
    try {
      const { targetDeviceId, message } = data;
      const fromDeviceId = getDeviceIdBySocketId(socket.id);
      
      const targetDevice = connectedDevices.get(targetDeviceId);
      if (targetDevice) {
        io.to(targetDevice.socketId).emit('receive_message', {
          message,
          fromDeviceId,
          timestamp: Date.now()
        });
        socket.emit('message_sent', { success: true });
        
        console.log(`📨 Mesaj gönderildi: ${fromDeviceId} -> ${targetDeviceId}`);
      } else {
        socket.emit('error', { message: 'Hedef cihaz bulunamadı' });
      }

    } catch (error) {
      console.error('❌ Mesaj gönderme hatası:', error);
      socket.emit('error', { message: 'Mesaj gönderilemedi' });
    }
  });

  // ============================================
  // 8. HEARTBEAT (Cihaz aktiflik kontrolü)
  // ============================================
  
  socket.on('heartbeat', (data) => {
    const deviceId = getDeviceIdBySocketId(socket.id);
    if (deviceId) {
      const device = connectedDevices.get(deviceId);
      if (device) {
        device.lastSeen = Date.now();
        connectedDevices.set(deviceId, device);
      }
    }
  });

  // ============================================
  // 9. BAĞLANTI KOPMA
  // ============================================
  
  socket.on('disconnect', () => {
    console.log('\n' + '='.repeat(50));
    console.log('❌ CİHAZ BAĞLANTISI KESİLDİ');
    console.log('Socket ID:', socket.id);
    console.log('Zaman:', new Date().toLocaleString('tr-TR'));
    
    // Cihazı listeden kaldır
    const deviceId = getDeviceIdBySocketId(socket.id);
    if (deviceId) {
      connectedDevices.delete(deviceId);
      console.log('Cihaz ID:', deviceId);
      console.log('Kalan Cihaz:', connectedDevices.size);
      
      // Eşleştirmeleri temizle
      devicePairs.delete(deviceId);
      
      // Tüm cihazlara güncelleme gönder
      io.emit('devices_updated', {
        totalDevices: connectedDevices.size,
        timestamp: Date.now()
      });
    }
    
    console.log('='.repeat(50) + '\n');
  });
});

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

function getDeviceIdBySocketId(socketId) {
  for (const [deviceId, device] of connectedDevices.entries()) {
    if (device.socketId === socketId) {
      return deviceId;
    }
  }
  return null;
}

// ============================================
// SERVER BAŞLATMA
// ============================================

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🏥  ÇDTP BACKEND SERVER BAŞLATILDI');
  console.log('='.repeat(60));
  console.log(`📡  Port: ${PORT}`);
  console.log(`🌐  Local: http://localhost:${PORT}`);
  console.log(`🌐  Network: http://[YOUR_IP]:${PORT}`);
  console.log(`⏰  Zaman: ${new Date().toLocaleString('tr-TR')}`);
  console.log('='.repeat(60));
  console.log('\n✅  Server hazır, cihaz bağlantıları bekleniyor...\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM sinyali alındı, server kapatılıyor...');
  server.close(() => {
    console.log('✅  Server kapatıldı');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT sinyali alındı, server kapatılıyor...');
  server.close(() => {
    console.log('✅  Server kapatıldı');
    process.exit(0);
  });
});
