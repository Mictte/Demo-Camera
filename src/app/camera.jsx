import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Necesitamos acceso a la cámara para tomar fotos.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Dar permiso</Text>
        </Pressable>
      </View>
    );
  }

  const toggleFacing = () => {
    setReady(false);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {
      Alert.alert("Take a photo!")
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.controls}>
        <View style={styles.side} />
        <Pressable
          style={[styles.shutter, (!ready || busy) && styles.disabled]}
          onPress={takePhoto}
          disabled={!ready || busy}
          accessibilityLabel="Tomar foto"
        >
          {busy ? <ActivityIndicator color="#000" /> : <View style={styles.shutterInner} />}
        </Pressable>
        <View style={styles.side}>
          <Pressable style={styles.flip} onPress={toggleFacing} accessibilityLabel="Cambiar cámara">
            <Text style={styles.flipText}>Voltear</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  message: { fontSize: 16, textAlign: 'center' },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  side: { flex: 1, alignItems: 'flex-end' },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  disabled: { opacity: 0.5 },
  flip: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  flipText: { color: '#fff', fontWeight: '600' },
});
