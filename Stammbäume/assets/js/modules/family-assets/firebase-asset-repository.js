import { httpsCallable } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-functions.js';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function readAsBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      onProgress(0.45);
      resolve(String(reader.result || '').split(',').at(-1) || '');
    });
    reader.addEventListener('error', () => reject(reader.error || new Error('Das Bild konnte nicht gelesen werden.')));
    reader.readAsDataURL(file);
  });
}

export function createFirebaseAssetRepository(firebaseClient) {
  async function uploadImage({ familyId, file, kind, visibility = 'public', onProgress = () => {} }) {
    if (!IMAGE_TYPES.has(file?.type)) throw new Error('Erlaubt sind PNG-, JPEG- und WebP-Bilder.');
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Das Bild darf höchstens 8 MB groß sein.');
    if (visibility !== 'public') throw new Error('Private Bild-Assets sind in dieser Ausbaustufe nicht freigegeben.');
    const { auth, functions } = await firebaseClient.initialize();
    if (!auth.currentUser) throw new Error('Für Bild-Uploads ist eine Firebase-Anmeldung erforderlich.');
    onProgress(0.05);
    const base64 = await readAsBase64(file, onProgress);
    const callable = httpsCallable(functions, 'uploadFamilyAsset');
    const result = await callable({
      familyId,
      kind: String(kind || 'image'),
      contentType: file.type,
      originalName: String(file.name || 'image'),
      base64
    });
    onProgress(1);
    return Object.freeze(result.data);
  }

  return Object.freeze({ uploadImage });
}
