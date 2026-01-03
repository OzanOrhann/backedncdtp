// ============================================
// IP ADRESİ ALGILAMA MODÜLÜ
// ============================================
// Server'ın IP adresini otomatik algılar

const os = require('os');

/**
 * Yerel ağ IP adresini bulur
 * @returns {string|null} IP adresi veya null
 */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Öncelik sırası: WiFi > Ethernet > Diğer
  const priority = ['Wi-Fi', 'WiFi', 'Ethernet', 'eth0', 'en0', 'wlan0'];
  
  for (const name of priority) {
    const iface = interfaces[name];
    if (iface) {
      for (const addr of iface) {
        // IPv4 ve internal olmayan (127.0.0.1 değil)
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
  }
  
  // Öncelik listesinde yoksa tüm interface'leri kontrol et
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        // 192.168.x.x veya 10.x.x.x gibi özel IP'leri tercih et
        if (addr.address.startsWith('192.168.') || 
            addr.address.startsWith('10.') ||
            addr.address.startsWith('172.')) {
          return addr.address;
        }
      }
    }
  }
  
  return null;
}

/**
 * Tüm yerel IP adreslerini listeler
 * @returns {Array<string>} IP adresleri listesi
 */
function getAllLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push({
          name,
          address: addr.address,
          netmask: addr.netmask
        });
      }
    }
  }
  
  return ips;
}

module.exports = {
  getLocalIP,
  getAllLocalIPs
};

