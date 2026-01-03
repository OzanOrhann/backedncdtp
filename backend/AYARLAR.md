# ⚙️ BACKEND AYARLARI

## 🔧 YAPILANDIRMA

### 1. Backend URL (Frontend için) - ÖNEMLİ!

**Dosya:** `backend/frontend-integration.js` (satır 18)

**Şu anki değer:**
```javascript
const BACKEND_URL = 'http://localhost:3000';
```

**Değiştirin:**
```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

**IP adresini bulmak için:**
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` → inet

---

### 2. Server Port

**Dosya:** `backend/server.js` (satır 34)

**Varsayılan:** 3000

**Değiştirmek için:**
```javascript
const PORT = process.env.PORT || 3000; // Burayı değiştirin
```

**VEYA `.env` dosyası oluşturun:**
```env
PORT=3000
NODE_ENV=development
```

---

### 3. Veri Formatı

**Dosya:** `backend/data-format.js`

Bileklikten gelen veri formatını değiştirmek için `parseWearableData()` fonksiyonunu düzenleyin.

---

## ✅ KONTROL LİSTESİ

Başlatmadan önce:

- [ ] `npm install` yapıldı mı?
- [ ] `frontend-integration.js` içinde IP adresi ayarlandı mı?
- [ ] Backend başlatıldı mı? (`npm start`)
- [ ] Port açık mı? (3000)
- [ ] Firewall ayarları yapıldı mı?

---

## 🚀 BAŞLATMA

```bash
cd backend
npm install
npm start
```

**Beklenen çıktı:**
```
============================================================
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
🌐  Network: http://[YOUR_IP]:3000
============================================================

✅  Server hazır, cihaz bağlantıları bekleniyor...
```

---

## 📝 ÖZET

1. **Backend URL:** `frontend-integration.js` → IP adresini ayarlayın
2. **Port:** `server.js` → 3000 (varsayılan)
3. **Database:** Otomatik oluşturulur (JSON)
4. **Veri Formatı:** `data-format.js` → Özelleştirilebilir

**Hazır!** 🎉

