import assert from 'node:assert/strict';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { projectEquipmentCharacterRecord, hasNewerEquipmentRecordProjection } from '../../../CharakterDatenbank/lib/character-equipment-record-projection.mjs';
import { moneyTotal, moneyState, toMinor } from '../item-register/item-register-money.js';
import { DRAIG_STARTING_TARGETS } from './starting-possessions.mjs';

export const DRAIG_STARTING_EXPORT_DIRECTORY = 'Charakter Archiv Exporte/Startbesitz 2026-11-05';

function uniqueById(rows, label) {
  assert.ok(Array.isArray(rows), `${label}: Liste fehlt.`);
  const index = new Map();
  for (const row of rows) {
    assert.ok(typeof row?.id === 'string' && row.id && !index.has(row.id), `${label}: fehlende oder doppelte ID.`);
    index.set(row.id, row);
  }
  return index;
}

function preservedCharacterFields(character) {
  const copy = structuredClone(character);
  delete copy.updatedAt;
  if (copy.localRecord) {
    delete copy.localRecord.contentHash;
    delete copy.localRecord.firestoreDocumentIds;
  }
  if (copy.inventory) for (const key of ['items', 'money', 'moneyState', 'revision']) delete copy.inventory[key];
  return copy;
}

function selectConfirmedItems(remote, proof, target) {
  assert.equal(proof.name, target.name, 'Der Startbesitzbeleg benennt eine andere Figur.');
  assert.ok(Array.isArray(proof.addedItemIds) && proof.addedItemIds.length >= 2 && proof.addedItemIds.length <= 4,
    'Zwei bis vier bestätigte neue Besitzstücke werden benötigt.');
  const ids = new Set(proof.addedItemIds);
  assert.equal(ids.size, proof.addedItemIds.length, 'Doppelte bestätigte Besitz-ID.');
  const index = uniqueById(remote.inventory?.items, 'Onlinebesitz');
  return proof.addedItemIds.map(id => {
    assert.ok(typeof id === 'string' && id.startsWith(`${target.id}-draig-start-possessions-20261105-`),
      'Eine Besitz-ID gehört nicht zu diesem Startbesitzauftrag.');
    const item = index.get(id);
    assert.ok(item, 'Ein bestätigtes neues Besitzstück fehlt online.');
    assert.equal(item.ownerCharacterId, target.id, 'Ein neues Besitzstück hat einen anderen Eigentümer.');
    assert.equal(item.ownerCharacterName, target.name, 'Der Eigentümername stimmt nicht überein.');
    assert.equal(item.category, 'other', 'Der neue Startbesitz gehört in Sonstiges.');
    assert.ok(Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0, 'Ungültige Besitzmenge.');
    assert.ok(item.definitionRef?.id && item.definitionRef?.revision, 'Eine bestätigte Gegenstandsdefinition wird benötigt.');
    return item;
  });
}

function mergeConfirmedInventory(local = {}, remote, selected, proof) {
  const items = local.items || [];
  const index = uniqueById(items, 'Lokaler Besitz');
  for (const incoming of selected) {
    assert.ok(!items.some(item => item.id !== incoming.id && item.instanceId === incoming.id),
      'Eine neue Besitz-ID ist lokal als andere Instanz belegt.');
    if (index.has(incoming.id)) assert.deepEqual(index.get(incoming.id), incoming,
      'Ein bereits vorhandenes Startbesitzstück wurde lokal verändert; manuelle Prüfung nötig.');
  }
  assert.deepEqual(remote.moneyState, proof.moneyState, 'Der bestätigte Geldstand weicht ab.');
  assert.deepEqual(remote.moneyState, moneyState(moneyTotal(remote.moneyState)), 'Der bestätigte Wallet ist nicht kanonisch.');
  assert.equal(toMinor(moneyTotal(remote.money)), toMinor(moneyTotal(remote.moneyState)), 'Geldtext und Wallet weichen ab.');
  const revisions = [local.revision ?? 0, remote.revision ?? 0];
  assert.ok(revisions.every(value => Number.isSafeInteger(value) && value >= 0), 'Ungültige Inventarrevision.');
  return { ...structuredClone(local),
    items: [...structuredClone(items), ...selected.filter(item => !index.has(item.id)).map(item => structuredClone(item))],
    money: remote.money, moneyState: structuredClone(remote.moneyState), revision: Math.max(...revisions) };
}

