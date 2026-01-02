import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface RemoteMonitoringProps {
  onBack: () => void;
}

export default function RemoteMonitoring({ onBack }: RemoteMonitoringProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Uzaktan Katılıyorum</Text>
      </View>

      {/* Kalp Atışı Göstergesi */}
      <View style={styles.heartRateContainer}>
        <View style={styles.heartIconContainer}>
          <Text style={styles.heartIcon}>❤️</Text>
        </View>
        <Text style={styles.heartRateLabel}>Kalp Atışı</Text>
        <Text style={styles.heartRateValue}>--</Text>
        <Text style={styles.heartRateUnit}>BPM</Text>
      </View>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ortalama</Text>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statUnit}>BPM</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Maksimum</Text>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statUnit}>BPM</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Minimum</Text>
          <Text style={styles.statValue}>--</Text>
          <Text style={styles.statUnit}>BPM</Text>
        </View>
      </View>

      {/* Grafik Alanı (Placeholder) */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>
          Kalp Atışı Grafiği
        </Text>
        <Text style={styles.chartSubtext}>
          Grafik burada gösterilecek
        </Text>
      </View>

      {/* Durum Bilgisi */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, styles.statusDotInactive]} />
          <Text style={styles.statusText}>Bağlantı Bekleniyor</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  heartRateContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heartIconContainer: {
    marginBottom: 15,
  },
  heartIcon: {
    fontSize: 60,
  },
  heartRateLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  heartRateValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  heartRateUnit: {
    fontSize: 18,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statUnit: {
    fontSize: 12,
    color: '#999',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartPlaceholder: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#999',
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusDotInactive: {
    backgroundColor: '#ccc',
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
});

