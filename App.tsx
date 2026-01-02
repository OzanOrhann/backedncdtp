import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BleManager from 'react-native-ble-manager';
import * as Notifications from 'expo-notifications';
import * as DeviceInfo from 'expo-device';

// Bildirim handler'ı ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  advertising: any;
}

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [bleAvailable, setBleAvailable] = useState(false);
  const [bleEnabled, setBleEnabled] = useState(false);
  const devicesRef = useRef<BluetoothDevice[]>([]); // State güncellemesi için ref

  useEffect(() => {
    // İzinleri kontrol et ve iste
    requestPermissions();

    // Bildirim izinlerini kontrol et
    registerForPushNotificationsAsync();

    // BleManager'ı başlat
    const initBle = async () => {
      try {
        // Önce BleManager'ı başlat
        await BleManager.start({ showAlert: false });
        console.log('BleManager başlatıldı');
        
        // Bluetooth'u aç
        await BleManager.enableBluetooth();
        console.log('Bluetooth açık');
        setBleEnabled(true);
        setBleAvailable(true);
      } catch (error) {
        console.error('Bluetooth başlatma hatası:', error);
        setBleAvailable(false);
        Alert.alert(
          'Hata',
          'Bluetooth modülü yüklenemedi. Lütfen development build kullanın. Expo Go desteklenmiyor.'
        );
      }
    };

    initBle();

    // Event listener'ları ayarla - react-native-ble-manager için doğru yöntem
    let bleManagerEmitter: NativeEventEmitter;
    
    try {
      // react-native-ble-manager için NativeEventEmitter
      // ÖNEMLİ: NativeModules.BleManager modülünü kullan
      const BleManagerModule = NativeModules.BleManager;
      if (BleManagerModule) {
        bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
        console.log('✓ EventEmitter oluşturuldu (BleManager modülü ile)');
        console.log('BleManager modülü:', BleManagerModule);
      } else {
        console.warn('BleManager modülü bulunamadı, fallback kullanılıyor');
        bleManagerEmitter = new NativeEventEmitter();
      }
    } catch (error) {
      console.error('EventEmitter oluşturma hatası:', error);
      bleManagerEmitter = new NativeEventEmitter();
    }
    
    // Cihaz bulunduğunda event listener
    // react-native-ble-manager event isimleri: 'BleManagerDiscoverPeripheral'
    const discoverPeripheralListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (data: any) => {
        console.log('🔵 === CİHAZ BULUNDU EVENT TETİKLENDİ ===');
        console.log('Ham veri:', data);
        console.log('Veri tipi:', typeof data);
        console.log('Veri keys:', Object.keys(data || {}));
        
        // Veriyi BluetoothDevice formatına çevir
        const device: BluetoothDevice = {
          id: data.id || data.peripheral || '',
          name: data.name || data.advertising?.localName || 'İsimsiz',
          rssi: data.rssi || 0,
          advertising: data.advertising || {},
        };
        
        console.log('İşlenmiş cihaz:', device);
        console.log('Cihaz ID:', device.id);
        console.log('Cihaz İsim:', device.name);
        console.log('Cihaz RSSI:', device.rssi);
        console.log('========================================');
        
        if (device && device.id) {
          console.log('Cihaz verisi işleniyor...');
          setDevices((prevDevices) => {
            const exists = prevDevices.find((d) => d.id === device.id);
            if (!exists) {
              console.log('✅ Yeni cihaz listeye eklendi:', device.name || device.id);
              const newDevices = [...prevDevices, device];
              devicesRef.current = newDevices; // Ref'i güncelle
              console.log('📊 Toplam cihaz sayısı:', newDevices.length);
              console.log('🔄 Cihaz listesi güncellendi, UI yenilenecek');
              return newDevices;
            } else {
              console.log('⚠️ Cihaz zaten listede:', device.id);
            }
            return prevDevices;
          });
        } else {
          console.warn('❌ Geçersiz cihaz verisi - ID yok:', data);
        }
      }
    );
    
    console.log('✅ Event listener kuruldu: BleManagerDiscoverPeripheral');
    console.log('Event listener aktif, cihazlar bekleniyor...');

    const stopScanListener = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        console.log('Tarama durdu');
        setIsScanning(false);
      }
    );

    const connectListener = bleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      (data: { peripheral: string }) => {
        console.log('Cihaz bağlandı:', data.peripheral);
        setConnectedDevice(data.peripheral);
        Alert.alert('Başarılı', 'Cihaz bağlandı');
        startNotification(data.peripheral);
      }
    );

    const disconnectListener = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      (data: { peripheral: string }) => {
        console.log('Cihaz bağlantısı kesildi:', data.peripheral);
        setConnectedDevice(null);
        setReceivedData([]);
        Alert.alert('Bilgi', 'Cihaz bağlantısı kesildi');
      }
    );

    const updateValueListener = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      (data: { value: number[]; peripheral: string; characteristic: string; service: string }) => {
        console.log('Veri alındı:', data);
        try {
          // Byte array'i string'e çevir
          const bytes = data.value;
          let decodedData = '';
          for (let i = 0; i < bytes.length; i++) {
            decodedData += String.fromCharCode(bytes[i]);
          }
          
          setReceivedData((prev) => [decodedData, ...prev]);
          
          // Bildirim gönder
          sendNotification(
            'Bluetooth Verisi Alındı',
            `Yeni veri: ${decodedData}`
          );
        } catch (error) {
          console.error('Veri decode hatası:', error);
        }
      }
    );

    return () => {
      discoverPeripheralListener.remove();
      stopScanListener.remove();
      connectListener.remove();
      disconnectListener.remove();
      updateValueListener.remove();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        if (
          granted['android.permission.BLUETOOTH_SCAN'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.BLUETOOTH_CONNECT'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert('İzin Gerekli', 'Bluetooth izinleri gerekli');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (!DeviceInfo.isDevice) {
      Alert.alert('Uyarı', 'Bildirimler sadece fiziksel cihazlarda çalışır');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('İzin Gerekli', 'Bildirim izinleri gerekli');
      return;
    }
  };

  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null, // Hemen gönder
    });
  };

  const startScan = async () => {
    if (isScanning || !bleAvailable || !bleEnabled) {
      Alert.alert('Uyarı', 'Bluetooth açık değil veya hazır değil');
      return;
    }

    try {
      // Bluetooth state kontrolü
      const state = await BleManager.checkState();
      console.log('Bluetooth durumu:', state);
      
      if (state !== 'on') {
        Alert.alert('Uyarı', 'Lütfen Bluetooth\'u açın');
        return;
      }

      setIsScanning(true);
      setDevices([]);
      
      console.log('Tarama başlatılıyor...');
      console.log('Not: Cihazların yayın (advertising) yapması gerekir');
      console.log('ESP32\'nin açık ve yakında olduğundan emin olun');
      
      // react-native-ble-manager scan: tüm cihazları tara
      // scan() - parametresiz, tüm cihazları tarar
      try {
        console.log('Scan() fonksiyonu çağrılıyor...');
        BleManager.scan();
        console.log('✓ Scan() fonksiyonu başarıyla çağrıldı');
        console.log('Event listener aktif, cihazlar dinleniyor...');
        console.log('BleManager modülü kontrol:', NativeModules.BleManager ? 'Mevcut ✓' : 'Yok ✗');
      } catch (scanError) {
        console.error('❌ Scan() hatası:', scanError);
        Alert.alert('Hata', `Tarama başlatılamadı: ${scanError}`);
        throw scanError;
      }
      
      console.log('Tarama başlatıldı, 10 saniye sürecek...');
      console.log('Yakındaki BLE cihazları aranıyor...');
      console.log('⚠️ Eğer cihaz görünmüyorsa, event listener çalışmıyor olabilir');
      
      // Alternatif: getDiscoveredPeripherals() ile periyodik kontrol
      // Event listener çalışmıyorsa bu yöntem kullanılabilir
      const checkInterval = setInterval(async () => {
        try {
          const discovered = await BleManager.getDiscoveredPeripherals();
          console.log('getDiscoveredPeripherals() sonucu:', discovered);
          if (discovered && discovered.length > 0) {
            console.log('✅ getDiscoveredPeripherals ile cihazlar bulundu:', discovered.length);
            const formattedDevices: BluetoothDevice[] = discovered.map((p: any) => ({
              id: p.id || p.peripheral || '',
              name: p.name || p.advertising?.localName || 'İsimsiz',
              rssi: p.rssi || 0,
              advertising: p.advertising || {},
            }));
            setDevices(formattedDevices);
            devicesRef.current = formattedDevices;
          }
        } catch (error) {
          console.error('getDiscoveredPeripherals hatası:', error);
        }
      }, 2000); // Her 2 saniyede bir kontrol et
      
      // 10 saniye sonra otomatik durdur
      setTimeout(async () => {
        clearInterval(checkInterval); // Interval'i temizle
        console.log('10 saniye doldu, tarama durduruluyor...');
        await stopScan();
        // State güncellemesi tamamlanana kadar bekle
        setTimeout(() => {
          const currentDeviceCount = devicesRef.current.length;
          console.log('Bulunan cihaz sayısı (ref):', currentDeviceCount);
          console.log('Bulunan cihaz sayısı (state):', devices.length);
          console.log('Bulunan cihazlar:', devicesRef.current.map(d => d.name || d.id));
          
          if (currentDeviceCount === 0) {
            Alert.alert(
              'Bilgi', 
              'Cihaz bulunamadı.\n\n' +
              'Kontrol edin:\n' +
              '1. ESP32 açık ve yayın yapıyor mu?\n' +
              '2. Konum servisi açık mı? (Android)\n' +
              '3. İzinler verildi mi?\n' +
              '4. ESP32 yakında mı? (10-20 cm)\n\n' +
              'Event listener çalışmıyor olabilir, getDiscoveredPeripherals() denendi.'
            );
          } else {
            console.log('✅ Cihazlar bulundu!');
          }
        }, 500);
      }, 10000);
    } catch (error) {
      console.error('Tarama hatası:', error);
      setIsScanning(false);
      Alert.alert('Hata', `Cihaz taraması başlatılamadı: ${error}`);
    }
  };

  const stopScan = async () => {
    try {
      await BleManager.stopScan();
      setIsScanning(false);
    } catch (error) {
      console.error('Tarama durdurma hatası:', error);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      stopScan();
      
      await BleManager.connect(device.id);
      setConnectedDevice(device.id);
      
      // Servisleri keşfet
      await BleManager.retrieveServices(device.id);
      
      Alert.alert('Başarılı', `${device.name || 'Cihaz'} bağlandı`);
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      Alert.alert('Hata', 'Cihaza bağlanılamadı');
    }
  };

  // UUID ile direkt bağlanma (kısa scan ile)
  const connectByUUID = async () => {
    // ESP32'nin servis UUID'si (ESP32 kodundan)
    const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
    const ESP32_DEVICE_NAME = 'ESP32-Test-Cihazi';
    
    try {
      if (!bleAvailable || !bleEnabled) {
        Alert.alert('Uyarı', 'Bluetooth hazır değil');
        return;
      }

      console.log('UUID ile bağlanma deneniyor...');
      console.log('Servis UUID:', ESP32_SERVICE_UUID);
      
      // Kısa bir tarama yap (sadece ESP32'yi bulmak için)
      setIsScanning(true);
      setDevices([]);
      
      // Servis UUID'sine göre filtreli tarama
      // Not: react-native-ble-manager scan() parametresiz veya service UUID array'i alır
      // Filtreli tarama için önce normal scan yapıp sonra filtreleriz
      BleManager.scan();
      
      console.log('Filtreli tarama başlatıldı (5 saniye)...');
      
      // 5 saniye bekle ve ESP32'yi bul
      setTimeout(async () => {
        await BleManager.stopScan();
        setIsScanning(false);
        
        console.log('Tarama tamamlandı, bulunan cihaz sayısı:', devices.length);
        
        // ESP32'yi bul (isim veya ID'ye göre)
        const esp32Device = devices.find(d => 
          d.name === ESP32_DEVICE_NAME || 
          d.name?.toLowerCase().includes('esp32')
        );
        
        if (esp32Device) {
          console.log('ESP32 bulundu:', esp32Device.name || esp32Device.id);
          console.log('Bağlanılıyor...');
          await connectToDevice(esp32Device);
        } else {
          console.log('ESP32 bulunamadı');
          Alert.alert(
            'ESP32 Bulunamadı', 
            'Lütfen ESP32\'nin açık ve yakında olduğundan emin olun.\n\n' +
            'Servis UUID: ' + ESP32_SERVICE_UUID
          );
        }
      }, 5000);
      
    } catch (error) {
      console.error('UUID bağlantı hatası:', error);
      Alert.alert('Hata', `UUID ile bağlanılamadı: ${error}`);
      setIsScanning(false);
    }
  };

  const startNotification = async (peripheralId: string) => {
    try {
      // retrieveServices sonrası servisler event'lerden gelir
      // Basit yaklaşım: Tüm karakteristikler için notification dene
      // Not: Gerçek uygulamada servis ve karakteristik UUID'lerini bilmeniz gerekir
      
      // Örnek: Bilinen bir servis ve karakteristik için
      // Bu kısmı kendi Bluetooth cihazınızın UUID'lerine göre düzenleyin
      try {
        // Genel servis ve karakteristik örneği (kendi cihazınıza göre değiştirin)
        // await BleManager.startNotification(peripheralId, 'SERVICE_UUID', 'CHARACTERISTIC_UUID');
        console.log('Notification başlatıldı. Servis/karakteristik UUID\'lerini cihazınıza göre ayarlayın.');
      } catch (error) {
        console.error('Notification başlatma hatası:', error);
      }
    } catch (error) {
      console.error('Notification hatası:', error);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await BleManager.disconnect(connectedDevice);
        setConnectedDevice(null);
        setReceivedData([]);
      } catch (error) {
        console.error('Bağlantı kesme hatası:', error);
      }
    }
  };

  if (!bleAvailable) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Bluetooth Modülü Yüklenemedi</Text>
          <Text style={styles.errorText}>
            Bu uygulama native modüller gerektirir ve Expo Go'da çalışmaz.
          </Text>
          <Text style={styles.errorText}>
            Lütfen development build kullanın:
          </Text>
          <Text style={styles.codeText}>
            npx expo run:android
          </Text>
          <Text style={styles.codeText}>
            veya
          </Text>
          <Text style={styles.codeText}>
            npx expo run:ios
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Veri Alıcı</Text>
        {connectedDevice && (
          <Text style={styles.connectedText}>
            Bağlı: {devices.find(d => d.id === connectedDevice)?.name || 'Cihaz'}
          </Text>
        )}
        {!bleEnabled && (
          <Text style={styles.warningText}>
            Bluetooth açık değil
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!isScanning && !connectedDevice && (
          <>
            <TouchableOpacity 
              style={[styles.button, !bleEnabled && styles.buttonDisabled]} 
              onPress={startScan}
              disabled={!bleEnabled}
            >
              <Text style={styles.buttonText}>Cihazları Tara</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.uuidButton, !bleEnabled && styles.buttonDisabled]} 
              onPress={connectByUUID}
              disabled={!bleEnabled}
            >
              <Text style={styles.buttonText}>ESP32'ye Direkt Bağlan (UUID)</Text>
            </TouchableOpacity>
          </>
        )}

        {isScanning && (
          <TouchableOpacity style={styles.button} onPress={stopScan}>
            <Text style={styles.buttonText}>Taramayı Durdur</Text>
          </TouchableOpacity>
        )}

        {connectedDevice && (
          <TouchableOpacity style={styles.disconnectButton} onPress={disconnectDevice}>
            <Text style={styles.buttonText}>Bağlantıyı Kes</Text>
          </TouchableOpacity>
        )}
      </View>

      {!connectedDevice && (
        <ScrollView style={styles.deviceList}>
          <Text style={styles.sectionTitle}>Bulunan Cihazlar:</Text>
          {devices.length === 0 ? (
            <Text style={styles.emptyText}>
              {isScanning ? 'Cihazlar aranıyor...' : 'Henüz cihaz bulunamadı'}
            </Text>
          ) : (
            devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() => connectToDevice(device)}
              >
                <Text style={styles.deviceName}>{device.name || 'Bilinmeyen Cihaz'}</Text>
                <Text style={styles.deviceId}>{device.id}</Text>
                <Text style={styles.deviceRssi}>RSSI: {device.rssi}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {connectedDevice && (
        <ScrollView style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Alınan Veriler:</Text>
          {receivedData.length === 0 ? (
            <Text style={styles.emptyText}>Henüz veri alınmadı...</Text>
          ) : (
            receivedData.map((data, index) => (
              <View key={index} style={styles.dataItem}>
                <Text style={styles.dataText}>{data}</Text>
                <Text style={styles.dataTime}>
                  {new Date().toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  connectedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 10,
  },
  uuidButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    flex: 1,
    padding: 20,
  },
  dataContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#999',
  },
  dataItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  dataText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  dataTime: {
    fontSize: 12,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    color: '#333',
  },
});