/** Mirror only this confirmed four-person award; never import unrelated online fields. */
export function projectDraigStartingPossessionsDatabase({ registry, snapshot, report, records, online, verification }) {
  assert.equal(verification.verified, true); assert.equal(verification.dryRun, false); assert.equal(verification.idempotent, true);
  assert.equal(online.capturedAt, verification.committedAt);
  assert.ok(Number.isFinite(Date.parse(online.capturedAt)), 'Ein gültiger bestätigter Quellenzeitpunkt wird benötigt.');
  const remoteById = uniqueById(online.characters, 'Onlinefiguren');
  const proofById = uniqueById(verification.profiles, 'Vergabebelege');
  assert.equal(records.length, DRAIG_STARTING_TARGETS.length);
  assert.deepEqual([...remoteById.keys()].sort(), DRAIG_STARTING_TARGETS.map(target => target.id).sort());
  assert.deepEqual([...proofById.keys()].sort(), [...remoteById.keys()].sort());
  const projections = [], exports = [], changedIds = new Set();
  let supersededProfiles = 0, preservedExtraItems = 0;
  for (const target of DRAIG_STARTING_TARGETS) {
    const remote = remoteById.get(target.id), proof = proofById.get(target.id);
    assert.equal(remote.name, target.name);
    for (const worldId of [remote.identity?.worldPersonId, remote.genealogy?.worldPersonId].filter(Boolean)) {
      assert.equal(worldId, target.worldPersonId, 'Die Onlineidentität gehört zu einer anderen Person.');
    }
    const matchingRecords = records.filter(record => record.links?.firestore?.documentId === target.id);
    const rows = registry.records.filter(row => row.firestoreDocumentId === target.id);
    const people = snapshot.characters.filter(character => character.id === target.id);
    assert.equal(matchingRecords.length, 1); assert.equal(rows.length, 1); assert.equal(people.length, 1);
    const [record] = matchingRecords, [row] = rows, [person] = people;
    assert.equal(record.character.id, target.id); assert.equal(record.character.name, target.name);
    assert.equal(record.identity.worldPersonId, target.worldPersonId);
    assert.equal(record.recordId, row.recordId); assert.equal(person.localRecord.recordId, record.recordId);
    assert.equal(person.localRecord.path, row.path);
    const selected = selectConfirmedItems(remote, proof, target);
    const sourcePath = `${DRAIG_STARTING_EXPORT_DIRECTORY}/${target.key}.json`;
    if (hasNewerEquipmentRecordProjection({ record, registry, snapshot, sourcePath, exportedAt: online.capturedAt })) {
      supersededProfiles += 1;
      continue;
    }
    const inventory = mergeConfirmedInventory(record.character.inventory, remote.inventory, selected, proof);
    const snapshotInventory = mergeConfirmedInventory(person.inventory, remote.inventory, selected, proof);
    const { projection, exported } = projectEquipmentCharacterRecord({ record, snapshotCharacter: person, path: row.path,
      inventory, sourcePath, now: online.capturedAt, includeCombatProfile: false });
    // Snapshots can contain independent local additions; preserve their own inventory fields.
    projection.snapshotCharacter.inventory = snapshotInventory;
    assert.deepEqual(preservedCharacterFields(projection.record.character), preservedCharacterFields(record.character));
    assert.deepEqual(preservedCharacterFields(projection.snapshotCharacter), preservedCharacterFields(person));
    assert.deepEqual(projection.record.local, record.local); assert.deepEqual(projection.record.classification, record.classification);
    preservedExtraItems += (record.character.inventory?.items || []).filter(item => !proof.addedItemIds.includes(item.id)).length;
    projections.push(projection); exports.push(exported); changedIds.add(target.id);
  }
  const sourceOverlays = [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])];
  const result = projections.length
    ? mergeCharacterRecordProjections({ registry: { ...registry, sourceOverlays }, snapshot, report }, projections, exports, snapshot.charTabs)
    : { records: [], registry: structuredClone(registry), snapshot: structuredClone(snapshot), report: structuredClone(report) };
  assert.deepEqual(result.snapshot.characters.filter(character => !changedIds.has(character.id)),
    snapshot.characters.filter(character => !changedIds.has(character.id)), 'Unbeteiligte Figuren müssen erhalten bleiben.');
  assert.deepEqual(result.registry.records.filter(row => !changedIds.has(row.firestoreDocumentId)),
    registry.records.filter(row => !changedIds.has(row.firestoreDocumentId)));
  assert.deepEqual(result.snapshot.charTabs, snapshot.charTabs);
  return { ...result, exports, verification: { profiles: DRAIG_STARTING_TARGETS.length, supersededProfiles,
    unrelatedCharactersPreserved: snapshot.characters.length - changedIds.size, preservedExtraItems,
    localDataPreserved: true, combatResourcesPreserved: true, sourceTimestamp: online.capturedAt } };
}
