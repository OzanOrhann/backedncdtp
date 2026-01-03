# 🚀 BACKEND HIZLI BAŞLATMA

## 📋 Kurulum (İlk Seferinde)

```bash
cd backend
npm install
```

## ▶️ Başlatma

```bash
npm start
```

## 🌐 IP Adresinizi Bulun

**Windows:**
```bash
ipconfig
```
"IPv4 Address" satırına bakın (örn: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
# veya
hostname -I
```

## 📱 Frontend'te Yapılacaklar

1. `services/backend-service.js` dosyasındaki IP'yi değiştirin:

```javascript
const BACKEND_URL = 'http://192.168.1.100:3000'; // Kendi IP'nizi yazın
```

2. Hasta Telefonu (Bluetooth'tan veri alan):
```javascript
await connectBackend('patient');
```

3. Monitör Telefonu (Verileri gören):
```javascript
await connectBackend('monitor');
```

## ✅ Test

Backend çalışıyor mu kontrol edin:
```bash
# Yeni terminal açın
curl http://localhost:3000/health
```

Veya tarayıcıda: `http://localhost:3000`

## 🗄️ Database

Veriler otomatik olarak `backend/database/` klasörüne kaydedilir.

## 🔧 Veri Formatı Değiştirme

Bileklikten gelen veri formatını değiştirmek için:

`data-format.js` dosyasını açın → `parseWearableData()` fonksiyonunu düzenleyin

## 📞 Sorun Giderme

### Port zaten kullanımda:
```bash
PORT=3001 npm start
```

### Backend'e bağlanamıyor:
- Aynı WiFi'de misiniz?
- IP adresi doğru mu?
- Firewall kapalı mı?

## 📝 Detaylı Bilgi

Daha fazla bilgi için:
- `İKİ_TELEFON_BAĞLANTI_REHBERİ.md` - Detaylı adım adım rehber
- `README.md` - API dokümantasyonu
- `DEPLOYMENT.md` - Cloud'a yükleme

## 🎯 Özet

1. Backend'i başlat: `npm start`
2. IP adresini bul: `ipconfig`
3. Frontend'te IP'yi güncelle
4. İki telefonu bağla (biri patient, diğeri monitor)
5. Veriler otomatik akar! 🎉

---

**Backend şu an çalışıyor mu?**

Terminal'de şunu görmeli siniz:
```
============================================================
🏥  ÇDTP BACKEND SERVER BAŞLATILDI
============================================================
📡  Port: 3000
🌐  Local: http://localhost:3000
============================================================
```

✅ Görüyorsanız hazırsınız!
❌ Görmüyorsanız `npm start` çalıştırın
