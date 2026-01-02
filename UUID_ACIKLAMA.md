# 🔑 UUID Nedir ve Nasıl Ayarlanır?

## 📖 UUID Nedir?

**UUID** = **Universally Unique Identifier** (Evrensel Benzersiz Tanımlayıcı)

### Ne İşe Yarar?
- ✅ Her servis ve karakteristik için **benzersiz bir kimlik**
- ✅ Bluetooth cihazlarında **hangi servise/özelliğe erişeceğinizi** belirler
- ✅ **128-bit** sayı (32 karakterlik hex string)

### Örnek UUID:
```
4fafc201-1fb5-459e-8fcc-c5c9c331914b
```

---

## 🎯 Bluetooth'ta UUID Kullanımı

### 1. **Servis UUID (Service UUID)**
- Cihazın **hangi servisi** sağladığını belirler
- Örnek: Batarya servisi, sıcaklık servisi, vb.

### 2. **Karakteristik UUID (Characteristic UUID)**
- Servis içindeki **belirli bir özellik** için
- Örnek: Batarya seviyesi, sıcaklık değeri, vb.

### 3. **Cihaz Adı (Device Name)**
- Telefonda **görünecek isim**
- UUID değil, sadece isim

---

## 🔧 ESP32 Kodunda UUID'ler

### Mevcut UUID'ler:

```cpp
// Servis UUID'si
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

// Karakteristik UUID'si  
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Cihaz adı (UUID değil)
#define DEVICE_NAME "ESP32-Test-Cihazi"
```

---

## 🎨 UUID Nasıl Oluşturulur?

### Yöntem 1: Online UUID Generator (ÖNERİLEN)

1. **UUID Generator sitelerini kullanın:**
   - https://www.uuidgenerator.net/
   - https://www.uuid.org/
   - https://www.guidgenerator.com/

