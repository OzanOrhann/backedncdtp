// ============================================
// ÇDTP Frontend - Backend Entegrasyon Modülü
// ============================================
// Bu modülü App.tsx içine import edin
// Frontend mevcut interface'leri ile %100 uyumlu

import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// alarm-detection ES6 modules kullanıyor (React Native için uyumlu)
import { detectAlarms } from './alarm-detection';

// ============================================
// YAPILANDIRMA
// ============================================

// Backend server URL'i - Otomatik algılama veya manuel ayar
// ⚠️ ÖNEMLİ: React Native fiziksel cihazda veya emülatörde localhost kullanamaz!

// Seçenek 1: AsyncStorage'dan oku (önerilen - otomatik)
// Seçenek 2: Manuel IP adresi yazın
// Seçenek 3: Tunnel URL kullanın (ngrok, cloudflare tunnel, vs.)

// Varsayılan değer (AsyncStorage'da yoksa kullanılır)
// ⚠️ Cloud deployment için Railway/Render/Fly.io URL'inizi yazın
// Örnek: 'https://your-project.railway.app'
// Local development için: 'http://192.168.1.30:3000'
const DEFAULT_BACKEND_URL = 
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_BACKEND_URL) ||
  'http://192.168.1.30:3000'; // ⚠️ Cloud URL veya local IP yazın

// Tunnel URL kullanmak için (ngrok, cloudflare tunnel, vs.)
// const TUNNEL_URL = 'https://your-tunnel-url.ngrok.io'; // Uncomment edin ve URL'i yazın

// Otomatik IP algılama için AsyncStorage'dan oku
let BACKEND_URL = DEFAULT_BACKEND_URL;

// AsyncStorage'dan backend URL'ini oku
AsyncStorage.getItem('backend_url').then((savedUrl) => {
  if (savedUrl) {
    BACKEND_URL = savedUrl;
    console.log('✅ Backend URL AsyncStorage\'dan yüklendi:', BACKEND_URL);
  } else {
    console.log('💡 Backend URL ayarlanmadı, varsayılan kullanılıyor:', BACKEND_URL);
    console.log('💡 IP adresini ayarlamak için: setBackendUrl("http://YOUR_IP:3000")');
  }
}).catch((error) => {
  console.warn('⚠️ AsyncStorage okuma hatası, varsayılan URL kullanılıyor:', error);
});

// Backend URL'ini dinamik olarak ayarlama fonksiyonu
export const setBackendUrl = async (url) => {
  try {
    BACKEND_URL = url;
    await AsyncStorage.setItem('backend_url', url);
    console.log('✅ Backend URL güncellendi:', url);
    
    // Eğer bağlıysa yeniden bağlan
    if (socket && socket.connected) {
      socket.disconnect();
      socket = null;
      console.log('💡 Yeniden bağlanmak için connectToBackend() çağırın');
    }
  } catch (error) {
    console.error('❌ Backend URL ayarlama hatası:', error);
  }
};

// Backend URL'ini alma fonksiyonu
export const getBackendUrl = () => {
  return BACKEND_URL;
};

// Socket instance
let socket = null;
let deviceId = null;
let deviceType = null;
let activeHeartbeatInterval = null;
let onThresholdsReceivedCallback = null;
let lastActivityTime = null; // MONITOR için son aktivite zamanı
let currentThresholds = null; // MONITOR için eşik değerleri

// ============================================
// 1. BACKEND BAĞLANTISI
// ============================================

/**
 * Backend'e bağlan ve cihazı kaydet
 * @param {string} type - 'monitor' veya 'patient'
 * @param {object} deviceInfo - Opsiyonel cihaz bilgileri
 * @returns {Promise<{socket, deviceId}>}
 */
