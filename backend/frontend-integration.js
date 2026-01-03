// ============================================
// ÇDTP Frontend - Backend Entegrasyon Modülü
// ============================================
// Bu modülü App.tsx içine import edin
// Frontend mevcut interface'leri ile %100 uyumlu

import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// YAPILANDIRMA
// ============================================

// Backend server URL'i - Kendi server IP'nizi buraya yazın
// Örnek: 'http://192.168.1.100:3000' veya 'https://your-backend.com'
const BACKEND_URL = 'http://localhost:3000'; // BURAYA SERVER IP'NİZİ YAZIN!

// Socket instance
let socket = null;
let deviceId = null;
let deviceType = null;

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
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      if (data.thresholds && window.__onThresholdsReceived) {
        window.__onThresholdsReceived(data.thresholds);
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

    // Temizleme için global'e kaydet
    window.__heartbeatInterval = heartbeatInterval;

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

  // Global callback kaydet (registered event için)
  window.__onThresholdsReceived = callback;

  socket.on('receive_thresholds', (data) => {
    console.log('📊 Eşik değerleri alındı:', data.thresholds);
    callback(data.thresholds);
  });
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
 */
export const onReceiveSensorData = (callback) => {
  if (!socket) return;

  socket.on('receive_sensor_data', (data) => {
    console.log('📡 Sensör verisi alındı:', data.sensorData);
    callback(data.sensorData, data.fromDeviceId);
  });
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
  if (window.__heartbeatInterval) {
    clearInterval(window.__heartbeatInterval);
  }

  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('❌ Backend bağlantısı kapatıldı');
  }

  deviceId = null;
  deviceType = null;
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
  onError
};
