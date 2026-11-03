import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';
import { getSirenentanzBasicTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { COMBAT_TECHNIQUE_ICON_MOTIFS, getCombatTechniqueIconSource } from '../modules/combat-styles/combat-technique-icons.js';

const root = new URL('../../', import.meta.url);
const art = new URL('../docs/art/combat-technique-icons/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', art), 'utf8'));
const digest = buffer => createHash('sha256').update(buffer).digest('hex');

test('each original comic motif has preserved generation inputs and matching deployable RGBA artwork', async () => {
  assert.deepEqual(new Set(manifest.sources.map(source => source.id)), new Set(COMBAT_TECHNIQUE_ICON_MOTIFS));
  assert.equal(manifest.generator, 'built-in image_gen');
  for (const source of manifest.sources) {
    assert.ok(source.prompt.length > 100);
    await access(new URL(source.source, art));
    const asset = await readFile(new URL(`AleriaAlmanach/assets/combat-technique-icons/${source.id}.png`, root));
    const publicAsset = await readFile(new URL(`AleriaAlmanach/public/assets/combat-technique-icons/${source.id}.png`, root));
    assert.equal(digest(asset), digest(publicAsset), source.id);
    assert.equal(asset.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(asset.readUInt32BE(16), 256, source.id);
    assert.equal(asset.readUInt32BE(20), 256, source.id);
    assert.equal(asset[25], 6, `${source.id}: real RGBA alpha`);
    assert.ok(asset.length < 200_000, `${source.id}: thumbnail transfer budget`);
  }
});

test('all Cenyr and Vennyr technique icons resolve to actual local and deployed assets', async () => {
  const techniques = [...getCombatStyle('drachentanz').forms.flatMap(form => form.techniques),
    ...['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr']
      .flatMap(id => [...getSirenentanzBasicTechniques(id), ...getSirenentanzExpertTechniques(id)])];
  const sources = new Set(techniques.map(technique => {
    const source = getCombatTechniqueIconSource(technique);
    assert.ok(source, technique.id);
    return source;
  }));
  for (const source of sources) await access(new URL(source.slice(1), root));
});
