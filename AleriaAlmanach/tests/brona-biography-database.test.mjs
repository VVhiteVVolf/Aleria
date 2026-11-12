import assert from 'node:assert/strict';
import test from 'node:test';
import { projectBronaBiographyDatabase } from '../modules/brona-biography/brona-biography-database.mjs';

const id = 'XTL39e7WjIwUtoT9Gxml', recordId = `character--${id}`, path = 'records/familien/haus-draig/brona/character.json';
const sourcePath = 'Charakter Archiv Exporte/Biographien/brona-2026-11-08/confirmed.json', now = '2026-11-08T19:00:00.000Z';
function fixture() {
  const character = { id, name: 'Brona Eisenherz', portrait: 'portrait.png', identity: { worldPersonId: 'person--haus-eisenherz--brona-eisenherz' },
    genealogy: { birth: '1701' }, combatProfile: { hitPoints: { current: 7 }, resources: [{ current: 2 }] },
    inventory: { money: '12 Kupfer', moneyState: { totalCopper: 12 }, status: 'Gesund',
      items: [{ id: 'old-tool', name: 'Werkzeug', quantity: '1' }],
      companions: [{ id: 'empty', name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', image: '', description: '' }] } };
  const record = { schema: 'aleria.character-record', recordId, character,
    identity: { name: character.name, aliases: [], worldPersonId: character.identity.worldPersonId },
    classification: { primary: { kind: 'family', id: 'haus-draig' }, familyStatus: 'linked', families: [{ birth: '1701' }] },
    local: { notes: 'Privater lokaler Entwurf bleibt erhalten.' }, sources: { firestoreExports: [{ id, name: character.name }] },
    links: { firestore: { documentId: id, documentIds: [id], documents: [{ documentId: id }] } },
    sync: { sourceDocumentIds: [id], sourceExportedAt: '2026-10-01T00:00:00.000Z', contentHash: 'old' } };
  const person = { ...structuredClone(character), localRecord: { recordId, path, contentHash: 'old', firestoreDocumentIds: [id] } };
  const unrelated = { id: 'another-person', inventory: { money: '23 Kupfer' }, localRecord: { recordId: 'other' } };
  const remote = { id, name: character.name, biography: { biography: { abilities: [{ title: 'Geduldig', icon: 'Patient.png' }] } },
    inventory: structuredClone(character.inventory), updatedAt: now };
  remote.inventory.companions = [];
  for (const name of ['Honigwind', 'Brocken']) {
    const slug = name.toLowerCase(), creatureId = `companion-brona-${slug}`, inventoryItemId = `brona-${slug}`;
    remote.inventory.companions.push({ id: `card-${slug}`, creatureId, inventoryItemId, name });
    remote.inventory.items.push({ id: inventoryItemId, instanceId: inventoryItemId, creatureId, name, ownerCharacterId: id });
  }
  remote.inventory.revision = 15;
  return { record, registry: { sourceOverlays: ['Charakter Archiv Exporte/existing.json'], records: [
    { recordId, firestoreDocumentId: id, path }, { recordId: 'other', firestoreDocumentId: unrelated.id, contentHash: 'unchanged', primary: { kind: 'family', id: 'another-family' } }] },
    snapshot: { sourceOverlays: ['Charakter Archiv Exporte/snapshot-only.json'], charTabs: { Gwynthor: [id, unrelated.id] }, characters: [person, unrelated] },
    report: { summary: { retained: true }, pending: [{ recordId: 'other', detail: 'unchanged' }], details: ['keep'] }, remote,
    receipt: { characterId: id, fields: ['biography', 'inventory', 'updatedAt'], unrelatedCharacterFieldsUnchanged: true,
      createdCreatures: [{ id: 'companion-brona-honigwind' }, { id: 'companion-brona-brocken' }] },
    sourcePath, exportedAt: now };
}

test('confirmed Brona projection changes only reviewed content, protects unrelated records and is stable on repetition', () => {
  const input = fixture(), original = structuredClone(input), result = projectBronaBiographyDatabase(input);
  const next = result.records[0].record;
  assert.deepEqual(next.character.biography, input.remote.biography);
  assert.deepEqual(next.character.inventory, input.remote.inventory);
  for (const key of ['portrait', 'identity', 'genealogy', 'combatProfile']) assert.deepEqual(next.character[key], original.record.character[key]);
  for (const key of ['local', 'classification', 'identity']) assert.deepEqual(next[key], original.record[key]);
  assert.deepEqual(result.snapshot.characters[1], original.snapshot.characters[1]);
  assert.deepEqual(result.registry.records[1], original.registry.records[1]);
  assert.deepEqual(result.report.pending, original.report.pending);
  assert.deepEqual(result.snapshot.charTabs, original.snapshot.charTabs);
  assert(result.registry.sourceOverlays.includes('Charakter Archiv Exporte/snapshot-only.json'));
  assert.deepEqual(input, original);
  const repeated = projectBronaBiographyDatabase({ ...input, record: next, registry: result.registry, snapshot: result.snapshot, report: result.report });
  assert.deepEqual(repeated.records[0].record, next);
  assert.deepEqual(repeated.registry, result.registry);
  assert.deepEqual(repeated.snapshot, result.snapshot);
  assert.deepEqual(repeated.report, result.report);
});

test('projection refuses collateral inventory changes or newer local edits instead of discarding them', () => {
  for (const mutate of [
    input => { input.remote.inventory.moneyState.totalCopper = 0; },
    input => { input.remote.inventory.items[0].quantity = '2'; },
    input => { input.record.character.inventory.items.push({ id: 'local-draft', name: 'Entwurf' }); },
    input => { input.record.character.updatedAt = '2026-11-09T00:00:00.000Z'; }
  ]) {
    const input = fixture(); mutate(input);
    assert.throws(() => projectBronaBiographyDatabase(input));
  }
});

test('projection requires the correct receipt and complete ownership links', () => {
  for (const mutate of [
    input => { input.receipt.unrelatedCharacterFieldsUnchanged = false; },
    input => { input.receipt.fields.push('combatProfile'); },
    input => { input.remote.id = 'another-person'; },
    input => { input.remote.inventory.companions[0].inventoryItemId = 'wrong-item'; },
    input => { input.remote.inventory.items[1].ownerCharacterId = 'another-person'; },
    input => { input.receipt.createdCreatures.pop(); }
  ]) {
    const input = fixture(); mutate(input);
    assert.throws(() => projectBronaBiographyDatabase(input));
  }
});
