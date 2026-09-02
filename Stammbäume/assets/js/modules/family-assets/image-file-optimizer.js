export const MAX_IMAGE_SOURCE_BYTES = 8 * 1024 * 1024;
export const MAX_STAGED_IMAGE_BYTES = 1024 * 1024;

const MAX_IMAGE_EDGE = 2400;
const MAX_OPTIMIZATION_PASSES = 8;
const OUTPUT_TYPE = 'image/webp';

function decodeWithImageElement(file, runtime) {
  return new Promise((resolve, reject) => {
    const objectUrl = runtime.URL.createObjectURL(file);
    const image = new runtime.Image();
    image.addEventListener('load', () => resolve({
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => runtime.URL.revokeObjectURL(objectUrl)
    }), { once: true });
    image.addEventListener('error', () => {
      runtime.URL.revokeObjectURL(objectUrl);
      reject(new Error('Das Bild konnte nicht für die lokale Optimierung geöffnet werden.'));
    }, { once: true });
    image.src = objectUrl;
  });
}

async function decodeImage(file, runtime) {
  if (typeof runtime.createImageBitmap !== 'function') {
    return decodeWithImageElement(file, runtime);
  }
  let bitmap;
  try {
    bitmap = await runtime.createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    bitmap = await runtime.createImageBitmap(file);
  }
  return {
    source: bitmap,
    width: bitmap.width,
    height: bitmap.height,
    dispose: () => bitmap.close?.()
  };
}

function encodeCanvas(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob?.size) resolve(blob);
      else reject(new Error('Das optimierte Bild konnte nicht erzeugt werden.'));
    }, type, quality);
  });
}

function boundedScale(width, height) {
  const largestEdge = Math.max(width, height);
  return largestEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / largestEdge : 1;
}

/**
 * Reduziert nur Dateien, die das sichere Limit des lokalen Entwurfs überschreiten.
 * Das Ergebnis bleibt ein normales Bild-Blob und kann deshalb unverändert durch
 * Vorschau, localStorage und den GitHub-Publisher laufen.
 */
export async function optimizeImageFileForStaging(file, {
  runtime = globalThis,
  targetBytes = MAX_STAGED_IMAGE_BYTES,
  onProgress = () => {}
} = {}) {
  if (file.size <= targetBytes) return file;
  const decoded = await decodeImage(file, runtime);
  if (!decoded.width || !decoded.height) {
    decoded.dispose();
    throw new Error('Das Bild besitzt keine lesbaren Abmessungen.');
  }

  const canvas = runtime.document?.createElement?.('canvas');
  const context = canvas?.getContext?.('2d');
  if (!canvas || !context || typeof canvas.toBlob !== 'function') {
    decoded.dispose();
    throw new Error('Dieser Browser kann große Bilder nicht lokal optimieren.');
  }

  let scale = boundedScale(decoded.width, decoded.height);
  let quality = 0.9;
  try {
    for (let pass = 0; pass < MAX_OPTIMIZATION_PASSES; pass += 1) {
      canvas.width = Math.max(1, Math.round(decoded.width * scale));
      canvas.height = Math.max(1, Math.round(decoded.height * scale));
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
      const blob = await encodeCanvas(canvas, OUTPUT_TYPE, quality);
      onProgress((pass + 1) / MAX_OPTIMIZATION_PASSES);
      if (blob.size <= targetBytes) return blob;

      const sizeRatio = Math.sqrt(targetBytes / blob.size);
      scale *= Math.min(0.86, Math.max(0.5, sizeRatio * 0.92));
      quality = Math.max(0.55, quality - 0.06);
    }
  } finally {
    decoded.dispose();
  }
  throw new Error('Das Bild konnte nicht ausreichend verkleinert werden. Bitte eine kleinere Datei wählen.');
}
