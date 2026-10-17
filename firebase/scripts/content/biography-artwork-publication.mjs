import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createContentPublicationClient } from './content-publication-client.mjs';

// Shared immutable image publication for the reviewed biography asset lists.
export async function publishBiographyArtwork({ directory, files, familyId, characterId, assetPrefix, kinds = {} }) {
  const { publishFamilyArtwork } = await createContentPublicationClient();
  const assets = {};
  for (const [key, file] of Object.entries(files)) {
    const bytes = await readFile(new URL(file, directory));
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const contentType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const assetKey = key.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    assets[key] = { ...(await publishFamilyArtwork({ familyId, assetId: `${assetPrefix}-${assetKey}-${sha256.slice(0, 16)}`,
      bytes, contentType, metadata: { characterId, kind: kinds[key] || (key.startsWith('trait') ? 'icon' : 'portrait') } })), localPath: file };
    if (contentType === 'image/png') { assets[key].width = bytes.readUInt32BE(16); assets[key].height = bytes.readUInt32BE(20); }
  }
  await writeFile(new URL('asset-publication.json', directory), JSON.stringify({ verifiedAt: new Date().toISOString(), assets }, null, 2) + '\n');
  return { publishedImages: Object.keys(assets).length, originalBytesVerified: true };
}