export const connectToBackend = async (type, deviceInfo = {}) => {
  try {
    // Cihaz ID'si oluştur veya kayıtlı olanı kullan
    deviceId = await AsyncStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      await AsyncStorage.setItem('deviceId', deviceId);
    }

    deviceType = type;

    // Socket bağlantısı oluştur
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000
    });

    // Bağlantı olayları
    socket.on('connect', () => {
      console.log('✅ Backend\'e bağlandı');
      console.log('Device ID:', deviceId);
      console.log('Device Type:', deviceType);
      
      // Cihazı kaydet
      socket.emit('register', {
        deviceId,
        deviceType: type,
        deviceInfo: {
          ...deviceInfo,
          platform: Platform.OS,
          timestamp: Date.now()
        }
      });
    });

    socket.on('registered', (data) => {
      console.log('📱 Cihaz kaydedildi:', data);
      
      // Eğer backend'den eşik değerleri geldiyse callback çağır
      if (data.thresholds && onThresholdsReceivedCallback) {
        onThresholdsReceivedCallback(data.thresholds);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Backend bağlantısı kesildi');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Yeniden bağlanıldı (deneme:', attemptNumber, ')');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket hatası:', error);
    });

    // Heartbeat başlat (her 30 saniyede bir)
    const heartbeatInterval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('heartbeat', { timestamp: Date.now() });
      }
    }, 30000);

    // Temizleme için module-level değişkene kaydet
    activeHeartbeatInterval = heartbeatInterval;

    return { socket, deviceId, deviceType };
  } catch (error) {
    console.error('Bağlantı hatası:', error);
    throw error;
  }
};

// ============================================
// 2. CIHAZ EŞLEŞTIRME
// ============================================

/**
 * İki cihazı eşleştir (patient + monitor)
 * @param {string} patientId - Hasta cihaz ID
 * @param {string} monitorId - Monitör cihaz ID
 */
export const pairDevices = (patientId, monitorId) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  socket.emit('pair_devices', { patientId, monitorId });

  socket.once('pair_success', (data) => {
    console.log('✅ Cihazlar eşleştirildi:', data);
  });
};

/**
 * Eşleştirme bildirimini dinle
 * @param {Function} callback - (pairedWith, role) => {}
 */
export const onDevicePaired = (callback) => {
  if (!socket) return;

  socket.on('paired', (data) => {
    console.log('🔗 Cihaz eşleştirildi:', data);
    callback(data.pairedWith, data.role);
  });
};

// ============================================
// 3. EŞİK DEĞERLERİ (Monitor -> Patient)
// ============================================

/**
 * Eşik değerlerini gönder (MONITOR cihazı için)
 * Frontend'deki Thresholds interface ile uyumlu:
 * { minHeartRate, maxHeartRate, inactivityMinutes, fallThreshold }
 */
export const sendThresholds = (targetDeviceId, thresholds) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  socket.emit('send_thresholds', {
    targetDeviceId,
    thresholds: {
      minHeartRate: thresholds.minHeartRate,
      maxHeartRate: thresholds.maxHeartRate,
      inactivityMinutes: thresholds.inactivityMinutes,
      fallThreshold: thresholds.fallThreshold
    }
  });

  socket.once('thresholds_sent', (data) => {
    console.log('✅ Eşik değerleri gönderildi:', data);
  });
};

/**
 * Eşik değerlerini dinle (PATIENT cihazı için)
 * @param {Function} callback - (thresholds) => {}
 * Frontend'deki onThresholdsChange ile direkt kullanılabilir
 */
export const onReceiveThresholds = (callback) => {
  if (!socket) return;

  // Module-level callback kaydet (registered event için)
  onThresholdsReceivedCallback = callback;

  socket.on('receive_thresholds', (data) => {
    console.log('📊 Eşik değerleri alındı:', data.thresholds);
    callback(data.thresholds);
  });
};

/**
 * MONITOR için eşik değerlerini ayarla (alarm tespiti için)
 * @param {object} thresholds - Eşik değerleri
 */
export const setMonitorThresholds = (thresholds) => {
  currentThresholds = thresholds;
  console.log('📊 MONITOR eşik değerleri ayarlandı:', thresholds);
};

