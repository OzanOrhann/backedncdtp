/**
 * ALARM TESPİT MODÜLÜ
 * 
 * MONITOR telefonunda kullanılacak
 * Sensör verilerini ve eşik değerlerini alıp alarm tespit eder
 * Frontend'deki detectAlarms fonksiyonu ile uyumlu
 */

/**
 * Alarm tespit fonksiyonu
 * Frontend'deki detectAlarms ile aynı mantık
 * 
 * @param {object} sensorData - Sensör verisi
 * @param {object} thresholds - Eşik değerleri
 * @param {number} lastActivityTime - Son aktivite zamanı (ms)
 * @returns {Array} Tespit edilen alarmlar
 */
function detectAlarms(sensorData, thresholds, lastActivityTime = null) {
  const newAlarms = [];
  const now = Date.now();

  // 1. Düşme tespiti
  if (sensorData.movement === 'fall') {
    newAlarms.push({
      id: `fall_${now}`,
      type: 'fall',
      message: 'Düşme tespit edildi! Acil müdahale gerekebilir.',
      timestamp: now,
      acknowledged: false,
    });
  }

  // 2. Anormal nabız tespiti
  if (sensorData.heartRate !== null && sensorData.heartRate !== undefined) {
    if (sensorData.heartRate < thresholds.minHeartRate) {
      newAlarms.push({
        id: `low_hr_${now}`,
        type: 'low_heart_rate',
        message: `Düşük nabız tespit edildi: ${sensorData.heartRate} BPM (Eşik: ${thresholds.minHeartRate} BPM)`,
        timestamp: now,
        acknowledged: false,
      });
    } else if (sensorData.heartRate > thresholds.maxHeartRate) {
      newAlarms.push({
        id: `high_hr_${now}`,
        type: 'high_heart_rate',
        message: `Yüksek nabız tespit edildi: ${sensorData.heartRate} BPM (Eşik: ${thresholds.maxHeartRate} BPM)`,
        timestamp: now,
        acknowledged: false,
      });
    }
  }

  // 3. Hareketsizlik tespiti
  if (sensorData.movement === 'idle' && lastActivityTime) {
    const inactivityDuration = (now - lastActivityTime) / 1000 / 60; // dakika
    if (inactivityDuration >= thresholds.inactivityMinutes) {
      newAlarms.push({
        id: `inactivity_${now}`,
        type: 'inactivity',
        message: `Uzun süre hareketsizlik tespit edildi: ${Math.round(inactivityDuration)} dakika`,
        timestamp: now,
        acknowledged: false,
      });
    }
  }

  return newAlarms;
}

/**
 * İvme verilerinden hareket durumunu hesapla
 * Frontend'deki calculateMovement ile uyumlu
 * 
 * @param {number} accelX - X ekseni ivmesi
 * @param {number} accelY - Y ekseni ivmesi
 * @param {number} accelZ - Z ekseni ivmesi
 * @param {number} fallThreshold - Düşme eşiği (default: 2.5)
 * @returns {string} 'active' | 'idle' | 'fall' | 'unknown'
 */
function calculateMovement(accelX, accelY, accelZ, fallThreshold = 2.5) {
  if (accelX === null || accelY === null || accelZ === null) {
    return 'unknown';
  }

  // Toplam ivme (magnitude)
  const magnitude = Math.sqrt(
    Math.pow(accelX, 2) + Math.pow(accelY, 2) + Math.pow(accelZ, 2)
  );

  // Düşme tespiti (2.5g üzeri)
  if (magnitude > fallThreshold) {
    return 'fall';
  }

  // Aktif hareket (0.5g - 2.5g arası)
  if (magnitude > 0.5) {
    return 'active';
  }

  // Hareketsiz (0.5g altı)
  return 'idle';
}

module.exports = {
  detectAlarms,
  calculateMovement
};

