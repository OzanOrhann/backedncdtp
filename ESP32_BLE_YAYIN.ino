/*
 * ESP32 BLE Yayın (Advertising) Kodu
 * Bu kod ESP32'yi BLE yayın yapan bir cihaz haline getirir
 * Telefonunuzdan bu cihazı bulabilir ve bağlanabilirsiniz
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Servis UUID'si (istediğiniz gibi değiştirebilirsiniz)
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
// Karakteristik UUID'si (istediğiniz gibi değiştirebilirsiniz)
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer *pServer = NULL;
BLECharacteristic *pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Cihaz adı (telefonda görünecek isim)
#define DEVICE_NAME "ESP32-Test-Cihazi"

// Callback: Cihaz bağlandığında
class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println(">>> CİHAZ BAĞLANDI! <<<");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println(">>> CİHAZ BAĞLANTISI KESİLDİ! <<<");
    }
};

// Callback: Veri yazıldığında
class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      // ESP32 BLE kütüphanesi std::string döndürür, String'e çevir
      std::string rxValue = pCharacteristic->getValue();
      if (rxValue.length() > 0) {
        // std::string'i String'e çevir
        String rxValueString = String(rxValue.c_str());
        Serial.println(">>> ALINAN VERİ: " + rxValueString + " <<<");
      }
    }
};

void setup() {
  // Serial başlat (Serial Monitor için)
  Serial.begin(115200);
  delay(1000); // Serial başlatılana kadar bekle (ÖNEMLİ!)
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("ESP32 BLE YAYIN BAŞLATILIYOR...");
  Serial.println("========================================");
  Serial.println();
  
  // BLE cihazını başlat
  Serial.println("[1/6] BLE cihazı başlatılıyor...");
  BLEDevice::init(DEVICE_NAME);
  Serial.println("      ✓ BLE cihazı başlatıldı");
  Serial.println("      Cihaz adı: " + String(DEVICE_NAME));
  Serial.println();
  
  // BLE Server oluştur
  Serial.println("[2/6] BLE Server oluşturuluyor...");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  Serial.println("      ✓ BLE Server oluşturuldu");
  Serial.println();

  // Servis oluştur
  Serial.println("[3/6] BLE Servis oluşturuluyor...");
  BLEService *pService = pServer->createService(SERVICE_UUID);
  Serial.println("      ✓ Servis oluşturuldu");
  Serial.println("      Servis UUID: " + String(SERVICE_UUID));
  Serial.println();

  // Karakteristik oluştur (okuma, yazma, bildirim özellikli)
  Serial.println("[4/6] Karakteristik oluşturuluyor...");
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setValue("Merhaba ESP32!");
  Serial.println("      ✓ Karakteristik oluşturuldu");
  Serial.println("      Karakteristik UUID: " + String(CHARACTERISTIC_UUID));
  Serial.println();
  
  // Servisi başlat
  Serial.println("[5/6] Servis başlatılıyor...");
  pService->start();
  Serial.println("      ✓ Servis başlatıldı");
  Serial.println();

  // Yayın (advertising) başlat
  Serial.println("[6/6] YAYIN (ADVERTISING) BAŞLATILIYOR...");
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMaxPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("      ✓ YAYIN BAŞLATILDI!");
  Serial.println();
  
  // Başarı mesajı
  Serial.println("========================================");
  Serial.println("✅ YAYIN AKTİF!");
  Serial.println("========================================");
  Serial.println("Cihaz adı: " + String(DEVICE_NAME));
  Serial.println("Servis UUID: " + String(SERVICE_UUID));
  Serial.println();
  Serial.println("📱 TELEFONUNUZDAN:");
  Serial.println("   1. Bluetooth'u açın");
  Serial.println("   2. Cihazları tarayın");
  Serial.println("   3. '" + String(DEVICE_NAME) + "' adlı cihazı bulun");
  Serial.println("   4. Bağlanın!");
  Serial.println();
  Serial.println("========================================");
  Serial.println("Yayın durumu: AKTİF (her 5 saniyede bir kontrol)");
  Serial.println("========================================");
  Serial.println();
}

void loop() {
  // Bağlantı durumu kontrolü
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println(">>> YAYIN YENİDEN BAŞLATILDI (cihaz bağlantısı kesildi) <<<");
    oldDeviceConnected = deviceConnected;
  }
  
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
  }

  // Bağlı cihaza veri gönder (her 2 saniyede bir)
  if (deviceConnected) {
    static unsigned long lastTime = 0;
    unsigned long currentTime = millis();
    
    if (currentTime - lastTime >= 2000) {
      String message = "ESP32'den veri: " + String(millis() / 1000) + " saniye";
      
      // Veriyi set et
      pCharacteristic->setValue(message.c_str());
      Serial.println(">>> VERİ SET EDİLDİ: " + message + " <<<");
      
      // Notification gönder (notify() void döndürür, sonuç kontrol edilemez)
      pCharacteristic->notify();
      Serial.println(">>> NOTIFY ÇAĞRILDI <<<");
      
      Serial.println(">>> VERİ GÖNDERİLDİ: " + message + " <<<");
      Serial.println(">>> Karakteristik değeri: " + String(pCharacteristic->getValue().c_str()) + " <<<");
      lastTime = currentTime;
    }
  } else {
    // Bağlantı yoksa log
    static unsigned long lastDisconnectedLog = 0;
    if (millis() - lastDisconnectedLog >= 5000) {
      Serial.println(">>> UYARI: Cihaz bağlı değil, veri gönderilemiyor! <<<");
      lastDisconnectedLog = millis();
    }
  }
  
  // Her 5 saniyede bir yayın durumunu göster
  static unsigned long lastStatusTime = 0;
  unsigned long currentStatusTime = millis();
  if (currentStatusTime - lastStatusTime >= 5000) {
    Serial.println("--- YAYIN DURUMU ---");
    Serial.println("   Zaman: " + String(millis() / 1000) + " saniye");
    Serial.println("   Yayın: AKTİF ✓");
    Serial.println("   Bağlı cihaz: " + String(deviceConnected ? "EVET" : "HAYIR"));
    Serial.println("   Cihaz adı: " + String(DEVICE_NAME));
    Serial.println("-------------------");
    lastStatusTime = currentStatusTime;
  }
  
  delay(100);
}

