import { attachCreatureToInventory } from '../../AleriaAlmanach/modules/creatures/creature-companion-link.js';
import { isDeepStrictEqual } from 'node:util';

const MARKER='__aleriaCharacterCompanionBindings';
const normalized=value=>String(value||'').normalize('NFC').trim().toLocaleLowerCase('de');

export function markCharacterCompanionOverlay(character,bindings=[],exportedAt='') {
  if(!Array.isArray(bindings))throw Error('Begrenzte Begleiterbindungen erwartet.');
  for(const creature of bindings)if(!creature?.id||creature.itemOrigin?.ownerCharacterId!==character.id
    ||!creature.itemOrigin.inventoryItemId||!creature.itemOrigin.instanceId)throw Error('Ungültige Besitzerbindung im öffentlichen Export.');
  Object.defineProperty(character,MARKER,{value:{bindings:structuredClone(bindings),exportedAt},enumerable:false});
  return character;
}

// These receipts contain no inventory snapshot. They add only their explicitly
// owned animal through the same identity helper as an ordinary companion edit.
// A later complete inventory supersedes the receipt, including sold animals.
export function applyCharacterCompanionOverlays(character,sources,latestInventoryTimestamp=0) {
  const overlays=sources.filter(source=>source?.[MARKER])
    .map(source=>source[MARKER]).filter(row=>(Date.parse(row.exportedAt)||0)>=latestInventoryTimestamp)
    .sort((a,b)=>(Date.parse(a.exportedAt)||0)-(Date.parse(b.exportedAt)||0));
  let result=character;
  for(const overlay of overlays){
    const beforeInventory=result.inventory;
    for(const creature of overlay.bindings){
    if(creature.itemOrigin.ownerCharacterId!==character.id)throw Error('Begleiterbindung gehört zu einer anderen Hauptakte.');
    const cards=(result.inventory?.companions||[]).filter(card=>normalized(card.name)===normalized(creature.name));
    if(cards.some(card=>card.name!==creature.name))throw Error('Abweichende bestehende Begleiterkarte benötigt Prüfung.');
    const inventory=attachCreatureToInventory(result,creature,overlay.exportedAt);
    result={...result,inventory};
    }
    if(!isDeepStrictEqual(result.inventory,beforeInventory))result.inventory.revision=Math.max(Date.parse(overlay.exportedAt)||0,(Number(beforeInventory?.revision)||0)+1);
  }
  return result;
}
