import { readFile, writeFile, readdir } from 'node:fs/promises';
import { planDefenseBalanceRelease } from '../../firebase/functions/scripts/defense-balance-release-model.mjs';
import { applyCharacterFieldPatch } from '../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';

// Build source overlays from local canonical records. No online writes, no resource reset.
const root = new URL('../../', import.meta.url);
const json = value => JSON.stringify(value, null, 2) + '\n';
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const save = async (path,value) => writeFile(new URL(path,root),json(value));
const registry = await read('CharakterDatenbank/registry.json');
let changed = 0;
for (const entry of registry.characters || registry.records) {
  const record = await read('CharakterDatenbank/' + entry.path);
  const patch = planDefenseBalanceRelease(record.character);
  if (!patch) continue;
  const after = applyCharacterFieldPatch(record.character, patch);
  const character = { id: after.id, name: after.name, updatedAt: '2026-10-03T02:00:00.000Z', combatProfile: after.combatProfile,
    ...(after.inventory ? { inventory: after.inventory } : {}) };
  await save(`Charakter Archiv Exporte/${record.slug}-defense-balance-2026-10-03.json`, {
    type:'aleria-character',version:3,mergeStrategy:'replace-exported-fields',exportedAt:'2026-10-03T02:00:00.000Z',character
  });
  changed++;
}
// Undated authoring exports remain usable on their own. Dated historical exports stay intact.
for (const name of await readdir(new URL('Charakter%20Archiv%20Exporte/',root))) {
  if (!/^[a-z]+(?:-[a-z]+)*\.json$/.test(name)) continue;
  const path='Charakter Archiv Exporte/'+name, payload=await read(path);
  if (!payload.character) continue;
  const patch=planDefenseBalanceRelease(payload.character);
  if(patch)await save(path,{...payload,character:applyCharacterFieldPatch(payload.character,patch)});
}
const creaturePath='Charakter Archiv Exporte/gefaehrten/freki-gramnir.json';
const creaturePayload=await read(creaturePath);
await save(creaturePath,{...creaturePayload,creature:getBuiltinCreatureTemplates().find(c=>c.id==='companion-ylva-freki')});
console.log(JSON.stringify({overlays:changed}));
