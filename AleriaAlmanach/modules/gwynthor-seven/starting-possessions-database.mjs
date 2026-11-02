import assert from 'node:assert/strict';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { projectEquipmentCharacterRecord } from '../../../CharakterDatenbank/lib/character-equipment-record-projection.mjs';
import { KNIGHT_EQUIPMENT_TARGETS } from './knight-equipment-plan.mjs';
import { GWYNTHOR_SEVEN_LOADOUTS } from './equipment.mjs';

export const KNIGHT_STARTING_EXPORT_DIRECTORY = 'Charakter Archiv Exporte/Startbesitz 2026-11-02';

// Later confirmed imports own the database; the seed builder cannot replace
// their money, inventory or metadata using its historical creation baseline.
export function hasKnightStartingPossessionsProjection(registry, snapshot) {
  const paths = KNIGHT_EQUIPMENT_TARGETS.map(target => `${KNIGHT_STARTING_EXPORT_DIRECTORY}/${target.key}.json`);
  const lists = [registry.sourceOverlays || [], snapshot.sourceOverlays || []];
  if (!lists.some(list => paths.some(path => list.includes(path)))) return false;
  assert(lists.every(list => paths.every(path => list.includes(path))), 'Unvollständige Startbesitz-Projektionsverantwortung.');
  return true;
}

function preservedFields(character) {
  const copy = structuredClone(character);
  delete copy.updatedAt;
  if (copy.localRecord) { delete copy.localRecord.contentHash; delete copy.localRecord.firestoreDocumentIds; }
  if (copy.inventory) for (const key of ['items', 'money', 'moneyState', 'revision']) delete copy.inventory[key];
  if (copy.combatProfile) {
    delete copy.combatProfile.weapons; delete copy.combatProfile.armorItems;
    if (!Object.keys(copy.combatProfile).length) delete copy.combatProfile;
  }
  return copy;
}

function mergeById(local = [], remote = [], linked = false) {
  assert.ok(Array.isArray(local) && Array.isArray(remote), 'Eine Besitz-/Ausrüstungsliste ist ungültig.');
  const incoming = new Map();
  for (const item of remote) {
    assert.ok(item?.id && !incoming.has(item.id), 'Fehlende oder doppelte Online-Instanz-ID.');
    incoming.set(item.id, item);
    assert.ok(!local.some(prior => prior.id !== item.id && prior.instanceId === item.id), 'Eine Online-ID ist lokal als andere Instanz belegt.');
  }
  assert.equal(new Set(local.map(item => item.id)).size, local.length, 'Doppelte lokale Besitz-ID.');
  const merged = local.map(item => {
    const replacement = incoming.get(item.id);
    if (!replacement) return structuredClone(item);
    if (linked) assert.equal(item.inventoryItemId, replacement.inventoryItemId, 'Eine Kampf-ID verweist auf ein anderes Besitzstück.');
    incoming.delete(item.id);
    return structuredClone(replacement);
  });
  return [...merged, ...[...incoming.values()].map(item => structuredClone(item))];
}

function mergePublishedEquipment(local, remote, proof, target) {
  const coreTemplates = new Set(GWYNTHOR_SEVEN_LOADOUTS[target.key].map(([key]) => `gwynthor-seven:${key}`));
  const starterIds = new Set(proof.items.map(item => item.id));
  assert.ok(starterIds.size >= 2 && starterIds.size <= 3 && starterIds.size === proof.items.length, 'Der bestätigte Startbesitz ist unvollständig.');
  const remoteItems = remote.inventory?.items;
  assert.ok(Array.isArray(remoteItems));
  for (const expected of proof.items) {
    const matches = remoteItems.filter(item => item.id === expected.id);
    assert.equal(matches.length, 1, 'Ein bestätigtes Startbesitzstück fehlt online.');
    assert.equal(matches[0].ownerCharacterId, remote.id);
    assert.equal(String(matches[0].quantity), String(expected.quantity));
    assert.deepEqual(matches[0].definitionRef, expected.definitionRef);
  }
  assert.deepEqual(remote.inventory.moneyState, proof.moneyState, 'Der bestätigte Geldstand weicht ab.');
  const selected = remoteItems.filter(item => starterIds.has(item.id) || coreTemplates.has(item.templateId || item.definitionRef?.id));
  const coreIds = new Set(selected.filter(item => coreTemplates.has(item.templateId || item.definitionRef?.id)).map(item => item.id));
  const inventory = { ...structuredClone(local.inventory || {}),
    items: mergeById(local.inventory?.items || [], selected), money: remote.inventory.money,
    moneyState: structuredClone(remote.inventory.moneyState) };
  const revisions = [local.inventory?.revision ?? 0, remote.inventory.revision ?? 0];
  assert.ok(revisions.every(value => Number.isSafeInteger(value) && value >= 0), 'Ungültige Inventarrevision.');
  inventory.revision = Math.max(...revisions);
  const combat = Object.fromEntries(['weapons', 'armorItems'].map(collection => [collection,
    mergeById(local.combatProfile?.[collection] || [], (remote.combatProfile?.[collection] || []).filter(entry => coreIds.has(entry.inventoryItemId)), true)]));
  return { inventory, ...combat, selectedIds: new Set(selected.map(item => item.id)) };
}

