const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_IMAGE_BYTES = 1024 * 1024;

function readAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      onProgress(1);
      resolve(String(reader.result || ''));
    });
    reader.addEventListener('error', () => reject(reader.error || new Error('Das Bild konnte nicht gelesen werden.')));
    reader.readAsDataURL(file);
  });
}

export function createLocalImageDraftRepository() {
  async function uploadImage({ file, onProgress = () => {} }) {
    if (!IMAGE_TYPES.has(file?.type)) throw new Error('Erlaubt sind PNG-, JPEG- und WebP-Bilder.');
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('Das Bild darf für den lokalen Entwurf höchstens 1 MB groß sein.');
    }
    onProgress(0.1);
    const url = await readAsDataUrl(file, onProgress);
    if (!url) throw new Error('Das Bild konnte nicht lokal vorgemerkt werden.');
    return Object.freeze({ url, staged: true });
  }

  return Object.freeze({ uploadImage });
}
