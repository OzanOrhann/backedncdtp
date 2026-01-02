# 🔧 Serial Monitor'de Hiçbir Şey Görünmüyor - Sorun Giderme

## ❓ Sorun: Serial Monitor boş, hiçbir şey yazmıyor

### 🔍 Kontrol Listesi

---

## 1. Baud Rate Kontrolü

### ✅ Doğru Baud Rate: 115200

**Kontrol:**
1. Serial Monitor'ü açın
2. **Sağ alt köşede** baud rate'i kontrol edin
3. **115200** seçili olmalı

**Düzeltme:**
- Serial Monitor penceresinin **sağ alt köşesinde** baud rate seçeneği var
- **115200** seçin
- Eğer yoksa, kodda `Serial.begin(115200);` olduğundan emin olun

---

## 2. Port Seçimi

### ✅ Doğru Port Seçili mi?

**Kontrol:**
1. **Tools → Port** menüsüne bakın
2. ESP32'nin bağlı olduğu port seçili mi?

**Düzeltme:**
- ESP32'yi USB'den çıkarın
- Port listesine bakın (hangi port kayboldu?)
- ESP32'yi tekrar takın
- Yeni görünen port'u seçin

**Mac'te port isimleri:**
- `/dev/cu.usbserial-...`
- `/dev/cu.SLAB_USBtoUART`
- `/dev/cu.wchusbserial...`

**Windows'ta port isimleri:**
- `COM3`
- `COM4`
- `COM5`

---

## 3. ESP32 Reset Edin

### ✅ ESP32'yi Reset Edin

**Yöntem 1: Reset Butonu**
1. ESP32'de **RESET** butonuna basın
2. Serial Monitor'ü kontrol edin
3. Mesajlar görünmeli

**Yöntem 2: USB'yi Çıkarıp Takın**
1. ESP32'yi USB'den çıkarın
2. 5 saniye bekleyin
3. USB'yi tekrar takın
4. Serial Monitor'ü kontrol edin

**Yöntem 3: Arduino IDE'den Reset**
1. **Tools → Serial Monitor**'ü kapatın
2. ESP32'yi USB'den çıkarın
3. USB'yi tekrar takın
4. Serial Monitor'ü tekrar açın

---

## 4. Kod Yüklendi mi?

### ✅ Kodun Yüklendiğinden Emin Olun

**Kontrol:**
1. Arduino IDE'de **Upload** butonuna bastınız mı?
2. Yükleme sırasında hata var mıydı?
3. "Done uploading" mesajını gördünüz mü?

**Düzeltme:**
- Kodu tekrar yükleyin
- Hata mesajlarını okuyun
- Board ve port seçimini kontrol edin

---

## 5. Serial Monitor Açık mı?

### ✅ Serial Monitor'ü Açın

**Kontrol:**
1. **Tools → Serial Monitor** (Ctrl+Shift+M / Cmd+Shift+M)
2. Pencere açık mı?
3. Aktif mi? (başka pencereye geçmiş olabilir)

**Düzeltme:**
- Serial Monitor'ü kapatıp açın
- Arduino IDE'yi yeniden başlatın

---

## 6. Kod Çalışıyor mu?

### ✅ Basit Test Kodu

Eğer hala çalışmıyorsa, basit bir test kodu deneyin:

```cpp
void setup() {
  Serial.begin(115200);
  delay(1000); // Serial başlatılana kadar bekle
  Serial.println("ESP32 ÇALIŞIYOR!");
  Serial.println("Bu mesajı görüyorsanız kod çalışıyor!");
}

void loop() {
  Serial.println("Loop çalışıyor: " + String(millis() / 1000) + " saniye");
  delay(1000);
}
```

**Bu kodu yükleyin:**
- Eğer bu mesajları görüyorsanız → ESP32 çalışıyor, sorun BLE kodunda
- Eğer bu mesajları görmüyorsanız → ESP32 veya Serial bağlantısı sorunu

---

## 7. Driver Sorunu (Windows)

### ✅ USB Driver Yüklü mü?

**Windows'ta:**
- ESP32 için USB driver gerekebilir
- **CP2102** veya **CH340** driver'ları

**Kontrol:**
1. Device Manager'ı açın
2. "Ports (COM & LPT)" bölümüne bakın
3. ESP32 görünüyor mu?
4. Sarı ünlem işareti var mı?

**Düzeltme:**
- Driver'ı indirip yükleyin
- ESP32'nin hangi chip'i kullandığını öğrenin (CP2102, CH340, vb.)

---

## 8. Mac'te Port İzni

### ✅ Mac'te Port İzni Verildi mi?

**Mac'te ilk kullanımda:**
- System Preferences → Security & Privacy
- Port erişim izni istenebilir

**Kontrol:**
- System Preferences'ı kontrol edin
- İzin isteyen uygulamalar var mı?

---

## 9. Arduino IDE Ayarları

### ✅ Arduino IDE Ayarları

**Kontrol:**
1. **Tools → Board** → ESP32 Dev Module seçili mi?
2. **Tools → Port** → Doğru port seçili mi?
3. **Tools → Upload Speed** → 115200 veya 921600

**Düzeltme:**
- Board'u tekrar seçin
- Port'u tekrar seçin
- Upload speed'i kontrol edin

---

## 10. Serial Monitor Ayarları

### ✅ Serial Monitor Ayarları

**Kontrol:**
1. Serial Monitor penceresinin **sağ alt köşesi**
2. **"No line ending"** yerine **"Newline"** veya **"Both NL & CR"** seçin
3. **Baud rate: 115200**

**Düzeltme:**
- Line ending'i değiştirin
- Baud rate'i kontrol edin
- Serial Monitor'ü kapatıp açın

---

## 🔧 Hızlı Çözüm Adımları

### Adım 1: Serial Monitor'ü Kontrol Edin
1. **Tools → Serial Monitor** (Ctrl+Shift+M)
2. **Baud rate: 115200** seçin
3. **"Newline"** seçin

### Adım 2: Port'u Kontrol Edin
1. **Tools → Port**
2. ESP32'nin port'unu seçin
3. Port listesinde görünüyor mu?

### Adım 3: ESP32'yi Reset Edin
1. ESP32'de **RESET** butonuna basın
2. Serial Monitor'ü kontrol edin

### Adım 4: Basit Test Kodu Deneyin
Yukarıdaki basit test kodunu yükleyin ve çalışıp çalışmadığını kontrol edin

---

## ✅ Başarılı Serial Monitor Çıktısı

**Görmeniz gereken:**

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

---

## 🆘 Hala Çalışmıyorsa

### Debug Adımları:

1. **Basit test kodunu yükleyin** (yukarıda)
2. **Serial Monitor çıktısını paylaşın**
3. **Hata mesajlarını paylaşın** (varsa)
4. **ESP32 modelini belirtin**
5. **İşletim sistemini belirtin** (Mac/Windows/Linux)

---

## 💡 İpuçları

1. **Serial Monitor'ü kod yüklemeden ÖNCE açın** - Bazen daha iyi çalışır
2. **ESP32'yi reset edin** - İlk bağlantıda reset gerekebilir
3. **USB kablosunu değiştirin** - Bazen kablo sorunu olabilir
4. **Farklı USB port'u deneyin** - Bazen port sorunu olabilir
5. **Arduino IDE'yi yeniden başlatın** - Bazen IDE sorunu olabilir

