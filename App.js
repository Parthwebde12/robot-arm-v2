import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Animated, Platform, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ControlPad } from './src/components/ControlPad';

//improve the structure



const TelemetryData = () => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0, pitch: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        x: (Math.random() * 100).toFixed(2),
        y: (Math.random() * 100).toFixed(2),
        z: (Math.random() * 100).toFixed(2),
        pitch: (Math.random() * 360).toFixed(1),
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.telemetryContainer} pointerEvents="none">
      <Text style={styles.telemetryHeader}>TELEMETRY</Text>
      <Text style={styles.telemetryText}>POS X: {data.x}</Text>
      <Text style={styles.telemetryText}>POS Y: {data.y}</Text>
      <Text style={styles.telemetryText}>POS Z: {data.z}</Text>
      <Text style={styles.telemetryText}>PITCH: {data.pitch}°</Text>
      <Text style={styles.telemetryText}>TEMP: 34.2°C</Text>
    </View>
  );
};

const SystemStatus = () => {
  return (
    <View style={styles.systemStatusContainer} pointerEvents="none">
      <Text style={styles.telemetryHeader}>SYSTEM STATUS</Text>
      
      <View style={styles.statRow}>
        <Ionicons name="battery-charging" size={14} color="#00ffaa" />
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: '85%', backgroundColor: '#00ffaa' }]} />
        </View>
        <Text style={styles.statText}>85%</Text>
      </View>

      <View style={styles.statRow}>
        <Ionicons name="wifi" size={14} color="#00f3ff" />
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: '92%', backgroundColor: '#00f3ff' }]} />
        </View>
        <Text style={styles.statText}>92%</Text>
      </View>

      <View style={styles.statRow}>
        <Ionicons name="hardware-chip" size={14} color="#ffaa00" />
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: '45%', backgroundColor: '#ffaa00' }]} />
        </View>
        <Text style={styles.statText}>45%</Text>
      </View>
    </View>
  );
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const cameraRef = useRef(null);

  const warningOpacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (!isCameraEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(warningOpacity, { toValue: 0.3, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      warningOpacity.setValue(1);
    }
  }, [isCameraEnabled]);

  if (!permission) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>Loading Telemetry...</Text></View>;
  }

  const toggleFacing = () => setFacing(f => (f === 'back' ? 'front' : 'back'));
  const toggleFlash = () => setFlash(f => (f === 'off' ? 'on' : 'off'));
  const toggleCamera = () => setIsCameraEnabled(prev => !prev);
  
  const takeSnapshot = async () => {
    if (cameraRef.current && isCameraEnabled) {
      try {
        await cameraRef.current.takePictureAsync();
        alert(`Snapshot captured successfully!`);
      } catch (e) {
        console.log("Snapshot failed", e);
      }
    }
  };

  const renderCameraOrFallback = () => {
    if (!isCameraEnabled || !permission.granted) {
      return (
        <View style={styles.noCameraContainer}>
          <View style={styles.gridOverlay} />
          <View style={styles.noCameraCenter}>
            <Animated.View style={{ opacity: warningOpacity, alignItems: 'center' }}>
              <Ionicons name="warning-outline" size={100} color="#ff3366" />
              <Text style={styles.noCameraText}>OPTICS OFFLINE</Text>
            </Animated.View>
            <Text style={styles.noCameraSubtext}>Manual control engaged via tactile sensors</Text>
            
            {!permission.granted && isCameraEnabled && (
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>GRANT CAMERA ACCESS</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
        facing={facing} 
        enableTorch={flash === 'on'}
        ref={cameraRef}
      >
        <View style={styles.reticleContainer} pointerEvents="none">
          <View style={styles.reticleTopLeft} />
          <View style={styles.reticleTopRight} />
          <View style={styles.reticleBottomLeft} />
          <View style={styles.reticleBottomRight} />
          <Ionicons name="scan" size={120} color="rgba(0, 243, 255, 0.2)" />
        </View>
      </CameraView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {renderCameraOrFallback()}
      
      <TelemetryData />
      <SystemStatus />

      <BlurView intensity={80} tint="dark" style={styles.topHud}>
        <View style={styles.statusGroup}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, isCameraEnabled ? styles.glowGreen : styles.glowRed]} />
            <Text style={styles.statusText}>{isCameraEnabled ? 'OPTICS: ACTIVE' : 'OPTICS: DISABLED'}</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, styles.glowGreen]} />
            <Text style={styles.statusText}>SYS: CONNECTED</Text>
          </View>
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity style={[styles.iconBtn, !isCameraEnabled && styles.iconBtnDisabled]} onPress={toggleFlash} disabled={!isCameraEnabled}>
            <Ionicons name={flash === 'on' ? "flashlight" : "flashlight-outline"} size={22} color={isCameraEnabled && flash === 'on' ? "#00f3ff" : "#888"} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.iconBtn, !isCameraEnabled && styles.iconBtnDisabled]} onPress={toggleFacing} disabled={!isCameraEnabled}>
            <Ionicons name="camera-reverse" size={24} color={isCameraEnabled ? "#fff" : "#888"} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, styles.captureBtn, !isCameraEnabled && styles.iconBtnDisabled]} onPress={takeSnapshot} disabled={!isCameraEnabled}>
            <Ionicons name="aperture" size={28} color={isCameraEnabled ? "#00f3ff" : "#888"} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconBtn, isCameraEnabled ? styles.toggleOn : styles.toggleOff]} onPress={toggleCamera}>
            <Ionicons name={isCameraEnabled ? "eye" : "eye-off"} size={24} color={isCameraEnabled ? "#00f3ff" : "#ff3366"} />
          </TouchableOpacity>
        </View>
      </BlurView>

      <ControlPad />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020406' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020406' },
  loadingText: { color: '#00f3ff', fontSize: 16, letterSpacing: 2 },
  
  telemetryContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderColor: '#00f3ff',
  },
  systemStatusContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
    borderRightWidth: 2,
    borderColor: '#00ffaa',
    width: 140,
  },
  telemetryHeader: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 8, opacity: 0.8 },
  telemetryText: { color: '#00f3ff', fontSize: 12, fontFamily: Platform?.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1, marginBottom: 4 },
  
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' },
  barBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 8, borderRadius: 2 },
  barFill: { height: '100%', borderRadius: 2 },
  statText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  noCameraContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0f14', justifyContent: 'center', alignItems: 'center' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.15, borderWidth: 2, borderColor: '#00f3ff', borderStyle: 'dashed', margin: 15, borderRadius: 30 },
  noCameraCenter: { alignItems: 'center' },
  noCameraText: { color: '#ff3366', fontSize: 28, fontWeight: '900', letterSpacing: 6, marginTop: 10, textShadowColor: 'rgba(255, 51, 102, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  noCameraSubtext: { color: '#aaa', fontSize: 12, letterSpacing: 2, marginTop: 15, textTransform: 'uppercase' },
  permissionButton: { marginTop: 40, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#00f3ff', backgroundColor: 'rgba(0, 243, 255, 0.1)' },
  permissionButtonText: { color: '#00f3ff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  
  topHud: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0, 243, 255, 0.3)', zIndex: 10 },
  statusGroup: { gap: 10 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  glowGreen: { backgroundColor: '#00ffaa', shadowColor: '#00ffaa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  glowRed: { backgroundColor: '#ff3366', shadowColor: '#ff3366', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  
  cameraControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 20 },
  iconBtnDisabled: { backgroundColor: 'transparent', opacity: 0.5 },
  captureBtn: { backgroundColor: 'rgba(0, 243, 255, 0.15)', borderWidth: 1, borderColor: 'rgba(0, 243, 255, 0.5)', padding: 10 },
  toggleOn: { backgroundColor: 'rgba(0, 243, 255, 0.15)', borderColor: '#00f3ff', borderWidth: 1 },
  toggleOff: { backgroundColor: 'rgba(255, 51, 102, 0.15)', borderColor: '#ff3366', borderWidth: 1 },
  
  reticleContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  reticleTopLeft: { position: 'absolute', top: '30%', left: '25%', width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3, borderColor: 'rgba(0, 243, 255, 0.5)' },
  reticleTopRight: { position: 'absolute', top: '30%', right: '25%', width: 40, height: 40, borderTopWidth: 3, borderRightWidth: 3, borderColor: 'rgba(0, 243, 255, 0.5)' },
  reticleBottomLeft: { position: 'absolute', bottom: '30%', left: '25%', width: 40, height: 40, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: 'rgba(0, 243, 255, 0.5)' },
  reticleBottomRight: { position: 'absolute', bottom: '30%', right: '25%', width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3, borderColor: 'rgba(0, 243, 255, 0.5)' },
});