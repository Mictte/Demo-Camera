import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View, } from 'react-native';
import { uploadPhoto } from '../services/photoService';

export default function PhotoScreen() {
  // El router ya decodifica el parámetro una vez; no hay que decodificarlo de nuevo.
  const { uri } = useLocalSearchParams();

  const photoUri = Array.isArray(uri) ? uri[0] : uri;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

// Enviamos la foto al servidor y mostramos si hubo algún error.
  const handleUpload = async () => {
    if (!photoUri || uploading) return;

    setUploading(true);
    setError('');

    try {
      await uploadPhoto(photoUri);

      Alert.alert(
        'Foto enviada',
        'La fotografía se subió correctamente.',
        [
          {
            text: 'Aceptar',
            onPress: () => router.dismissTo('/'),
          },
        ]
      );

    } catch (uploadError) {
      setError(
        uploadError.message || 'No se pudo subir la fotografía.'
      );

    } finally {
      setUploading(false);
    }
  };

// Si no hay una foto para mostrar, damos la opción de regresar.
  if (!photoUri) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          No hay una fotografía para mostrar.
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => router.dismissTo('/')}
        >
          <Text style={styles.primaryText}>
            Volver al inicio
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: photoUri }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.actions}>
        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Text style={styles.info}>
          Revisa la foto antes de enviarla.
        </Text>

        <Pressable
          style={[
            styles.primary,
            uploading && styles.disabled,
          ]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>
              Enviar al servidor
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => router.back()}
          disabled={uploading}
        >
          <Text style={styles.secondaryText}>
            Reiniciar
          </Text>
        </Pressable>
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
    justifyContent: 'center',
    padding: 24,
    gap: 18,
    backgroundColor: '#000',
  },

  image: {
    flex: 1,
  },

  actions: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    gap: 12,
  },

  info: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 13,
  },

  error: {
    color: '#fca5a5',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },

  primary: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },

  primaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  secondary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },

  disabled: {
    opacity: 0.6,
  },
});