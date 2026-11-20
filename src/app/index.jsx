import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, Text, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPhotoDate, getPhotos, getPhotoUrl, } from '../services/photoService';

export default function HomeScreen() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  //consulta para mostrar nuestras fotos.
  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getPhotos();
      setPhotos(result);

    } catch (requestError) {
      setError(
        requestError.message || 'No se pudieron cargar las fotos.'
      );

    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizamos la lista al regresar a esta pantalla
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos])
  );

  // Mostramos cada foto con su fecha
  const renderPhoto = ({ item, index }) => {
    const imageUri = getPhotoUrl(item);

    return (
      <Pressable
        style={styles.photoCard}
        disabled={!imageUri}
        onPress={() => setSelectedPhoto(imageUri)}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Text style={styles.placeholderText}>
              Sin imagen
            </Text>
          </View>
        )}

        <View style={styles.photoDetails}>
          <Text style={styles.photoName}>
            Foto {index + 1}
          </Text>

          <Text style={styles.photoDate}>
            {getPhotoDate(item)}
          </Text>

          {imageUri ? (
            <Text style={styles.openText}>
              Toca para ver completa
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.title}>
        Demo de cámara
      </Text>

      <Text style={styles.subtitle}>
        Toma una foto y revísala antes de enviarla.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/camera')}
      >
        <Text style={styles.buttonText}>
          Tomar una foto
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>
        Mis fotografías
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#2563eb"
          />

          <Text>Cargando fotografías...</Text>
        </View>

      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={loadPhotos}
          >
            <Text style={styles.buttonText}>
              Reintentar
            </Text>
          </Pressable>
        </View>

      ) : (
        <FlatList
          style={styles.list}
          data={photos}
          keyExtractor={(item, index) => String(item.id ?? index)}
          renderItem={renderPhoto}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Todavía no hay fotografías. Toma una para empezar.
            </Text>
          }
        />
      )}

      {/* Permite abrir la foto en pantalla completa */}
      <Modal
        visible={selectedPhoto !== null}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.fullscreen}>
          <StatusBar style="light" />

          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.buttonText}>
              Cerrar
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginTop: 8,
  },

  button: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 28,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },

  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 32,
    fontSize: 15,
  },

  error: {
    textAlign: 'center',
    fontSize: 15,
    color: '#b91c1c',
  },

  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 12,
  },

  photoCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
    alignItems: 'center',
  },

  thumbnail: {
    width: 100,
    height: 90,
    borderRadius: 8,
  },

  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cbd5e1',
  },

  placeholderText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
  },

  photoDetails: {
    flex: 1,
    gap: 5,
  },

  photoName: {
    fontWeight: '700',
    fontSize: 16,
  },

  photoDate: {
    fontSize: 13,
    color: '#475569',
  },

  openText: {
    color: '#2563eb',
    fontSize: 12,
  },

  fullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },

  fullImage: {
    flex: 1,
  },

  closeButton: {
    alignSelf: 'center',
    marginBottom: 44,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});