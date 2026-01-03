/**
 * BASIT DOSYA TABANLI DATABASE
 * 
 * Verileri JSON dosyalarında saklar
 * SQLite veya başka bir DB'ye kolayca geçilebilir
 */

const fs = require('fs');
const path = require('path');

// Database klasörü
const DB_DIR = path.join(__dirname, 'database');
const SENSOR_DATA_FILE = path.join(DB_DIR, 'sensor-data.json');
const ALARMS_FILE = path.join(DB_DIR, 'alarms.json');
const THRESHOLDS_FILE = path.join(DB_DIR, 'thresholds.json');
const DEVICES_FILE = path.join(DB_DIR, 'devices.json');

// Database klasörünü oluştur
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log('📁 Database klasörü oluşturuldu');
}

// Dosyaları başlat
function initializeFiles() {
  if (!fs.existsSync(SENSOR_DATA_FILE)) {
    fs.writeFileSync(SENSOR_DATA_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(ALARMS_FILE)) {
    fs.writeFileSync(ALARMS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(THRESHOLDS_FILE)) {
    fs.writeFileSync(THRESHOLDS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(DEVICES_FILE)) {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify({}));
  }
}

initializeFiles();

// ============================================
// SENSÖR VERİSİ İŞLEMLERİ
// ============================================

/**
 * Sensör verisini kaydet
 * @param {string} deviceId - Cihaz ID'si
 * @param {object} sensorData - Sensör verisi
 */
function saveSensorData(deviceId, sensorData) {
  try {
    const data = JSON.parse(fs.readFileSync(SENSOR_DATA_FILE, 'utf8'));
    
    if (!data[deviceId]) {
      data[deviceId] = [];
    }
    
    // Son 500 veriyi tut (bellek tasarrufu)
    data[deviceId].push({
      ...sensorData,
      savedAt: Date.now()
    });
    
    if (data[deviceId].length > 500) {
      data[deviceId] = data[deviceId].slice(-500);
    }
    
    fs.writeFileSync(SENSOR_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Sensör verisi kaydetme hatası:', error);
    return false;
  }
}

/**
 * Sensör verisini oku
 * @param {string} deviceId - Cihaz ID'si
 * @param {number} limit - Kaç veri döndürülecek
 */
function getSensorData(deviceId, limit = 100) {
  try {
    const data = JSON.parse(fs.readFileSync(SENSOR_DATA_FILE, 'utf8'));
    const deviceData = data[deviceId] || [];
    return deviceData.slice(-limit);
  } catch (error) {
    console.error('Sensör verisi okuma hatası:', error);
    return [];
  }
}

/**
 * Tüm cihazların son sensör verisini al
 */
function getAllLatestSensorData() {
  try {
    const data = JSON.parse(fs.readFileSync(SENSOR_DATA_FILE, 'utf8'));
    const result = {};
    
    for (const [deviceId, values] of Object.entries(data)) {
      result[deviceId] = values[values.length - 1] || null;
    }
    
    return result;
  } catch (error) {
    console.error('Veri okuma hatası:', error);
    return {};
  }
}

// ============================================
// ALARM İŞLEMLERİ
// ============================================

/**
 * Alarm kaydet
 */
function saveAlarm(deviceId, alarm) {
  try {
    const data = JSON.parse(fs.readFileSync(ALARMS_FILE, 'utf8'));
    
    if (!data[deviceId]) {
      data[deviceId] = [];
    }
    
    data[deviceId].push({
      ...alarm,
      savedAt: Date.now()
    });
    
    // Son 200 alarm'ı tut
    if (data[deviceId].length > 200) {
      data[deviceId] = data[deviceId].slice(-200);
    }
    
    fs.writeFileSync(ALARMS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Alarm kaydetme hatası:', error);
    return false;
  }
}

/**
 * Alarmları oku
 */
function getAlarms(deviceId, limit = 50) {
  try {
    const data = JSON.parse(fs.readFileSync(ALARMS_FILE, 'utf8'));
    const deviceAlarms = data[deviceId] || [];
    return deviceAlarms.slice(-limit);
  } catch (error) {
    console.error('Alarm okuma hatası:', error);
    return [];
  }
}

/**
 * Alarm'ı onayla
 */
function acknowledgeAlarm(deviceId, alarmId) {
  try {
    const data = JSON.parse(fs.readFileSync(ALARMS_FILE, 'utf8'));
    
    if (data[deviceId]) {
      const alarm = data[deviceId].find(a => a.id === alarmId);
      if (alarm) {
        alarm.acknowledged = true;
        alarm.acknowledgedAt = Date.now();
        fs.writeFileSync(ALARMS_FILE, JSON.stringify(data, null, 2));
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Alarm onaylama hatası:', error);
    return false;
  }
}

// ============================================
// EŞİK DEĞERLERİ İŞLEMLERİ
// ============================================

/**
 * Eşik değerlerini kaydet
 */
function saveThresholds(deviceId, thresholds) {
  try {
    const data = JSON.parse(fs.readFileSync(THRESHOLDS_FILE, 'utf8'));
    data[deviceId] = {
      ...thresholds,
      updatedAt: Date.now()
    };
    fs.writeFileSync(THRESHOLDS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Eşik değerleri kaydetme hatası:', error);
    return false;
  }
}

/**
 * Eşik değerlerini oku
 */
function getThresholds(deviceId) {
  try {
    const data = JSON.parse(fs.readFileSync(THRESHOLDS_FILE, 'utf8'));
    return data[deviceId] || null;
  } catch (error) {
    console.error('Eşik değerleri okuma hatası:', error);
    return null;
  }
}

// ============================================
// CİHAZ İŞLEMLERİ
// ============================================

/**
 * Cihaz bilgilerini kaydet
 */
function saveDevice(deviceId, deviceInfo) {
  try {
    const data = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
    data[deviceId] = {
      ...deviceInfo,
      lastSeen: Date.now()
    };
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Cihaz kaydetme hatası:', error);
    return false;
  }
}

/**
 * Cihaz bilgilerini oku
 */
function getDevice(deviceId) {
  try {
    const data = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
    return data[deviceId] || null;
  } catch (error) {
    console.error('Cihaz okuma hatası:', error);
    return null;
  }
}

/**
 * Tüm cihazları oku
 */
function getAllDevices() {
  try {
    const data = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
    return data;
  } catch (error) {
    console.error('Cihazları okuma hatası:', error);
    return {};
  }
}

// ============================================
// TEMİZLİK İŞLEMLERİ
// ============================================

/**
 * Eski verileri temizle (30 günden eski)
 */
function cleanOldData() {
  try {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Sensör verilerini temizle
    const sensorData = JSON.parse(fs.readFileSync(SENSOR_DATA_FILE, 'utf8'));
    for (const deviceId in sensorData) {
      sensorData[deviceId] = sensorData[deviceId].filter(
        data => data.savedAt > thirtyDaysAgo
      );
    }
    fs.writeFileSync(SENSOR_DATA_FILE, JSON.stringify(sensorData, null, 2));
    
    // Alarmları temizle
    const alarms = JSON.parse(fs.readFileSync(ALARMS_FILE, 'utf8'));
    for (const deviceId in alarms) {
      alarms[deviceId] = alarms[deviceId].filter(
        alarm => alarm.savedAt > thirtyDaysAgo
      );
    }
    fs.writeFileSync(ALARMS_FILE, JSON.stringify(alarms, null, 2));
    
    console.log('✅ Eski veriler temizlendi');
  } catch (error) {
    console.error('Veri temizleme hatası:', error);
  }
}

// Her gün bir kez eski verileri temizle
setInterval(cleanOldData, 24 * 60 * 60 * 1000);

// ============================================
// EXPORT
// ============================================

module.exports = {
  saveSensorData,
  getSensorData,
  getAllLatestSensorData,
  saveAlarm,
  getAlarms,
  acknowledgeAlarm,
  saveThresholds,
  getThresholds,
  saveDevice,
  getDevice,
  getAllDevices,
  cleanOldData
};
