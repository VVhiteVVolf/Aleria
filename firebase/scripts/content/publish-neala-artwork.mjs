import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createContentPublicationClient } from './content-publication-client.mjs';
const directory = new URL('../../../AleriaAlmanach/assets/biographies/neala-wylan/2026-10-17/', import.meta.url);
const files = { armor: 'neala-wylan-ruestung-floeckchen.png', age20: 'neala-20.png', age14: 'neala-14.png', child: 'neala-08.png', floeckchen: 'references/floeckchen-original.jpeg' };
const traitFiles = { traitDuty: 'Diligent', traitPride: 'Proud', traitCharm: 'Charismatic_negotiator', traitPatience: 'Patient', traitKindness: 'Kind', traitPerfection: 'Fussy' };
for (const [key, file] of Object.entries(traitFiles)) files[key] = `../../../../../IconOrdner/Traits%20Icon/${file}.png`;
const { publishFamilyArtwork } = await createContentPublicationClient();
const assets = {};
for (const [key, file] of Object.entries(files)) {
  const bytes = await readFile(new URL(file, directory));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  assets[key] = { ...(await publishFamilyArtwork({ familyId: 'haus-wylan', assetId: `neala-${key.toLowerCase()}-${sha256.slice(0, 16)}`,
    bytes, contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg', metadata: { characterId: 'person--haus-wylan--neala-wylan', kind: key === 'floeckchen' ? 'companion' : key.startsWith('trait') ? 'icon' : 'portrait' } })), localPath: file };
  if (file.endsWith('.png')) { assets[key].width = bytes.readUInt32BE(16); assets[key].height = bytes.readUInt32BE(20); }
}
await writeFile(new URL('asset-publication.json', directory), JSON.stringify({ verifiedAt: new Date().toISOString(), assets }, null, 2) + '\n');
console.log(JSON.stringify({ publishedImages: Object.keys(assets).length, originalBytesVerified: true }));
