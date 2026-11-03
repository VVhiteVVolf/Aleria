import assert from 'node:assert/strict';
import { projectEquipmentCharacterRecord, hasNewerEquipmentRecordProjection } from '../../../CharakterDatenbank/lib/character-equipment-record-projection.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';

export const HOUSE_SIGNET_EXPORT_DIRECTORY = 'Charakter Archiv Exporte/Haus-Siegelringe 2026-11-02';

export function projectHouseSignetDatabase({registry,snapshot,report,records,prepared,published,verification,corrections=[]}) {
  assert(verification.verified && !verification.dryRun);
  assert.equal(published.capturedAt,verification.committedAt);
  assert.equal(new Set(corrections.map(entry=>entry.id)).size,corrections.length);
  const projections=[],exports=[],unlinked=[];
  let supersededProfiles=0;
  for(const target of prepared.targets){
    let remote=target.online?published.characters.find(c=>c.id===target.id):prepared.localOnly.find(c=>c.id===target.id);
    let sourceTimestamp=published.capturedAt;
    assert(remote,`Bestätigter Gegenstandsstand fehlt: ${target.name}`);
    if(!target.localId){unlinked.push({target,character:remote});continue;}
    const record=records.find(entry=>entry.character.id===target.localId);
    const person=snapshot.characters.find(entry=>entry.id===target.localId);
    const row=registry.records.find(entry=>entry.recordId===record?.recordId);
    assert(record&&person&&row,`Lokale Akte fehlt: ${target.name}`);
    const sourcePath=`${HOUSE_SIGNET_EXPORT_DIRECTORY}/${target.localId}.json`;
    const proof=verification.profiles.find(entry=>entry.id===target.id);
    const ids=new Set(target.online?[...(proof?.added||[]),...(proof?.corrected||[])].map(item=>item.id)
      :remote.inventory.items.filter(item=>item.definitionRef?.id.startsWith('house-signet:')).map(item=>item.id));
    assert(ids.size>0,`Begrenzter Besitzbeleg fehlt: ${target.name}`);
    const correction=corrections.find(entry=>entry.id===target.id);
    if(correction){
      assert(correction.verified&&ids.has(correction.itemId),'Die Vorschaubildkorrektur besitzt keinen passenden Vergabebeleg.');
      assert(Date.parse(correction.committedAt)>Date.parse(published.capturedAt));
      assert.deepEqual(correction.before,remote,'Die Korrektur basiert auf einem anderen Online-Stand.');
      const protectedFields=character=>{
        const copy=structuredClone(character);delete copy.updatedAt;delete copy.inventory.revision;
        delete copy.inventory.items.find(item=>item.id===correction.itemId).icon;return copy;
      };
      assert.deepEqual(protectedFields(correction.before),protectedFields(correction.character));
      const ring=correction.character.inventory.items.find(item=>item.id===correction.itemId);
      assert.equal(ring.icon,ring.image);
      remote=correction.character;sourceTimestamp=correction.committedAt;
    }
    const incoming=new Map(remote.inventory.items.filter(item=>ids.has(item.id)).map(item=>[item.id,item]));
    assert.equal(incoming.size,ids.size);
    // Historical receipts must remain valid even when a newer confirmed
    // projection owns the record; skipping a write never skips proof validation.
    if(hasNewerEquipmentRecordProjection({record,registry,snapshot,sourcePath,exportedAt:published.capturedAt})){
      projections.push({record,path:row.path,snapshotCharacter:person});supersededProfiles++;continue;
    }
    const items=(record.character.inventory?.items||[]).map(item=>{
      const replacement=incoming.get(item.id);incoming.delete(item.id);
      return structuredClone(replacement||item);
    });
    items.push(...[...incoming.values()].map(item=>structuredClone(item)));
    const inventory={...structuredClone(record.character.inventory||{}),items,
      revision:Math.max(record.character.inventory?.revision||0,remote.inventory.revision||0)};
    const newWeapons=(remote.combatProfile?.weapons||[]).filter(weapon=>ids.has(weapon.inventoryItemId));
    const weapons=[...(record.character.combatProfile?.weapons||[])];
    for(const weapon of newWeapons)if(!weapons.some(existing=>existing.id===weapon.id))weapons.push(structuredClone(weapon));
    const projected=projectEquipmentCharacterRecord({record,snapshotCharacter:person,path:row.path,inventory,weapons,
      armorItems:record.character.combatProfile?.armorItems||[],includeCombatProfile:newWeapons.length>0,
      combatRevision:newWeapons.length?remote.combatProfile?.revision:undefined,sourcePath,now:sourceTimestamp});
    assert.deepEqual(projected.projection.record.local,record.local);
    assert.deepEqual(projected.projection.record.classification,record.classification);
    projections.push(projected.projection);exports.push(projected.exported);
  }
  const next=mergeCharacterRecordProjections({registry,snapshot,report},projections,exports,snapshot.charTabs);
  const changedIds=new Set(projections.map(projection=>projection.record.character.id));
  assert.deepEqual(next.snapshot.characters.filter(c=>!changedIds.has(c.id)),snapshot.characters.filter(c=>!changedIds.has(c.id)));
  return {...next,exports,unlinked,verification:{profiles:projections.length,unlinked:unlinked.length,localOnly:prepared.targets.filter(t=>!t.online).length,
    ...(supersededProfiles?{supersededProfiles}:{})}};
}