2. **"Generate UUID" butonuna basın**
3. **Yeni UUID alın** (örnek: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. **Kopyalayın ve kodunuza yapıştırın**

### Yöntem 2: Terminal/Command Line

**Mac/Linux:**
```bash
uuidgen
```

**Windows (PowerShell):**
```powershell
[guid]::NewGuid()
```

**Python:**
```python
import uuid
print(uuid.uuid4())
```

---

## 📝 UUID'leri Nasıl Değiştirirsiniz?

### Adım 1: Yeni UUID'ler Oluşturun

1. Yukarıdaki yöntemlerden birini kullanın
2. **2 adet UUID** oluşturun:
   - 1 tane **Servis UUID** için
   - 1 tane **Karakteristik UUID** için

### Adım 2: ESP32 Kodunda Değiştirin

**ESP32_BLE_YAYIN.ino** dosyasında:

```cpp
// ESKİ:
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// YENİ (kendi UUID'leriniz):
#define SERVICE_UUID "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
#define CHARACTERISTIC_UUID "f1e2d3c4-b5a6-9876-5432-10fedcba9876"
```

### Adım 3: Telefon Uygulamasında Değiştirin

**App.tsx** dosyasında:

```typescript
// ESKİ:
const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

// YENİ (ESP32'deki ile aynı olmalı):
const ESP32_SERVICE_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
```

**⚠️ ÖNEMLİ:** ESP32 ve telefon uygulamasındaki UUID'ler **AYNI** olmalı!

---

## 🎯 Standart Bluetooth UUID'leri

### Bluetooth SIG Standart UUID'leri:

Bazı UUID'ler standartlaştırılmıştır:

- **Batarya Servisi:** `0000180f-0000-1000-8000-00805f9b34fb`
- **Cihaz Bilgisi:** `0000180a-0000-1000-8000-00805f9b34fb`
- **Kalp Atışı:** `0000180d-0000-1000-8000-00805f9b34fb`
- **Sıcaklık:** `00001809-0000-1000-8000-00805f9b34fb`

**Kendi UUID'lerinizi kullanabilirsiniz** - Standart olmayan UUID'ler de çalışır!

---

## 💡 Pratik Örnek

### Senaryo: Kendi UUID'lerinizi Oluşturun

1. **UUID Generator'a gidin:** https://www.uuidgenerator.net/
2. **2 UUID oluşturun:**
   - Servis UUID: `12345678-1234-1234-1234-123456789abc`
   - Karakteristik UUID: `abcdef12-3456-7890-abcd-ef1234567890`

3. **ESP32 kodunda değiştirin:**
```cpp
#define SERVICE_UUID "12345678-1234-1234-1234-123456789abc"
#define CHARACTERISTIC_UUID "abcdef12-3456-7890-abcd-ef1234567890"
```

4. **Telefon uygulamasında değiştirin:**
```typescript
const ESP32_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
```

5. **Her iki kodu da yeniden yükleyin**
6. **Test edin!**

---

## 🔍 UUID Formatı

### Doğru Format:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- **32 karakter** (tireler hariç)
- **Hexadecimal** (0-9, a-f)
- **5 grup:** 8-4-4-4-12 karakter

### Örnekler:

✅ **Doğru:**
```
4fafc201-1fb5-459e-8fcc-c5c9c331914b
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

❌ **Yanlış:**
```
4fafc2011fb5459e8fccc5c9c331914b  (tireler yok)
4FAF-C201-1FB5  (çok kısa)
4fafc201-1fb5-459e-8fcc-c5c9c331914b-extra  (çok uzun)
```

---

## 🎯 Cihaz Adı vs UUID

### Cihaz Adı (Device Name):
- ✅ **İnsan tarafından okunabilir**
- ✅ Telefonda **görünen isim**
- ✅ Değiştirilebilir
- ❌ **Benzersiz olmayabilir** (başka cihazlar aynı ismi kullanabilir)

**Örnek:**
```cpp
#define DEVICE_NAME "ESP32-Test-Cihazi"
```

### UUID:
- ✅ **Benzersiz** (evrensel olarak farklı)
- ✅ **Makine tarafından okunur**
- ✅ Servis/karakteristik tanımlamak için
- ❌ İnsan tarafından hatırlanması zor

**Örnek:**
```cpp
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
```

---

## 📋 Özet Tablo

| Özellik | Cihaz Adı | Servis UUID | Karakteristik UUID |
|---------|-----------|-------------|-------------------|
| **Ne için?** | Telefonda görünen isim | Servis tanımlama | Özellik tanımlama |
| **Format** | Metin | 32 karakter hex | 32 karakter hex |
| **Benzersiz mi?** | Hayır | Evet | Evet |
| **Değiştirilebilir mi?** | Evet | Evet | Evet |
| **Örnek** | "ESP32-Test" | "4fafc201-..." | "beb5483e-..." |

---

## ✅ Hızlı Başlangıç

### Kendi UUID'lerinizi kullanmak için:

1. **UUID Generator:** https://www.uuidgenerator.net/
2. **2 UUID oluşturun**
3. **ESP32 kodunda değiştirin**
4. **Telefon uygulamasında değiştirin**
5. **Her iki kodu da yeniden yükleyin**

**⚠️ Unutmayın:** ESP32 ve telefon uygulamasındaki UUID'ler **AYNI** olmalı!

---

## 🆘 Sorun Giderme

### Sorun: UUID'ler eşleşmiyor

**Çözüm:**
- ESP32 ve telefon uygulamasındaki UUID'leri karşılaştırın
- **Kesinlikle aynı** olmalılar (büyük/küçük harf duyarlı değil)

### Sorun: UUID formatı yanlış

**Çözüm:**
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- 32 karakter (tireler hariç)
- Sadece 0-9 ve a-f karakterleri

### Sorun: UUID'ler nerede kullanılıyor?

**ESP32'de:**
- `SERVICE_UUID` - Servis tanımlama
- `CHARACTERISTIC_UUID` - Karakteristik tanımlama

**Telefon Uygulamasında:**
- `ESP32_SERVICE_UUID` - ESP32'yi bulmak için
- Bağlantı kurmak için

