import { readFile, writeFile } from 'node:fs/promises';
import { buildTroetzliCharacterExports } from '../../../AleriaAlmanach/scripts/build-gwynthor-troetzli.mjs';
import { buildAuthoredCharacterImport } from '../../../CharakterDatenbank/lib/authored-character-import.mjs';
import { TROETZLI_CREATURE_SOURCE } from '../../../AleriaAlmanach/modules/creatures/catalog/troetzli.js';
import { sanitizeCreature, CREATURE_EXPORT_TYPE } from '../../../AleriaAlmanach/modules/creatures/creature-model.js';
const root = new URL('../../../', import.meta.url);
function changes(before, after, path = '') {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object' && Array.isArray(before) === Array.isArray(after)) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(key => changes(before[key], after[key], path ? `${path}.${key}` : key));
  }
  return [{ path, before, after }];
}
const records = [];
const exports = buildTroetzliCharacterExports();
for (const generated of exports) {
  const path = `Charakter Archiv Exporte/gwynthor-troetzli-2026-10-31/${generated.character.id}.json`;
  const stored = JSON.parse(await readFile(new URL(path, root), 'utf8'));
  records.push({ id: generated.character.id, path, changes: changes(stored, generated), serializationOnly: JSON.stringify(stored) === JSON.stringify(generated) });
}
const horse = sanitizeCreature(TROETZLI_CREATURE_SOURCE), horsePath = `Charakter Archiv Exporte/gwynthor-troetzli-2026-10-31/${horse.id}.json`;
const horseChanges = changes(JSON.parse(await readFile(new URL(horsePath, root), 'utf8')), { type: CREATURE_EXPORT_TYPE, creature: horse });
const read = async file => JSON.parse(await readFile(new URL(`CharakterDatenbank/${file}`, root), 'utf8'));
const [registry, snapshot, report] = await Promise.all(['registry.json', 'generated/characters.snapshot.json', 'generated/sync-report.json'].map(read));
const planned = buildAuthoredCharacterImport({ registry, snapshot, report }, exports.map(entry => ({ ...entry,
  sourcePath: `Charakter Archiv Exporte/gwynthor-troetzli-2026-10-31/${entry.character.id}.json` })), 'gwynthor-troetzli');
const databaseChanges = [];
for (const item of planned.records) databaseChanges.push({ path: item.path, changes: changes(await read(item.path), item.record) });
const result = { exports: records, horse: { path: horsePath, changes: horseChanges }, database: databaseChanges,
  registry: changes(registry, planned.registry), snapshot: changes(snapshot, planned.snapshot), report: changes(report, planned.report) };
await writeFile(new URL('./troetzli-export-diff.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
