import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
    
      <StatusBar style="dark" />
      <Text style={styles.title}>Demo de cámara</Text>
      <Text style={styles.subtitle}>Toma una foto y revísala antes de enviarla.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/camera')}>
        <Text style={styles.buttonText}>Tomar una foto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#475569', textAlign: 'center' },
  button: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
