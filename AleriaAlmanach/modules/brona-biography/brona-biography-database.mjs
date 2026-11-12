import assert from 'node:assert/strict';
import { confirmCharacterRecordProjection } from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../../../CharakterDatenbank/lib/character-record-projections.mjs';
import { isUnassignedCompanionCard } from '../creatures/creature-companion-link.js';

const CHARACTER_ID = 'XTL39e7WjIwUtoT9Gxml';
const COMPANIONS = Object.freeze({ 'companion-brona-honigwind': 'Honigwind', 'companion-brona-brocken': 'Brocken' });
const IMPORTED_FIELDS = ['biography', 'inventory', 'updatedAt'];

function protectedInventory(inventory) {
  const value = structuredClone(inventory);
  delete value.revision;
  value.items = (value.items || []).filter(item => !Object.hasOwn(COMPANIONS, item.creatureId));
  value.companions = (value.companions || []).filter(card => !Object.hasOwn(COMPANIONS, card.creatureId) && !isUnassignedCompanionCard(card));
  return value;
}

function assertConfirmedCompanions(inventory) {
  for (const [creatureId, name] of Object.entries(COMPANIONS)) {
    const cards = inventory.companions.filter(card => card.creatureId === creatureId);
    const items = inventory.items.filter(item => item.creatureId === creatureId);
    assert.equal(cards.length, 1, `${name}: eindeutige bestätigte Gefährtenkarte benötigt.`);
    assert.equal(items.length, 1, `${name}: eindeutiger bestätigter Inventarbesitz benötigt.`);
    const [card] = cards, [item] = items;
    assert.equal(card.name, name);
    assert.equal(item.name, name);
    assert.equal(card.inventoryItemId, item.id);
    assert.equal(item.ownerCharacterId, CHARACTER_ID);
    assert(item.instanceId, `${name}: Einzelstückkennung fehlt.`);
  }
}

// Import a confirmed, narrow server readback without rebuilding identity,
// genealogy, classification, independent local notes or any other character.
export function projectBronaBiographyDatabase({ registry, snapshot, report, record, remote, receipt, sourcePath, exportedAt }) {
  assert.equal(remote.id, CHARACTER_ID);
  assert.equal(record.character.id, CHARACTER_ID);
  assert.equal(record.links.firestore.documentId, CHARACTER_ID);
  assert.equal(record.identity.worldPersonId, 'person--haus-eisenherz--brona-eisenherz');
  assert.equal(receipt.characterId, CHARACTER_ID);
  assert(receipt.unrelatedCharacterFieldsUnchanged, 'Bestätigter begrenzter Serverreadback benötigt.');
  assert.deepEqual([...receipt.fields].sort(), [...IMPORTED_FIELDS].sort());
  assert.deepEqual(receipt.createdCreatures.map(creature => creature.id).sort(), Object.keys(COMPANIONS).sort());
  assert(Number.isFinite(Date.parse(exportedAt)) && Number.isFinite(Date.parse(remote.updatedAt)));
  assert(remote.biography?.biography && remote.inventory, 'Vollständiger Bio-/Inventarreadback fehlt.');
  assertConfirmedCompanions(remote.inventory);
  const rows = registry.records.filter(row => row.firestoreDocumentId === CHARACTER_ID);
  const people = snapshot.characters.filter(person => person.id === CHARACTER_ID);
  assert.equal(rows.length, 1);
  assert.equal(people.length, 1);
  const [row] = rows, [person] = people;
  assert.equal(row.recordId, record.recordId);
  assert.equal(person.localRecord.recordId, record.recordId);
  assert.equal(person.localRecord.path, row.path);
  const apply = character => {
    assert(!(Date.parse(character.updatedAt) > Date.parse(remote.updatedAt)), 'Eine neuere lokale Figurenbearbeitung darf nicht überschrieben werden.');
    assert.deepEqual(protectedInventory(character.inventory), protectedInventory(remote.inventory),
      'Geschützter lokaler Inventarstand weicht vom bestätigten Onlinebestand ab; kein pauschales Überschreiben.');
    return { ...structuredClone(character), ...Object.fromEntries(IMPORTED_FIELDS.map(key => [key, structuredClone(remote[key])])) };
  };
  const character = apply(record.character), projectedPerson = apply(person);
  const exportedCharacter = { id: CHARACTER_ID, name: character.name,
    ...Object.fromEntries(IMPORTED_FIELDS.map(key => [key, structuredClone(remote[key])])) };
  const confirmation = confirmCharacterRecordProjection({ record, snapshotCharacter: person, path: row.path,
    character, person: projectedPerson, exportedCharacter, sourcePath, now: exportedAt });
  const sourceOverlays = [...new Set([...(registry.sourceOverlays || []), ...(snapshot.sourceOverlays || [])])];
  const result = mergeCharacterRecordProjections({ registry: { ...registry, sourceOverlays }, snapshot, report },
    [confirmation.projection], [confirmation.exported], snapshot.charTabs);
  assert.deepEqual(result.snapshot.characters.filter(person => person.id !== CHARACTER_ID), snapshot.characters.filter(person => person.id !== CHARACTER_ID));
  assert.deepEqual(result.registry.records.filter(entry => entry.recordId !== record.recordId), registry.records.filter(entry => entry.recordId !== record.recordId));
  assert.deepEqual(result.snapshot.charTabs, snapshot.charTabs);
  assert.deepEqual(confirmation.projection.record.local, record.local);
  assert.deepEqual(confirmation.projection.record.classification, record.classification);
  return { ...result, exported: confirmation.exported, verification: { characterId: CHARACTER_ID,
    fields: IMPORTED_FIELDS, linkedCreatures: Object.keys(COMPANIONS),
    unrelatedCharactersPreserved: snapshot.characters.length - 1,
    localIdentityClassificationAndGenealogyPreserved: true, protectedInventoryPreserved: true } };
}
