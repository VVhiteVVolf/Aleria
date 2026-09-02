import {
  MAX_IMAGE_SOURCE_BYTES,
  MAX_STAGED_IMAGE_BYTES,
  optimizeImageFileForStaging
} from './image-file-optimizer.js';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

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

export function createLocalImageDraftRepository({
  optimizeImage = optimizeImageFileForStaging,
  readDataUrl = readAsDataUrl
} = {}) {
  async function uploadImage({ file, onProgress = () => {} }) {
    if (!IMAGE_TYPES.has(file?.type)) throw new Error('Erlaubt sind PNG-, JPEG- und WebP-Bilder.');
    if (file.size > MAX_IMAGE_SOURCE_BYTES) {
      throw new Error('Die ausgewählte Bilddatei darf höchstens 8 MB groß sein.');
    }
    onProgress(0.1);
    const shouldOptimize = file.size > MAX_STAGED_IMAGE_BYTES;
    const stagedFile = shouldOptimize
      ? await optimizeImage(file, {
        targetBytes: MAX_STAGED_IMAGE_BYTES,
        onProgress(progress) {
          onProgress(0.1 + (progress * 0.75));
        }
      })
      : file;
    if (!IMAGE_TYPES.has(stagedFile?.type) || !stagedFile.size || stagedFile.size > MAX_STAGED_IMAGE_BYTES) {
      throw new Error('Das Bild konnte nicht in ein sicher speicherbares Format optimiert werden.');
    }
    const url = await readDataUrl(stagedFile, onProgress);
    if (!url) throw new Error('Das Bild konnte nicht lokal vorgemerkt werden.');
    return Object.freeze({
      url,
      staged: true,
      optimized: shouldOptimize,
      originalBytes: file.size,
      storedBytes: stagedFile.size
    });
  }

  return Object.freeze({ uploadImage });
}
