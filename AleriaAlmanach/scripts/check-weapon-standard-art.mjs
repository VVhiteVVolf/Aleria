import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEAPON_STANDARD_CATALOG } from '../modules/weapon-standards/weapon-standard-catalog.js';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const digestText = bytes => digest(bytes.toString('utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n'));
const artRoot = new URL('../docs/art/weapon-standards/', import.meta.url);
const assetRoot = new URL('../public/assets/weapon-standards/', import.meta.url);
const script = new URL('prepare-weapon-standard-art.ps1', import.meta.url);

export function validateWeaponStandardImage(bytes, label = 'weapon') {
  if (bytes.length < 33 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error(`${label}: PNG required.`);
  if (bytes.readUInt32BE(16) !== 512 || bytes.readUInt32BE(20) !== 512 || bytes[24] !== 8 || bytes[25] !== 6) {
    throw Error(`${label}: 512x512 8-bit RGBA artwork required.`);
  }
}

export async function checkWeaponStandardArt() {
  const manifestBytes = await readFile(new URL('manifest.json', artRoot));
  const manifest = JSON.parse(manifestBytes);
  const receipt = JSON.parse(await readFile(new URL('preparation.json', artRoot)));
  const expected = new Set(WEAPON_STANDARD_CATALOG.map(row => row.id));
  if (manifest.sources.length !== expected.size || receipt.images.length !== expected.size
    || new Set(manifest.sources.map(row => row.id)).size !== expected.size
    || new Set(receipt.images.map(row => row.id)).size !== expected.size) throw Error('Weapon art source coverage is incomplete or duplicated.');
  if (receipt.schemaVersion !== 1 || receipt.size !== 512 || receipt.tool !== 'prepare-weapon-standard-art.ps1'
    || receipt.manifestSha256 !== digestText(manifestBytes) || receipt.scriptSha256 !== digestText(await readFile(script))) {
    throw Error('Weapon preparation changed: run prepare-weapon-standard-art.ps1, then -Check.');
  }
  for (const entry of manifest.sources) {
    if (!expected.has(entry.id) || entry.source !== `sources/${entry.id}.png`
      || entry.asset !== `../../../public/assets/weapon-standards/${entry.id}.png`) throw Error(`Unexpected weapon source: ${entry.id}`);
    const recorded = receipt.images.find(row => row.id === entry.id);
    const original = await readFile(new URL(entry.source, artRoot));
    const asset = await readFile(new URL(`${entry.id}.png`, assetRoot));
    validateWeaponStandardImage(asset, entry.id);
    if (!recorded || recorded.sourceSha256 !== digest(original) || recorded.assetSha256 !== digest(asset)) {
      throw Error(`Weapon source or prepared asset is stale: ${entry.id}`);
    }
  }
  return { count: expected.size, size: 512 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkWeaponStandardArt();
  console.log(`${result.count} weapon standards verified: ${result.size}px RGBA, source/script/manifest/asset hashes match.`);
}
