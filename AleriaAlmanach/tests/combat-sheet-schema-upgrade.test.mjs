import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planCreatureSheetSchemaUpgrade, REVIEWED_CREATURE_SCHEMA_IDS } from '../modules/combat-sheet/combat-sheet-schema-upgrade.mjs';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
const source=JSON.parse(await readFile(new URL('../../diagnostics/combat-sheets-20261102/online-before.json',import.meta.url),'utf8'));
test('The two reviewed schema-9 creature sheets retain their full gameplay state and every derived statistic',()=>{
 for(const id of REVIEWED_CREATURE_SCHEMA_IDS){
  const record=source.collections.creatures.records.find(record=>record.id===id),before=structuredClone(record);
  const plan=planCreatureSheetSchemaUpgrade(record,'2026-11-03T00:00:00.000Z');assert(plan.changed);
  const unchanged=structuredClone(plan.character);delete unchanged.updatedAt;
  unchanged.combatProfile.schemaVersion=record.combatProfile.schemaVersion;
  if(record.combatProfile.revision==null)delete unchanged.combatProfile.revision;else unchanged.combatProfile.revision=record.combatProfile.revision;
  const expected=structuredClone(record);delete expected.updatedAt;assert.deepEqual(unchanged,expected);
  const old=resolveCombatProfile(record),next=resolveCombatProfile(plan.character);
  for(const field of ['currentHitPoints','maximumHitPoints','totalDefense','resources','actions'])assert.deepEqual(next[field],old[field],field);
  assert.equal(planCreatureSheetSchemaUpgrade(plan.character,'2026-11-04T00:00:00.000Z').changed,false);
  assert.deepEqual(record,before);
 }
});
