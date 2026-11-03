import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { KNIGHT_EQUIPMENT_TARGETS } from '../modules/gwynthor-seven/knight-equipment-plan.mjs';
import { projectKnightStartingPossessionsDatabase, hasKnightStartingPossessionsProjection, KNIGHT_STARTING_EXPORT_DIRECTORY } from '../modules/gwynthor-seven/starting-possessions-database.mjs';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';

const root = new URL('../../', import.meta.url), read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [registry, snapshot, report, prepared, plan] = await Promise.all([
  'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json',
  'diagnostics/knight-equipment-20261102/starting-characters-prepared.json', 'diagnostics/knight-equipment-20261102/starting-prepared-plan.json'
].map(read));
const records = await Promise.all(KNIGHT_EQUIPMENT_TARGETS.map(target => {
  const row = registry.records.find(row => target.knownIds.includes(row.firestoreDocumentId));
  return read(`CharakterDatenbank/${row.path}`);
}));
// The prepared online transaction fixture is explicitly marked confirmed only
// inside this pure test. The executable importer requires the actual afterfile.
const verification = { ...plan, verified: true, dryRun: false, idempotent: true, committedAt: prepared.capturedAt };
const options = { registry, snapshot, report, records, online: prepared, verification };
// Exercise historical imports from their own provenance baseline, retaining
// today's additional possessions as explicit preservation fixtures.
for (const record of records) {
  const target = KNIGHT_EQUIPMENT_TARGETS.find(target => target.knownIds.includes(record.character.id));
  record.sync.sourceArchive = `${KNIGHT_STARTING_EXPORT_DIRECTORY}/${target.key}.json`;
  record.sync.sourceExportedAt = prepared.capturedAt;
}

test('Ein vollständig registrierter neuerer Ausrüstungsimport wird vom alten Beleg nicht zurückgesetzt', () => {
  const input = structuredClone(options), archive = 'Charakter Archiv Exporte/Neuerer Besitz/person.json';
  input.registry.sourceOverlays.push(archive); input.snapshot.sourceOverlays.push(archive);
  input.registry.sourceOverlays.sort(); input.snapshot.sourceOverlays.sort();
  for (const record of input.records) {
    record.sync.sourceArchive = archive;
    record.sync.sourceExportedAt = '2099-01-01T00:00:00.000Z';
  }
  const result = projectKnightStartingPossessionsDatabase(input);
  assert.equal(result.verification.supersededProfiles, 4);
  assert.deepEqual(result.records, []); assert.deepEqual(result.exports, []);
  assert.deepEqual(result.snapshot, input.snapshot);
  input.snapshot.sourceOverlays = input.snapshot.sourceOverlays.filter(path => path !== archive);
  assert.throws(() => projectKnightStartingPossessionsDatabase(input), /nicht vollständig registriert/);
});

test('Ein bestätigter späterer Import besitzt die Projektionen; unvollständige Zuständigkeiten werden abgewiesen', () => {
  assert.equal(hasKnightStartingPossessionsProjection({}, {}), false);
  const sourceOverlays = KNIGHT_EQUIPMENT_TARGETS.map(target => `${KNIGHT_STARTING_EXPORT_DIRECTORY}/${target.key}.json`);
  assert.equal(hasKnightStartingPossessionsProjection({ sourceOverlays }, { sourceOverlays }), true);
  assert.throws(() => hasKnightStartingPossessionsProjection({ sourceOverlays }, { sourceOverlays: sourceOverlays.slice(1) }), /Unvollständige/);
  assert.throws(() => hasKnightStartingPossessionsProjection({ sourceOverlays: sourceOverlays.slice(0, 1) }, {}), /Unvollständige/);
});

test('Der bestätigte Viererimport erhält lokale Zusatzitems, Begleiter, Profile und alle unbeteiligten Figuren', () => {
  const input = structuredClone(options);
  const rianna = input.records.find(record => record.character.name === 'Rianna Wyrm');
  const extra = { id: 'pending-local-companion', name: 'Lokaler Begleiterentwurf', creatureId: 'sir-fressbert-pending', custom: true };
  rianna.character.inventory.items.push(extra);
  input.snapshot.characters.find(character => character.id === rianna.character.id).inventory.items.push(structuredClone(extra));
  rianna.local.notes = 'Eigene Notiz unbedingt behalten.';
  const before = structuredClone(input);
  const result = projectKnightStartingPossessionsDatabase(input);
  const ids = new Set(KNIGHT_EQUIPMENT_TARGETS.flatMap(target => target.knownIds));
  assert.deepEqual(result.snapshot.characters.filter(character => !ids.has(character.id)), input.snapshot.characters.filter(character => !ids.has(character.id)));
  for (const { record } of result.records) {
    const previous = input.records.find(row => row.recordId === record.recordId);
    for (const field of ['biography', 'genealogy', 'emotes', 'imageSets', 'portrait']) assert.deepEqual(record.character[field], previous.character[field]);
    assert.deepEqual(record.local, previous.local);
    assert.deepEqual(record.classification, previous.classification);
    assert.deepEqual(record.character.inventory.companions, previous.character.inventory.companions);
    assert.deepEqual(record.character.combatProfile?.hitPoints, previous.character.combatProfile?.hitPoints);
    const source = prepared.characters.find(character => character.id === record.character.id);
    assert.deepEqual(record.character.inventory.moneyState, source.inventory.moneyState);
    const proof = verification.profiles.find(profile => profile.name === record.character.name);
    for (const item of proof.items) assert.deepEqual(record.character.inventory.items.find(owned => owned.id === item.id), source.inventory.items.find(owned => owned.id === item.id));
    assert.equal(record.sync.contentHash, characterDatabaseContentHash(record.character, record.classification, record.sync.sourceDocumentIds));
  }
  assert.deepEqual(result.records.find(({ record }) => record.character.id === rianna.character.id).record.character.inventory.items.find(item => item.id === extra.id), extra);
  assert.equal(result.exports.length, 4);
  for (const exported of result.exports) assert.deepEqual(Object.keys(exported.character).sort(), ['id', 'name', 'inventory', 'combatProfile', 'updatedAt'].sort());
  assert.deepEqual(input, before, 'Eingabequellen dürfen nicht mutiert werden.');
});

test('Der wiederholte bestätigte Viererimport ist für Akten, Projektionen und Quellen idempotent', () => {
  const first = projectKnightStartingPossessionsDatabase(options);
  const second = projectKnightStartingPossessionsDatabase({ ...options, registry: first.registry, snapshot: first.snapshot,
    report: first.report, records: first.records.map(item => item.record) });
  for (const key of ['registry', 'snapshot', 'report', 'records', 'exports']) assert.deepEqual(second[key], first[key], key);
});

test('Unbestätigte Quellen, falsche Personen oder abweichende Wallets stoppen den Viererimport', () => {
  assert.throws(() => projectKnightStartingPossessionsDatabase({ ...options, verification: { ...verification, verified: false } }));
  const wrongPerson = structuredClone(prepared); wrongPerson.characters[0].identity = { worldPersonId: 'person--fremd' };
  assert.throws(() => projectKnightStartingPossessionsDatabase({ ...options, online: wrongPerson }));
  const wrongWallet = structuredClone(prepared); wrongWallet.characters[0].inventory.moneyState.totalCopper += 1;
  assert.throws(() => projectKnightStartingPossessionsDatabase({ ...options, online: wrongWallet }), /Geldstand/);
});