/** Import the verified four-person award without replacing local extra possessions. */
export function projectKnightStartingPossessionsDatabase({ registry, snapshot, report, records, online, verification }) {
  assert.equal(verification.verified, true); assert.equal(verification.dryRun, false); assert.equal(verification.idempotent, true);
  assert.equal(online.capturedAt, verification.committedAt);
  assert.ok(Number.isFinite(Date.parse(online.capturedAt)), 'Ein fester bestätigter Quellenzeitpunkt wird benötigt.');
  assert.equal(online.characters.length, 4); assert.equal(verification.profiles.length, 4); assert.equal(records.length, 4);
  const projections = [], exports = [], selectedIds = new Set();
  let preservedExtraItems = 0;
  for (const target of KNIGHT_EQUIPMENT_TARGETS) {
    const matches = online.characters.filter(character => target.knownIds.includes(character.id));
    assert.equal(matches.length, 1, 'Die veröffentlichte Figur ist nicht eindeutig.');
    const [remote] = matches;
    assert.equal(remote.name, target.name);
    for (const worldId of [remote.identity?.worldPersonId, remote.genealogy?.worldPersonId].filter(Boolean)) assert.equal(worldId, target.worldPersonId);
    const matchingRecords = records.filter(record => record.links.firestore.documentId === remote.id);
    const matchingRegistry = registry.records.filter(row => row.firestoreDocumentId === remote.id);
    const matchingSnapshot = snapshot.characters.filter(row => row.id === remote.id);
    const proofs = verification.profiles.filter(profile => profile.name === target.name);
    assert.equal(matchingRecords.length, 1); assert.equal(matchingRegistry.length, 1); assert.equal(matchingSnapshot.length, 1); assert.equal(proofs.length, 1);
    const [record] = matchingRecords, [registryRow] = matchingRegistry, [person] = matchingSnapshot;
    assert.equal(record.identity.worldPersonId, target.worldPersonId);
    assert.equal(record.recordId, registryRow.recordId); assert.equal(person.localRecord.recordId, record.recordId);
    assert.equal(person.localRecord.path, registryRow.path);
    const merged = mergePublishedEquipment(record.character, remote, proofs[0], target);
    const sourcePath = `${KNIGHT_STARTING_EXPORT_DIRECTORY}/${target.key}.json`;
    const { projection, exported } = projectEquipmentCharacterRecord({ record, snapshotCharacter: person, path: registryRow.path,
      ...merged, sourcePath, now: online.capturedAt });
    assert.deepEqual(preservedFields(projection.record.character), preservedFields(record.character), 'Unbeteiligte lokale Charakterfelder müssen erhalten bleiben.');
    assert.deepEqual(preservedFields(projection.snapshotCharacter), preservedFields(person));
    assert.deepEqual(projection.record.local, record.local); assert.deepEqual(projection.record.classification, record.classification);
    preservedExtraItems += (record.character.inventory?.items || []).filter(item => !merged.selectedIds.has(item.id)).length;
    projections.push(projection); exports.push(exported); selectedIds.add(remote.id);
  }
  const sourceOverlays = [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])];
  const result = mergeCharacterRecordProjections({ registry: { ...registry, sourceOverlays }, snapshot, report }, projections, exports, snapshot.charTabs);
  const unrelated = snapshot.characters.filter(character => !selectedIds.has(character.id));
  assert.deepEqual(result.snapshot.characters.filter(character => !selectedIds.has(character.id)), unrelated);
  assert.deepEqual(result.registry.records.filter(row => !selectedIds.has(row.firestoreDocumentId)), registry.records.filter(row => !selectedIds.has(row.firestoreDocumentId)));
  assert.deepEqual(result.snapshot.charTabs, snapshot.charTabs);
  return { ...result, exports, verification: { profiles: 4, unrelatedCharactersPreserved: unrelated.length,
    preservedExtraItems, localDataPreserved: true, biographyAndGenealogyPreserved: true, combatResourcesPreserved: true, sourceTimestamp: online.capturedAt } };
}