/**
 * MONITOR için PATIENT cihaz ID'sini ayarla (alarm göndermek için)
 * @param {string} patientDeviceId - PATIENT cihaz ID'si
 */
export const setPatientDeviceId = (patientDeviceId) => {
  // Bu fonksiyon MONITOR'da kullanılacak
  // Eşleştirme sonrası PATIENT ID'sini kaydetmek için
  console.log('📱 PATIENT cihaz ID ayarlandı:', patientDeviceId);
};

// ============================================
// 4. SENSÖR VERİLERİ (Patient -> Monitor)
// ============================================

/**
 * Sensör verilerini gönder (PATIENT cihazı için)
 * Frontend'deki SensorData interface ile uyumlu
 */
export const sendSensorData = (sensorData) => {
  if (!socket || !socket.connected) {
    console.warn('Socket bağlı değil, sensör verisi gönderilemedi');
    return;
  }

  socket.emit('send_sensor_data', {
    sensorData: {
      heartRate: sensorData.heartRate,
      accelX: sensorData.accelX,
      accelY: sensorData.accelY,
      accelZ: sensorData.accelZ,
      movement: sensorData.movement,
      timestamp: sensorData.timestamp || Date.now(),
      battery: sensorData.battery
    }
  });
};

/**
 * Sensör verilerini dinle (MONITOR cihazı için)
 * @param {Function} callback - (sensorData, fromDeviceId) => {}
 * Frontend'deki setSensorData ile direkt kullanılabilir
 * 
 * MONITOR'da otomatik alarm tespiti yapar ve PATIENT'a gönderir
 */
export const onReceiveSensorData = (callback, options = {}) => {
  if (!socket) return;

  const {
    enableAutoAlarmDetection = false, // Otomatik alarm tespiti aktif mi?
    thresholds = null, // Eşik değerleri (MONITOR için)
    patientDeviceId = null, // PATIENT cihaz ID'si (alarm göndermek için)
    onAlarmDetected = null // Alarm tespit edildiğinde callback
  } = options;

  socket.on('receive_sensor_data', (data) => {
    console.log('📡 Sensör verisi alındı:', data.sensorData);
    const sensorData = data.sensorData;
    const fromDeviceId = data.fromDeviceId;

    // Callback'i çağır (UI güncellemesi için)
    callback(sensorData, fromDeviceId);

    // MONITOR'da otomatik alarm tespiti
    if (enableAutoAlarmDetection && thresholds && patientDeviceId) {
      // Son aktivite zamanını güncelle
      if (sensorData.movement === 'active') {
        lastActivityTime = Date.now();
      }

      // Alarm tespit et
      const detectedAlarms = detectAlarms(
        sensorData,
        thresholds,
        lastActivityTime
      );

      // Alarm tespit edildiyse PATIENT'a gönder
      if (detectedAlarms.length > 0) {
        console.log('🚨 MONITOR: Alarm tespit edildi:', detectedAlarms);
        
        detectedAlarms.forEach((alarm) => {
          // PATIENT'a alarm gönder
          sendAlarmToPatient(patientDeviceId, alarm);
          
          // Callback'i çağır (UI'da gösterilebilir)
          if (onAlarmDetected) {
            onAlarmDetected(alarm, fromDeviceId);
          }
        });
      }
    }
  });
};

/**
 * MONITOR'dan PATIENT'a alarm gönder
 * @param {string} patientDeviceId - PATIENT cihaz ID'si
 * @param {object} alarm - Alarm objesi
 */
const sendAlarmToPatient = (patientDeviceId, alarm) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  // Backend'e alarm gönder (PATIENT'a iletilecek)
  socket.emit('send_alarm', {
    alarm: {
      id: alarm.id,
      type: alarm.type,
      message: alarm.message,
      timestamp: alarm.timestamp,
      acknowledged: alarm.acknowledged
    },
    targetDeviceId: patientDeviceId // PATIENT'a gönder
  });

  console.log('✅ MONITOR → PATIENT: Alarm gönderildi:', alarm);
};

