import fs from 'node:fs';
import crypto from 'node:crypto';
import { KINGDOM_DECISIONS } from '../authoring/kingdom-decisions.mjs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';

// One-time editorial capture. Never a build step; later edits belong to data/.
const root = new URL('../../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root));
const write = (file, data) => fs.writeFileSync(new URL(file, root), JSON.stringify(data, null, 2) + '\n');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const files = {
  aeldrunmar: 'C:/Users/fhg_r/Downloads/aeldrunmar-entwurf-Neu.json',
  talyndor: 'C:/Users/fhg_r/Downloads/talyndor-entwurf (Neu).json',
  brevanor: 'C:/Users/fhg_r/Downloads/brevanor-entwurf (Neu).json',
};
const receipts = JSON.parse(read('shared/accepted-realms/sources/source-receipts.json'));
const existing = {};
for (const [id, settings] of Object.entries(KINGDOM_DECISIONS)) {
  const bytes = fs.readFileSync(files[id]);
  const draft = JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, ''));
  if (draft.schemaVersion !== 1 || draft.realm !== id) throw Error(`Invalid draft ${id}`);
  const { houses } = await import(`../../../Vorschau/${settings.name}/house-data.mjs`);
  const { counties, settlements, territoryArt } = await import(`../../../Vorschau/${settings.name}/territory-data.mjs`);
  const { warriors } = await import(`../../../Vorschau/${settings.name}/warrior-data.mjs`);
  const { context } = await import(`../../../Vorschau/${settings.name}/realm-context.mjs`);
  if (Object.keys(draft.placements).length !== houses.length) throw Error(`Incomplete draft ${id}`);
  for (const h of houses) {
    if (!settlements.some(s => s.id === draft.placements[h.id])) throw Error(`Unknown seat ${id}/${h.id}`);
    const record = FAMILY_REGISTRY.find(f => f.id === `haus-${h.id}`);
    if (record) existing[record.id] = record.family;
  }
  if (id === 'aeldrunmar') existing['haus-scandyn'] = FAMILY_REGISTRY.find(f => f.id === 'haus-scandyn').family;
  const snapshot = { previewDirectory: settings.name, houses, counties, settlements, territoryArt, warriors, context };
  if (id === 'brevanor') snapshot.historicalEmblems = (await import('../../../Vorschau/Brevanor/historical-emblems.mjs')).historicalEmblems;
  const snapshotPath = `shared/accepted-realms/sources/${id}.snapshot.json`;
  const placementPath = `shared/accepted-realms/sources/placements/${id}-entwurf.json`;
  if (fs.existsSync(new URL(snapshotPath, root))) throw Error(`Capture already exists: ${id}`);
  write(snapshotPath, snapshot);
  fs.writeFileSync(new URL(placementPath, root), bytes, { flag: 'wx' });
  receipts.exports.push({ realm: id, path: placementPath, sha256: sha(bytes), acceptedOn: '2026-11-01' });
  console.log(`${id}: ${houses.length} houses, ${settlements.length} places`);
}
write('shared/accepted-realms/sources/kingdom-existing-families-20261101.json', existing);
write('shared/accepted-realms/sources/source-receipts.json', receipts);
