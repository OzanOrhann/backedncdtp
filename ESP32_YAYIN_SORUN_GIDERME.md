# 🔧 ESP32 Yayın Görünmüyor - Sorun Giderme

## ❓ Sorun: Kod çalışıyor ama yayın görünmüyor

### 🔍 Kontrol Listesi

## 1. Serial Monitor Çıktısını Kontrol Edin

**Serial Monitor'ü açın (115200 baud) ve şu mesajları görmelisiniz:**

```
ESP32 BLE Yayın Başlatılıyor...
========================================
Yayın başlatıldı! Cihaz adı: ESP32-Test-Cihazi
Servis UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
Telefonunuzdan 'ESP32-Test-Cihazi' adlı cihazı arayın
========================================
Yayın durumu: AKTİF
Cihaz görünür olmalı!
========================================
```

**Eğer bu mesajları görüyorsanız:**
- ✅ ESP32 kodu çalışıyor
- ✅ Yayın başlatıldı
- ❓ Sorun telefon tarafında olabilir

**Eğer bu mesajları görmüyorsanız:**
- ❌ Kod düzgün yüklenmemiş olabilir
- ❌ ESP32 reset edin
- ❌ Kodu tekrar yükleyin

---

## 2. Telefon Uygulamasını Kontrol Edin

### Kontrol Listesi:

- [ ] **Bluetooth açık mı?** (Telefon ayarlarından kontrol edin)
- [ ] **Konum servisi açık mı?** (Android'de gerekli!)
- [ ] **İzinler verildi mi?** (Bluetooth, Konum)
- [ ] **"Cihazları Tara" butonuna basıldı mı?**
- [ ] **10 saniye beklendi mi?** (Tarama 10 saniye sürer)

### Terminal Loglarını Kontrol Edin:

Telefon uygulamanızı çalıştırırken terminal'de şunları görmelisiniz:

```
Tarama başlatılıyor...
Tarama başlatıldı, 10 saniye sürecek...
Yakındaki BLE cihazları aranıyor...
=== CİHAZ BULUNDU ===
ID: XX:XX:XX:XX:XX:XX
İsim: ESP32-Test-Cihazi
```

**Eğer "Cihaz bulundu" mesajını görmüyorsanız:**
- Sorun tarama kısmında olabilir
- nRF Connect ile test edin

---

## 3. nRF Connect ile Test Edin

### Adımlar:

1. **nRF Connect** uygulamasını indirin (Google Play / App Store)
2. **"Scan" butonuna basın**
3. **"ESP32-Test-Cihazi" adlı cihazı arayın**

**Sonuçlar:**

- ✅ **nRF Connect'te görünüyorsa:**
  - ESP32 yayın yapıyor ✅
  - Sorun telefon uygulamanızda ❌
  - Event listener'ları kontrol edin

- ❌ **nRF Connect'te görünmüyorsa:**
  - ESP32 yayın yapmıyor ❌
  - Kod sorunu olabilir
  - ESP32'yi reset edin
  - Kodu tekrar yükleyin

---

## 4. ESP32'yi Reset Edin

### Yöntem 1: Reset Butonu

1. ESP32'de **RESET** butonuna basın
2. Serial Monitor'de mesajları kontrol edin
3. "Yayın başlatıldı" mesajını görmelisiniz

### Yöntem 2: USB'yi Çıkarıp Takın

1. ESP32'yi USB'den çıkarın
2. 5 saniye bekleyin
3. USB'yi tekrar takın
4. Serial Monitor'ü kontrol edin

### Yöntem 3: Kodu Tekrar Yükleyin

1. Arduino IDE'de **Upload** butonuna basın
2. Yükleme tamamlanana kadar bekleyin
3. Serial Monitor'ü kontrol edin

---

## 5. Mesafe ve Engeller

### Kontrol Edin:

- ✅ **ESP32 ve telefon yakında mı?** (1-2 metre ideal)
- ✅ **Engeller var mı?** (Duvarlar, metal objeler)
- ✅ **WiFi router yakında mı?** (Girişim yapabilir)

**Test:**
- ESP32'yi telefonun yanına getirin (10-20 cm)
- Tekrar tarama yapın

---

## 6. Kod İyileştirmeleri

### Alternatif Yayın Ayarları:

Eğer hala görünmüyorsa, şu ayarları deneyin:

```cpp
// Yayın (advertising) başlat - Alternatif ayarlar
BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
pAdvertising->addServiceUUID(SERVICE_UUID);
pAdvertising->setScanResponse(true);
pAdvertising->setMinPreferred(0x06);
pAdvertising->setMaxPreferred(0x12);
pAdvertising->setAdvertisementType(ADV_TYPE_IND);
BLEDevice::startAdvertising();
```

---

## 7. Debug için Ekstra Loglar

Kodunuza şu logları ekleyebilirsiniz:

```cpp
void loop() {
  // Her 5 saniyede bir yayın durumunu kontrol et
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck >= 5000) {
    Serial.println("Yayın durumu kontrol ediliyor...");
    Serial.println("Cihaz bağlı mı: " + String(deviceConnected ? "Evet" : "Hayır"));
    lastCheck = millis();
  }
  
  // ... diğer kodlar
}
```

---

## 8. Alternatif Test: Basit Yayın Kodu

Eğer hala çalışmıyorsa, daha basit bir kod deneyin:

```cpp
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

void setup() {
  Serial.begin(115200);
  Serial.println("Basit BLE Yayın Başlatılıyor...");
  
  BLEDevice::init("ESP32-Test");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(BLEUUID("12345678-1234-1234-1234-123456789abc"));
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
    BLEUUID("12345678-1234-1234-1234-123456789abd"),
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
  );
  
  pCharacteristic->setValue("Test");
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(BLEUUID("12345678-1234-1234-1234-123456789abc"));
  BLEDevice::startAdvertising();
  
  Serial.println("Yayın başlatıldı! 'ESP32-Test' adlı cihazı arayın");
}

void loop() {
  delay(1000);
}
```

---

## ✅ Başarılı Test Belirtileri

### Serial Monitor'de:
```
ESP32 BLE Yayın Başlatılıyor...
========================================
Yayın başlatıldı! Cihaz adı: ESP32-Test-Cihazi
========================================
Yayın durumu: AKTİF
========================================
```

### Telefon Uygulamasında:
- ✅ "ESP32-Test-Cihazi" cihaz listesinde görünür
- ✅ Terminal'de "=== CİHAZ BULUNDU ===" mesajı görünür
- ✅ Cihaza bağlanabilirsiniz

### nRF Connect'te:
- ✅ "ESP32-Test-Cihazi" görünür
- ✅ RSSI değeri görünür (-30 ile -90 arası normal)

---

## 🆘 Hala Çalışmıyorsa

1. **Serial Monitor çıktısını paylaşın** - Ne görüyorsunuz?
2. **nRF Connect test sonucunu paylaşın** - Görünüyor mu?
3. **Telefon terminal loglarını paylaşın** - Hangi mesajlar var?
4. **ESP32 modelini belirtin** - Hangi ESP32 kullanıyorsunuz?

---

## 💡 İpuçları

1. **İlk test için ESP32'yi telefonun yanına getirin** (10-20 cm)
2. **Serial Monitor'ü açık tutun** - Hata mesajlarını görebilirsiniz
3. **nRF Connect ile karşılaştırın** - Sorunun nerede olduğunu anlayın
4. **ESP32'yi reset edin** - Bazen basit çözüm işe yarar

