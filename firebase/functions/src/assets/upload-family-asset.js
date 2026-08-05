import { randomUUID } from 'node:crypto';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const CONTENT_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/webp', 'webp']
]);
const MAX_BYTES = 8 * 1024 * 1024;

export function hasValidImageSignature(buffer, contentType) {
  if (contentType === 'image/png') {
    return buffer.length >= 8
      && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
      && buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a;
  }
  if (contentType === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (contentType === 'image/webp') {
    return buffer.length >= 12
      && buffer.subarray(0, 4).toString('ascii') === 'RIFF'
      && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

export const uploadFamilyAsset = onCall({
  region: 'europe-west1',
  timeoutSeconds: 120,
  memory: '512MiB',
  maxInstances: 5,
  enforceAppCheck: false
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Eine Firebase-Anmeldung ist erforderlich.');
  const familyId = String(request.data?.familyId || '').trim();
  const contentType = String(request.data?.contentType || '');
  const kind = String(request.data?.kind || 'image').trim().slice(0, 40);
  const encoded = String(request.data?.base64 || '');
  if (!/^[a-z0-9-]{2,120}$/.test(familyId)) throw new HttpsError('invalid-argument', 'Ungültige Familien-ID.');
  if (!CONTENT_TYPES.has(contentType)) throw new HttpsError('invalid-argument', 'Erlaubt sind PNG-, JPEG- und WebP-Bilder.');
  if (encoded.length > Math.ceil(MAX_BYTES * 4 / 3) + 4) throw new HttpsError('invalid-argument', 'Das Bild darf höchstens 8 MB groß sein.');
  const buffer = Buffer.from(encoded, 'base64');
  if (!buffer.length || buffer.length > MAX_BYTES) throw new HttpsError('invalid-argument', 'Das Bild darf höchstens 8 MB groß sein.');
  if (!hasValidImageSignature(buffer, contentType)) throw new HttpsError('invalid-argument', 'Dateityp und Bildinhalt stimmen nicht überein.');
  const database = getFirestore('family-trees');

  const assetId = randomUUID();
  const token = randomUUID();
  const path = `family-assets/${familyId}/${assetId}/original.${CONTENT_TYPES.get(contentType)}`;
  const bucket = getStorage().bucket();
  const file = bucket.file(path);
  await file.save(buffer, {
    resumable: false,
    validation: 'crc32c',
    metadata: {
      contentType,
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        familyId,
        assetId,
        kind,
        visibility: 'public',
        firebaseStorageDownloadTokens: token
      }
    }
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
  await database.doc(`familyAssets/${assetId}`).set({
    id: assetId,
    familyId,
    kind,
    visibility: 'public',
    storagePath: path,
    downloadUrl: url,
    contentType,
    size: buffer.length,
    originalName: String(request.data?.originalName || '').slice(0, 180),
    createdAt: FieldValue.serverTimestamp(),
    createdBy: request.auth.uid
  });
  return { assetId, url, path };
});
