# 🔧 Event Listener Çalışmıyor - Sorun Giderme

## ❓ Sorun: Event listener'lar çalışmıyor, hiçbir cihaz bulunamıyor

### 🔍 Durum:
- ✅ ESP32 yayın yapıyor (Serial Monitor'de görünüyor)
- ✅ ESP32 telefon Bluetooth ayarlarında görünüyor
- ✅ Scan() fonksiyonu çağrılıyor
- ❌ Event listener'lar çalışmıyor ("=== CİHAZ BULUNDU ===" mesajı yok)
- ❌ Hiçbir cihaz bulunamıyor

---

## 🔧 Çözüm 1: Event Listener Alternatif Kurulumu

react-native-ble-manager'ın event listener'ları bazen çalışmayabilir. Alternatif yöntemler:

### Yöntem A: NativeModules Kontrolü

```typescript
// NativeModules.BleManager'ın varlığını kontrol et
console.log('NativeModules:', NativeModules);
console.log('BleManager modülü:', NativeModules.BleManager);

if (NativeModules.BleManager) {
  const emitter = new NativeEventEmitter(NativeModules.BleManager);
  // Event listener'ları kur
}
```

### Yöntem B: Farklı Event İsimleri

react-native-ble-manager'ın farklı versiyonlarında event isimleri farklı olabilir:

- `BleManagerDiscoverPeripheral` (standart)
- `BleManagerDidDiscoverPeripheral` (alternatif)
- `discoverPeripheral` (alternatif)

---

## 🔧 Çözüm 2: getDiscoveredPeripherals() Kullan

Event listener'lar çalışmıyorsa, periyodik olarak bulunan cihazları kontrol edebilirsiniz:

```typescript
// Her 2 saniyede bir bulunan cihazları kontrol et
setInterval(async () => {
  try {
    const peripherals = await BleManager.getDiscoveredPeripherals();
    console.log('Bulunan cihazlar:', peripherals);
    if (peripherals && peripherals.length > 0) {
      setDevices(peripherals);
    }
  } catch (error) {
    console.error('getDiscoveredPeripherals hatası:', error);
  }
}, 2000);
```

---

## 🔧 Çözüm 3: react-native-ble-plx'e Geri Dön

Eğer react-native-ble-manager çalışmıyorsa, react-native-ble-plx'e geri dönebilirsiniz:

```bash
npm uninstall react-native-ble-manager
npm install react-native-ble-plx
```

---

## 🔧 Çözüm 4: Development Build Yeniden Yap

Bazen native modüller düzgün yüklenmemiş olabilir:

```bash
# Yeni build yap
eas build --platform android --profile development
```

---

## 📋 Kontrol Listesi

- [ ] NativeModules.BleManager mevcut mu?
- [ ] Event listener'lar kuruldu mu?
- [ ] Event isimleri doğru mu?
- [ ] Konum servisi açık mı? (Android)
- [ ] İzinler verildi mi?
- [ ] Development build güncel mi?

---

## 🆘 Hala Çalışmıyorsa

1. **getDiscoveredPeripherals() yöntemini deneyin** (yukarıda)
2. **react-native-ble-plx'e geri dönün**
3. **Development build'i yeniden yapın**

