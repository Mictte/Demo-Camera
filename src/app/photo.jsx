import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PhotoScreen() {
  // El router ya decodifica el parámetro una vez; no hay que decodificarlo de nuevo.
  const { uri } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => {}}>
          <Text style={styles.primaryText}>Enviar al servidor</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Reiniciar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1 },
  actions: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
    gap: 12,
  },
  primary: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
