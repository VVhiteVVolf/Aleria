import { isDeepStrictEqual } from 'node:util';
import { createHash } from 'node:crypto';
import { deriveCombatStateFromComments } from '../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { balanceArmorInventoryItem } from '../../../AleriaAlmanach/modules/character-equipment/equipment-armor-rules.js';
import { reviseMartialPositionEntry } from '../../../AleriaAlmanach/modules/combat-styles/martial-position-effects.js';

// Administrative marker only: does not count as an owner contribution or change old receipts.
export function planDefenseSceneRelease(entryId, history, affectedActorIds, now) {
  if (history.some(c => c.combatRulesRelease?.releaseId === 'defense-balance-20261003-v1')) return null;
  const states = deriveCombatStateFromComments(history);
  if (![...states.keys()].some(id => affectedActorIds.has(id))) return null;
  const equipmentSnapshots=[];
  for(const [actorId,state] of states) {
    if(!affectedActorIds.has(actorId) || !state.inventory?.items)continue;
    const inventory={...state.inventory,items:state.inventory.items.map(item=>{
      const armor=balanceArmorInventoryItem(item);
      if(armor.combatDefinition?.kind !== 'weapon')return armor;
      const revised=reviseMartialPositionEntry(armor.combatDefinition);
      return revised===armor.combatDefinition?armor:{...armor,combatDefinition:revised};
    })};
    if(!isDeepStrictEqual(inventory,state.inventory)) equipmentSnapshots.push({actorId,inventory});
  }
  const id='defense-balance-'+createHash('sha256').update(entryId).digest('hex').slice(0,24);
  return { id, entryId, charName:'Regelstand',narrator:true,characterId:'',
    text:'Neuer Regelstand für Rüstung und Kampfeffekte. Frühere Würfe und Ergebnisse bleiben erhalten.',
    commentKind:'combat-rules-release',commentMode:'narration',serverValidatedMechanics:true,serverCommitted:true,
    createdBy:'system:defense-balance-release',createdByRole:'admin',schemaVersion:3,
    createdAtClient:now,orderKey:Math.max(now,...history.map(c=>Number(c.orderKey||c.createdAtClient)||0))+1,
    combatRulesRelease:{version:1,releaseId:'defense-balance-20261003-v1',encounterId:'defense-balance-20261003-v1',equipmentSnapshots} };
}
