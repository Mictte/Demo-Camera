import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Platform, Pressable, StyleSheet, Text, View, } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { MAX_PHOTO_SIZE } from '../services/photoService';

export default function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraFocused, setCameraFocused] = useState(false);

  const [permission, requestPermission, getPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);

  // Revisamos el permiso al regresar de los ajustes del teléfono.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        getPermission();
      }
    });

    return () => subscription.remove();
  }, [getPermission]);

  // Apagamos la cámara cuando cambiamos de pantalla.
  useFocusEffect(
    useCallback(() => {
      setCameraFocused(true);

      return () => {
        setCameraFocused(false);
        setReady(false);
      };
    }, [])
  );

  const toggleFacing = () => {
    setReady(false);

    setFacing((current) =>
      current === 'back' ? 'front' : 'back'
    );
  };

  // Tomamos la foto y guardamos una copia antes de mostrarla.
  const takePhoto = async () => {
    if (!ready || busy || !cameraRef.current) return;

    setBusy(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.65,
      });

      console.log('Foto capturada:', photo?.uri);

      if (!photo?.uri) {
        throw new Error('No se pudo capturar la fotografía.');
      }

      const source = new File(photo.uri);

      if (!source.exists) {
        throw new Error('No se encontró la fotografía temporal.');
      }

      console.log('Tamaño de la foto:', source.size);

      if (source.size > MAX_PHOTO_SIZE) {
        Alert.alert(
          'Foto demasiado grande',
          'La fotografía supera los 5 MB. Intenta tomar otra.'
        );
        return;
      }

      const savedPhoto = new File(
        Paths.document,
        `foto-${Date.now()}.jpg`
      );

      await source.copy(savedPhoto);

      // Comprobamos que la copia esté guardada.
      if (!savedPhoto.exists) {
        throw new Error('No se pudo guardar la copia de la foto.');
      }

      console.log('Foto guardada:', savedPhoto.uri);
      console.log('Abriendo vista previa...');

      // Corrección de la vista previa:
      // Al cambiar de pantalla, Expo Router modificaba algunos caracteres
      // de la dirección de la foto, por lo que no se podía mostrar.
      // Agregamos encodeURIComponent() para conservar la dirección correcta
      // y mostrar la fotografía sin problemas.

      router.push({
        pathname: '/photo',
        params: {
          uri: encodeURIComponent(savedPhoto.uri),
        },
      });

    } catch (error) {
      console.error('Error durante la captura:', error);

      Alert.alert(
        'Error al tomar la foto',
        error.message || 'Intenta nuevamente.'
      );

    } finally {
      setBusy(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Prueba la cámara en tu teléfono con Expo Go.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />

        <Text>
          Comprobando permiso de cámara...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Necesitamos la cámara para tomar fotografías
          y subirlas al servidor.
        </Text>

        {permission.canAskAgain && (
          <Pressable
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>
              Dar permiso
            </Text>
          </Pressable>
        )}

        <Pressable
          style={styles.button}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.buttonText}>
            Abrir ajustes
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>
            Volver al inicio
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onCameraReady={() => setReady(true)}
          onMountError={(event) => {
            console.error('Error de cámara:', event.message);
          }}
        />
      )}

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Volver
        </Text>
      </Pressable>

      <View style={styles.controls}>
        <View style={styles.side} />

        <Pressable
          style={[
            styles.shutter,
            (!ready || busy) && styles.disabled,
          ]}
          onPress={takePhoto}
          disabled={!ready || busy}
          accessibilityLabel="Tomar foto"
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>

        <View style={styles.side}>
          <Pressable
            style={styles.flip}
            onPress={toggleFacing}
            disabled={busy}
            accessibilityLabel="Cambiar cámara"
          >
            <Text style={styles.flipText}>
              Voltear
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },

  message: {
    fontSize: 16,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  backText: {
    color: '#2563eb',
    fontSize: 16,
  },

  backButton: {
    position: 'absolute',
    top: 52,
    left: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

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

  side: {
    flex: 1,
    alignItems: 'flex-end',
  },

  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },

  disabled: {
    opacity: 0.5,
  },

  flip: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },

  flipText: {
    color: '#fff',
    fontWeight: '600',
  },
});