// ============================================
// 5. ALARMLAR (Patient -> Monitor)
// ============================================

/**
 * Alarm gönder (PATIENT cihazı için)
 * Frontend'deki Alarm interface ile uyumlu
 */
export const sendAlarm = (alarm) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  socket.emit('send_alarm', {
    alarm: {
      id: alarm.id,
      type: alarm.type, // 'fall' | 'inactivity' | 'low_heart_rate' | 'high_heart_rate' | 'manual'
      message: alarm.message,
      timestamp: alarm.timestamp,
      acknowledged: alarm.acknowledged
    }
  });

  socket.once('alarm_sent', (data) => {
    console.log('🚨 Alarm gönderildi:', data);
  });
};

/**
 * Alarmları dinle (MONITOR cihazı için)
 * @param {Function} callback - (alarm, fromDeviceId) => {}
 * Frontend'deki setAlarms ile direkt kullanılabilir:
 * onReceiveAlarm((alarm) => setAlarms(prev => [alarm, ...prev]))
 */
export const onReceiveAlarm = (callback) => {
  if (!socket) return;

  socket.on('receive_alarm', (data) => {
    console.log('🚨 ALARM ALINDI:', data.alarm);
    callback(data.alarm, data.fromDeviceId);
  });
};

/**
 * Alarm onayla (MONITOR cihazı için)
 */
export const acknowledgeAlarm = (alarmId, targetDeviceId) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  socket.emit('acknowledge_alarm', {
    alarmId,
    targetDeviceId
  });

  socket.once('acknowledgement_sent', (data) => {
    console.log('✅ Alarm onaylandı:', data);
  });
};

/**
 * Alarm onayını dinle (PATIENT cihazı için)
 */
export const onAlarmAcknowledged = (callback) => {
  if (!socket) return;

  socket.on('alarm_acknowledged', (data) => {
    console.log('✅ Alarm onaylandı:', data.alarmId);
    callback(data.alarmId, data.acknowledgedBy);
  });
};

// ============================================
// 6. CIHAZ LİSTESİ
// ============================================

/**
 * Cihaz listesi güncellemelerini dinle
 */
export const onDevicesUpdated = (callback) => {
  if (!socket) return;

  socket.on('devices_updated', (data) => {
    console.log('📱 Cihazlar güncellendi:', data);
    callback(data.totalDevices, data.timestamp);
  });
};

// ============================================
// 7. MANUEL MESAJ GÖNDERME (Opsiyonel)
// ============================================

/**
 * Manuel mesaj gönder
 */
export const sendMessage = (targetDeviceId, message) => {
  if (!socket) {
    console.error('Socket bağlantısı yok');
    return;
  }

  socket.emit('send_message', {
    targetDeviceId,
    message
  });

  socket.once('message_sent', (data) => {
    console.log('📨 Mesaj gönderildi:', data);
  });
};

/**
 * Manuel mesaj dinle
 */
export const onReceiveMessage = (callback) => {
  if (!socket) return;

  socket.on('receive_message', (data) => {
    console.log('📨 Mesaj alındı:', data.message);
    callback(data.message, data.fromDeviceId);
  });
};

// ============================================
// 8. BAĞLANTI YÖNETİMİ
// ============================================

/**
 * Backend bağlantısını kes
 */
export const disconnectFromBackend = () => {
  if (activeHeartbeatInterval) {
    clearInterval(activeHeartbeatInterval);
    activeHeartbeatInterval = null;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('❌ Backend bağlantısı kapatıldı');
  }

  deviceId = null;
  deviceType = null;
  onThresholdsReceivedCallback = null;
};

/**
 * Bağlantı durumunu kontrol et
 */
export const isConnected = () => {
  return socket && socket.connected;
};

/**
 * Cihaz bilgilerini al
 */
export const getDeviceInfo = () => {
  return {
    deviceId,
    deviceType,
    connected: isConnected()
  };
};

