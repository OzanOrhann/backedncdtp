# 📱 FRONTEND ENTEGRASYON REHBERİ

## ✅ APP.TSX GÜNCELLENDİ!

**App.tsx ve RemoteMonitoring.tsx dosyaları backend entegrasyonu ile güncellendi!**

Artık ekstra kod eklemenize gerek yok, sadece backend URL'ini ayarlayın.

---

## ⚙️ YAPILANDIRMA

### 1. Backend URL'ini Ayarlayın (ÖNEMLİ!)

**Dosya:** `backend/frontend-integration.js` (satır 18)

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

**IP adresini bulmak için:**
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` → inet

---

## 🎯 SİSTEM NASIL ÇALIŞIYOR

### PATIENT Telefonu (App.tsx):
1. ✅ Backend'e otomatik bağlanır
2. ✅ Bileklikten veri alır → Ekranda gösterir
3. ✅ Verileri MONITOR'a gönderir
4. ✅ Alarmları MONITOR'a gönderir
5. ✅ MONITOR'dan eşik değerlerini alır → Ekranda gösterir
6. ✅ MONITOR'dan alarmları alır → Ekranda gösterir

### MONITOR Telefonu (RemoteMonitoring.tsx):
1. ✅ Backend'e otomatik bağlanır
2. ✅ PATIENT'ın verilerini alır → Ekranda gösterir
3. ✅ Alarmları alır → Ekranda gösterir
4. ✅ Eşik değerlerini ayarlar → PATIENT'a gönderir
5. ✅ Otomatik alarm tespiti yapar → PATIENT'a gönderir

---

## 🔄 VERİ AKIŞI

```
PATIENT:
  Bileklik → Bluetooth → App.tsx → Backend → Database
  Backend → WebSocket → MONITOR

MONITOR:
  Backend → WebSocket → RemoteMonitoring.tsx → Ekranda göster
  RemoteMonitoring.tsx → Eşik ayarla → Backend → PATIENT
  RemoteMonitoring.tsx → Alarm tespit → Backend → PATIENT
```

---

## ✅ KONTROL LİSTESİ

- [ ] Backend başlatıldı mı? (`cd backend && npm start`)
- [ ] IP adresi bulundu mu? (`ipconfig` / `ifconfig`)
- [ ] `frontend-integration.js` içinde IP ayarlandı mı?
- [ ] İki telefon aynı WiFi'de mi?
- [ ] Firewall ayarları yapıldı mı?

---

## 🚀 TEST

1. Backend'i başlatın: `cd backend && npm start`
2. IP adresini bulun: `ipconfig` / `ifconfig`
3. `frontend-integration.js` içinde IP'yi ayarlayın
4. İki telefonu başlatın:
   - Telefon 1: PATIENT olarak bağlanır (otomatik)
   - Telefon 2: MONITOR olarak bağlanır (RemoteMonitoring sayfası)
5. Veri akışını test edin

---

## 📝 ÖZET

**App.tsx ve RemoteMonitoring.tsx güncellendi!**

Sadece yapmanız gereken:
1. Backend'i başlatın
2. IP adresini bulun
3. `frontend-integration.js` içinde IP'yi ayarlayın

**Hazır!** 🎉
