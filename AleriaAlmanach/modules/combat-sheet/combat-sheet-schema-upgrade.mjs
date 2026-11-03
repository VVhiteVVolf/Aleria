import assert from 'node:assert/strict';
import { COMBAT_PROFILE_SCHEMA_VERSION } from '../combat/combat-profile-model.js';
export const REVIEWED_CREATURE_SCHEMA_IDS = Object.freeze(['catalog-draig-lehensritter','catalog-draig-waffenknecht']);
export function planCreatureSheetSchemaUpgrade(record, now) {
  assert(REVIEWED_CREATURE_SCHEMA_IDS.includes(record.id));
  if(record.combatProfile.schemaVersion===COMBAT_PROFILE_SCHEMA_VERSION)return {character:structuredClone(record),changed:false,fieldPaths:[]};
  assert.equal(record.combatProfile.schemaVersion,9,'Ungeprüfte alte Kreaturfassung.');
  assert(Number.isFinite(Date.parse(now)));
  return {changed:true,fieldPaths:['combatProfile.schemaVersion','combatProfile.revision','updatedAt'],character:{...structuredClone(record),updatedAt:now,
   combatProfile:{...structuredClone(record.combatProfile),schemaVersion:COMBAT_PROFILE_SCHEMA_VERSION,
    revision:Math.max(Date.parse(now),Number(record.combatProfile.revision||0)+1)}}};
}
