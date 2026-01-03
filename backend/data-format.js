/**
 * VERİ FORMATI YAPIMLANDIRMASI
 * 
 * Bileklikten gelecek veri formatını buradan kolayca değiştirebilirsiniz
 */

// ============================================================
// SENSÖR VERİSİ FORMATI
// ============================================================

/**
 * Bileklikten gelen ham veri formatı
 * Bu formatı bilekliğinizin göndereceği formata göre değiştirin
 * 
 * Desteklenen formatlar:
 * - JSON: { hr: 75, ax: 0.1, ay: 0.2, az: 9.8, bat: 85, ts: timestamp }
 * - CSV: "75,0.1,0.2,9.8,85,timestamp"
 * - Hex: "4B0A14620055"
 */

/**
 * Bileklik verisini uygulama formatına dönüştürme
 * 
 * @param {any} rawData - Bileklikten gelen ham veri
 * @returns {Object} Standart sensör verisi
 */
function parseWearableData(rawData) {
  // FORMATI DEĞİŞTİRMEK İÇİN BU FONKSİYONU DÜZENLEYİN
  
  try {
    // Seçenek 1: Eğer JSON formatında geliyorsa
    if (typeof rawData === 'object' && rawData !== null) {
      return {
        heartRate: rawData.hr || rawData.heartRate || null,
        accelX: rawData.ax || rawData.accelX || null,
        accelY: rawData.ay || rawData.accelY || null,
        accelZ: rawData.az || rawData.accelZ || null,
        battery: rawData.bat || rawData.battery || null,
        timestamp: rawData.ts || rawData.timestamp || Date.now(),
        movement: calculateMovement(rawData.ax, rawData.ay, rawData.az)
      };
    }
    
    // Seçenek 2: Eğer string formatında geliyorsa (CSV)
    if (typeof rawData === 'string') {
      const parts = rawData.split(',');
      return {
        heartRate: parseFloat(parts[0]) || null,
        accelX: parseFloat(parts[1]) || null,
        accelY: parseFloat(parts[2]) || null,
        accelZ: parseFloat(parts[3]) || null,
        battery: parseFloat(parts[4]) || null,
        timestamp: parseInt(parts[5]) || Date.now(),
        movement: calculateMovement(parts[1], parts[2], parts[3])
      };
    }
    
    // Seçenek 3: Eğer hex formatında geliyorsa
    if (typeof rawData === 'string' && /^[0-9A-Fa-f]+$/.test(rawData)) {
      // Hex parsing örneği (özelleştirin)
      const hr = parseInt(rawData.substring(0, 2), 16);
      const ax = (parseInt(rawData.substring(2, 4), 16) - 128) / 10;
      const ay = (parseInt(rawData.substring(4, 6), 16) - 128) / 10;
      const az = (parseInt(rawData.substring(6, 8), 16) - 128) / 10;
      const bat = parseInt(rawData.substring(8, 10), 16);
      
      return {
        heartRate: hr,
        accelX: ax,
        accelY: ay,
        accelZ: az,
        battery: bat,
        timestamp: Date.now(),
        movement: calculateMovement(ax, ay, az)
      };
    }
    
    // Varsayılan: Olduğu gibi döndür
    return rawData;
    
  } catch (error) {
    console.error('Veri parsing hatası:', error);
    return null;
  }
}

/**
 * İvme verilerinden hareket durumunu hesapla
 */
function calculateMovement(ax, ay, az) {
  if (ax === null || ay === null || az === null) {
    return 'unknown';
  }
  
  const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
  
  // Düşme algılama (2.5g üzeri)
  if (magnitude > 2.5) {
    return 'fall';
  }
  
  // Aktif hareket (0.5g - 2.5g arası)
  if (magnitude > 0.5) {
    return 'active';
  }
  
  // Hareketsiz (0.5g altı)
  return 'idle';
}

// ============================================================
// EŞİK DEĞERLERİ FORMATI
// ============================================================

/**
 * Varsayılan eşik değerleri
 */
const DEFAULT_THRESHOLDS = {
  minHeartRate: 40,        // Minimum kalp atışı (BPM)
  maxHeartRate: 120,       // Maximum kalp atışı (BPM)
  inactivityMinutes: 5,    // Hareketsizlik süresi (dakika)
  fallThreshold: 2.5       // Düşme eşiği (g)
};

/**
 * Eşik değerlerini doğrula
 */
function validateThresholds(thresholds) {
  return {
    minHeartRate: Number(thresholds.minHeartRate) || DEFAULT_THRESHOLDS.minHeartRate,
    maxHeartRate: Number(thresholds.maxHeartRate) || DEFAULT_THRESHOLDS.maxHeartRate,
    inactivityMinutes: Number(thresholds.inactivityMinutes) || DEFAULT_THRESHOLDS.inactivityMinutes,
    fallThreshold: Number(thresholds.fallThreshold) || DEFAULT_THRESHOLDS.fallThreshold
  };
}

// ============================================================
// ALARM FORMATI
// ============================================================

/**
 * Alarm tipleri
 */
const ALARM_TYPES = {
  FALL: 'fall',
  INACTIVITY: 'inactivity',
  LOW_HEART_RATE: 'low_heart_rate',
  HIGH_HEART_RATE: 'high_heart_rate',
  MANUAL: 'manual'
};

/**
 * Alarm mesajları (özelleştirilebilir)
 */
const ALARM_MESSAGES = {
  fall: '🚨 Düşme tespit edildi!',
  inactivity: '⏰ Uzun süre hareketsizlik',
  low_heart_rate: '💔 Düşük kalp atışı',
  high_heart_rate: '💓 Yüksek kalp atışı',
  manual: '🆘 Manuel acil durum'
};

/**
 * Alarm oluştur
 */
function createAlarm(type, customMessage = null) {
  return {
    id: `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    message: customMessage || ALARM_MESSAGES[type] || 'Acil durum',
    timestamp: Date.now(),
    acknowledged: false
  };
}

// ============================================================
// BLUETOOTH VERİ FORMATI (ESP32)
// ============================================================

/**
 * ESP32'den gelen Bluetooth verisi parsing
 * BLE Characteristic'ten gelen veriyi parse edin
 */
function parseBluetoothData(characteristic) {
  try {
    // Eğer string geliyorsa
    if (typeof characteristic === 'string') {
      return parseWearableData(characteristic);
    }
    
    // Eğer buffer/array geliyorsa
    if (characteristic instanceof ArrayBuffer || Array.isArray(characteristic)) {
      // Buffer'ı string'e çevir
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(characteristic);
      return parseWearableData(text);
    }
    
    // Eğer object geliyorsa direkt parse et
    return parseWearableData(characteristic);
    
  } catch (error) {
    console.error('Bluetooth veri parsing hatası:', error);
    return null;
  }
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  // Parser fonksiyonlar
  parseWearableData,
  parseBluetoothData,
  validateThresholds,
  createAlarm,
  calculateMovement,
  
  // Sabitler
  DEFAULT_THRESHOLDS,
  ALARM_TYPES,
  ALARM_MESSAGES,
  WEARABLE_DATA_FORMAT
};
