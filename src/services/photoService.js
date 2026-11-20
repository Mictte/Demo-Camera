import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

// Datos de conexión desde
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
export const SERIAL_NUMBER = process.env.EXPO_PUBLIC_SERIAL_NUMBER;

// Tamaño máximo permitido para las fotografías (5 MB).
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

// Postman utiliza imagen para subir las fotos.
const PHOTO_FIELD = 'image';

const PHOTOS_URL = `${BASE_URL}/api/photos/${SERIAL_NUMBER}/`;

// Fotografías guardadas en el servidor.
export async function getPhotos() {
  const response = await fetch(PHOTOS_URL);

  if (!response.ok) {
    throw new Error(
      `No se pudieron cargar las fotografías (HTTP ${response.status}).`
    );
  }

  const data = await response.json();

  const photos = Array.isArray(data)
    ? data
    : data.results ?? data.photos ?? data.data;

  if (!Array.isArray(photos)) {
    throw new Error('El servidor devolvió una lista inesperada.');
  }

  return photos;
}

// Enviamos la fotografía que guardamos anteriormente.
export async function uploadPhoto(uri) {
  if (Platform.OS === 'web') {
    throw new Error('La subida debe probarse desde Expo Go.');
  }

  const file = new File(uri);

  if (!file.exists) {
    throw new Error('No se encontró la fotografía guardada.');
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('La fotografía supera los 5 MB permitidos.');
  }

  const formData = new FormData();

// Corregimos el error que impedía subir la foto.
// Ahora enviamos el archivo directamente con expo/fetch.
  formData.append(PHOTO_FIELD, file);

  const response = await expoFetch(PHOTOS_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo subir la fotografía (HTTP ${response.status}).`
    );
  }
}

// Dirección de la imagen para mostrarla en la lista.
export function getPhotoUrl(photo) {
  const value =
    photo.image_url ??
    photo.image ??
    photo.photo_url ??
    photo.foto ??
    photo.url ??
    photo.file;

  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${BASE_URL}/${value.replace(/^\/+/, '')}`;
}

// Fecha que aparecerá debajo de cada foto.
export function getPhotoDate(photo) {
  const value =
    photo.created_at ??
    photo.uploaded_at ??
    photo.created_on ??
    photo.fecha ??
    photo.date;

  if (!value) {
    return 'Fecha no disponible';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return date.toLocaleString('es-MX');
}
