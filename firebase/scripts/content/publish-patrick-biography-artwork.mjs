import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publishBiographyArtwork } from './biography-artwork-publication.mjs';

const directory = new URL('../../../AleriaAlmanach/docs/art/patrick-biographies-20261103/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
assert.equal(manifest.records.length, 23);
const files = Object.fromEntries(manifest.records.map(record => {
  assert.match(record.slug, /^[a-z-]+$/);
  assert.equal(record.output, `AleriaAlmanach/public/assets/biography-trait-icons/${record.slug}-20261103.png`);
  return [record.slug, `../../../public/assets/biography-trait-icons/${record.slug}-20261103.png`];
}));
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ plannedImages: Object.keys(files).length, applyRequired: true }));
} else {
  console.log(JSON.stringify(await publishBiographyArtwork({ directory, files,
    familyId: 'haus-sgrechiwr', characterId: 'person--haus-sgrechiwr--cadogan-sgrechiwr',
    assetPrefix: 'patrick-traits-20261103',
    kinds: Object.fromEntries(Object.keys(files).map(key => [key, 'shared-biography-trait'])) })));
}