/**
 * Socket instance'ını al (advanced kullanım için)
 */
export const getSocket = () => socket;

// ============================================
// 9. HATA YÖNETİMİ
// ============================================

/**
 * Hataları dinle
 */
export const onError = (callback) => {
  if (!socket) return;

  socket.on('error', (error) => {
    console.error('❌ Backend hatası:', error);
    callback(error);
  });
};

// ============================================
// Export all functions
// ============================================

// ============================================
// OTOMATIK ENTEGRASYON (App.tsx'e dokunmadan)
// ============================================

/**
 * App.tsx'in state'lerini otomatik dinle ve backend'e gönder
 * Bu fonksiyon App.tsx'te çağrılmadan çalışmaz, ama minimal entegrasyon için hazır
 * 
 * Kullanım (App.tsx'te sadece 1 satır):
 * import './backend/frontend-integration-auto';
 * 
 * VEYA manuel kullanım:
 * import { autoIntegrate } from './backend/frontend-integration';
 * autoIntegrate({ setSensorData, setAlarms, setThresholds, sendNotification });
 */

let autoIntegrationCallbacks = null;

export const autoIntegrate = (callbacks) => {
  autoIntegrationCallbacks = callbacks;
  
  // Otomatik olarak patient olarak bağlan
  connectToBackend('patient', {
    deviceName: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
    appVersion: '1.0.0'
  });
  
  // Eşik değerlerini dinle ve callback ile güncelle
  onReceiveThresholds((newThresholds) => {
    if (autoIntegrationCallbacks && autoIntegrationCallbacks.setThresholds) {
      autoIntegrationCallbacks.setThresholds(newThresholds);
    }
  });
  
  // Alarmları dinle ve callback ile ekle
  onReceiveAlarm((alarm, fromDeviceId) => {
    if (autoIntegrationCallbacks) {
      if (autoIntegrationCallbacks.setAlarms) {
        autoIntegrationCallbacks.setAlarms((prev) => [alarm, ...prev]);
      }
      if (autoIntegrationCallbacks.sendNotification) {
        autoIntegrationCallbacks.sendNotification('🚨 ACİL DURUM', alarm.message);
      }
    }
  });
  
  // Sensör verilerini dinle ve callback ile güncelle
  onReceiveSensorData((data, fromDeviceId) => {
    if (autoIntegrationCallbacks && autoIntegrationCallbacks.setSensorData) {
      autoIntegrationCallbacks.setSensorData(data);
    }
  });
  
  console.log('✅ Otomatik entegrasyon başlatıldı');
};

/**
 * Sensör verisini otomatik gönder (App.tsx'te parseSensorData sonrası çağrılabilir)
 */
export const autoSendSensorData = (sensorData) => {
  if (isConnected() && deviceType === 'patient') {
    sendSensorData(sensorData);
  }
};

/**
 * Alarmı otomatik gönder (App.tsx'te detectAlarms sonrası çağrılabilir)
 */
export const autoSendAlarm = (alarm) => {
  if (isConnected() && deviceType === 'patient') {
    sendAlarm(alarm);
  }
};

export default {
  // Bağlantı
  connectToBackend,
  disconnectFromBackend,
  isConnected,
  getDeviceInfo,
  getSocket,
  
  // Eşleştirme
  pairDevices,
  onDevicePaired,
  
  // Eşik değerleri
  sendThresholds,
  onReceiveThresholds,
  
  // Sensör verileri
  sendSensorData,
  onReceiveSensorData,
  
  // Alarmlar
  sendAlarm,
  onReceiveAlarm,
  acknowledgeAlarm,
  onAlarmAcknowledged,
  
  // Cihazlar
  onDevicesUpdated,
  
  // Mesajlar
  sendMessage,
  onReceiveMessage,
  
  // Hata yönetimi
  onError,
  
  // Otomatik entegrasyon
  autoIntegrate,
  autoSendSensorData,
  autoSendAlarm
};
