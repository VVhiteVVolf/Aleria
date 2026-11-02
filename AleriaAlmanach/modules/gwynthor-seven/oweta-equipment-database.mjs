import assert from 'node:assert/strict';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { projectEquipmentCharacterRecord } from '../../../CharakterDatenbank/lib/character-equipment-record-projection.mjs';
import { planKnightEquipment } from './knight-equipment-plan.mjs';

export const OWETA_EQUIPMENT_ID = 'vk0xAa3ZcEhVvGC1CzNq';
export const OWETA_EQUIPMENT_WORLD_ID = 'person--haus-draig--oweta-draig';

function withoutEquipment(character) {
  const result = structuredClone(character);
  delete result.updatedAt;
  if (result.inventory) {
    delete result.inventory.items;
    delete result.inventory.revision;
  }
  if (result.combatProfile) {
    delete result.combatProfile.weapons;
    delete result.combatProfile.armorItems;
    if (!Object.keys(result.combatProfile).length) delete result.combatProfile;
  }
  return result;
}

/** Project only Oweta's reviewed equipment, preserving the existing record basis. */
export function projectOwetaEquipmentDatabase({ registry, snapshot, report, record, characters, templates, sourcePath, now }) {
  assert.ok(Number.isFinite(Date.parse(now)), 'Der Ausrüstungsabgleich benötigt einen festen Quellenzeitpunkt.');
  assert.ok(typeof sourcePath === 'string' && sourcePath.startsWith('Charakter Archiv Exporte/')
    && sourcePath.endsWith('.json') && !sourcePath.includes('..'), 'Öffentlichen Exportpfad erwartet.');
  assert.equal(record.character.id, OWETA_EQUIPMENT_ID);
  assert.equal(record.identity.worldPersonId, OWETA_EQUIPMENT_WORLD_ID);
  assert.equal(record.links.firestore.documentId, OWETA_EQUIPMENT_ID);
  const registryRows = registry.records.filter(row => row.firestoreDocumentId === OWETA_EQUIPMENT_ID);
  const snapshotRows = snapshot.characters.filter(row => row.id === OWETA_EQUIPMENT_ID);
  assert.equal(registryRows.length, 1, 'Owetas Datenbankindex muss eindeutig sein.');
  assert.equal(snapshotRows.length, 1, 'Owetas Snapshot muss eindeutig sein.');
  const [registryRow] = registryRows, [snapshotRow] = snapshotRows;
  assert.equal(registryRow.recordId, record.recordId);
  assert.equal(snapshotRow.localRecord.recordId, record.recordId);
  assert.equal(snapshotRow.localRecord.path, registryRow.path);

  const plan = planKnightEquipment({ characters: characters.map(character => character.id === OWETA_EQUIPMENT_ID ? record.character : character), templates, now });
  const entry = plan.entries.find(item => item.key === 'oweta-draig');
  assert.ok(entry && !entry.create);
  assert.deepEqual(withoutEquipment(entry.character), withoutEquipment(record.character), 'Nur Besitz und Ausrüstungslisten dürfen ergänzt werden.');
  const { projection, exported } = projectEquipmentCharacterRecord({ record, snapshotCharacter: snapshotRow, path: registryRow.path,
    inventory: entry.character.inventory, weapons: entry.character.combatProfile.weapons || [], armorItems: entry.character.combatProfile.armorItems || [], sourcePath, now });
  const nextRecord = projection.record, person = projection.snapshotCharacter;
  assert.deepEqual(withoutEquipment(nextRecord.character), withoutEquipment(record.character));
  assert.deepEqual(withoutEquipment(person), withoutEquipment(snapshotRow));

  assert.deepEqual(nextRecord.local, record.local);
  assert.deepEqual(nextRecord.classification, record.classification);

  const preservedSources = [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])];
  const projections = mergeCharacterRecordProjections({ registry: { ...registry, sourceOverlays: preservedSources }, snapshot, report },
    [projection], [{ sourcePath, exportedAt: now }], snapshot.charTabs);
  const unrelatedCharacters = snapshot.characters.filter(row => row.id !== OWETA_EQUIPMENT_ID);
  assert.deepEqual(projections.snapshot.characters.filter(row => row.id !== OWETA_EQUIPMENT_ID), unrelatedCharacters,
    'Alle unbeteiligten Snapshot-Figuren müssen unverändert bleiben.');
  assert.deepEqual(projections.registry.records.filter(row => row.recordId !== record.recordId),
    registry.records.filter(row => row.recordId !== record.recordId));
  assert.deepEqual(projections.snapshot.charTabs, snapshot.charTabs);
  return { ...projections, exported, verification: { characterId: OWETA_EQUIPMENT_ID,
    addedItemIds: entry.addedItemIds, removedPlaceholderIds: entry.removedPlaceholderIds,
    unrelatedCharactersPreserved: unrelatedCharacters.length, localDataPreserved: true,
    biographyAndGenealogyPreserved: true, liveResourcesPreserved: true, moneyAndCompanionsPreserved: true } };
}
