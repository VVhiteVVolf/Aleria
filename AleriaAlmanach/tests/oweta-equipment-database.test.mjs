import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';
import { KNIGHT_EQUIPMENT_TARGETS } from '../modules/gwynthor-seven/knight-equipment-plan.mjs';
import { OWETA_EQUIPMENT_ID, projectOwetaEquipmentDatabase } from '../modules/gwynthor-seven/oweta-equipment-database.mjs';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';

const root = new URL('../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [registry, snapshot, report] = await Promise.all([
  'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'
].map(read));
const row = registry.records.find(item => item.firestoreDocumentId === OWETA_EQUIPMENT_ID);
const record = await read(`CharakterDatenbank/${row.path}`);
const characters = KNIGHT_EQUIPMENT_TARGETS.map(target => snapshot.characters.find(character => target.knownIds.includes(character.id)));
const options = { registry, snapshot, report, record, characters, templates: AUTHORED_ITEMS,
  sourcePath: 'Charakter Archiv Exporte/oweta-draig-ausruestung-2026-11-02.json', now: '2026-11-02T18:30:00.000Z' };
record.sync.sourceArchive = options.sourcePath;
record.sync.sourceExportedAt = options.now;

test('Owetas historischer Ausrüstungsimport erhält einen neueren bestätigten Inventarstand', () => {
  const input = structuredClone(options), archive = 'Charakter Archiv Exporte/Neuerer Besitz/oweta.json';
  for (const index of [input.registry, input.snapshot]) index.sourceOverlays = [...index.sourceOverlays, archive].sort();
  input.record.sync.sourceArchive = archive; input.record.sync.sourceExportedAt = '2099-01-01T00:00:00.000Z';
  const result = projectOwetaEquipmentDatabase(input);
  assert.equal(result.verification.superseded, true);
  assert.deepEqual(result.records, []); assert.equal(result.exported, null);
  assert.deepEqual(result.snapshot, input.snapshot);
});

test('Owetas Ausrüstungsprojektion erhält sämtliche unbeteiligten Figuren, eigene Stammdaten und Quellenhistorie', () => {
  const before = JSON.stringify(options);
  const result = projectOwetaEquipmentDatabase(options);
  const next = result.records[0].record;
  assert.equal(result.records[0].path, row.path);
  assert.deepEqual(result.snapshot.characters.filter(character => character.id !== OWETA_EQUIPMENT_ID),
    snapshot.characters.filter(character => character.id !== OWETA_EQUIPMENT_ID));
  for (const field of ['biography', 'genealogy', 'identity', 'portrait', 'imageSets', 'bio']) {
    assert.deepEqual(next.character[field], record.character[field], field);
  }
  assert.deepEqual(next.local, record.local);
  assert.deepEqual(next.classification, record.classification);
  assert.deepEqual(next.sources.firestoreExports.slice(0, record.sources.firestoreExports.length), record.sources.firestoreExports);
  for (const field of ['money', 'moneyState', 'companions']) assert.deepEqual(next.character.inventory[field], record.character.inventory[field]);
  assert.deepEqual(next.character.combatProfile?.hitPoints, record.character.combatProfile?.hitPoints);
  const realItems = record.character.inventory.items.filter(item => item.name === 'Heulwen');
  assert.ok(realItems.length);
  for (const item of realItems) assert.deepEqual(next.character.inventory.items.find(other => other.id === item.id), item);
  for (const key of ['draig-jungritter-ruestung', 'draig-ritterschwert', 'draig-dolch']) {
    const item = next.character.inventory.items.find(item => item.templateId === `gwynthor-seven:${key}`);
    assert.ok(item?.definitionRef);
    assert.ok([...next.character.combatProfile.weapons, ...next.character.combatProfile.armorItems].some(entry => entry.inventoryItemId === item.id));
  }
  const expectedHash = characterDatabaseContentHash(next.character, next.classification, next.sync.sourceDocumentIds);
  assert.equal(next.sync.contentHash, expectedHash);
  assert.equal(result.registry.records.find(item => item.recordId === record.recordId).contentHash, expectedHash);
  assert.equal(result.snapshot.characters.find(item => item.id === OWETA_EQUIPMENT_ID).localRecord.contentHash, expectedHash);
  assert.equal(JSON.stringify(options), before, 'Die Eingabedaten werden nicht verändert.');
});

test('Der erneute Oweta-Abgleich ergänzt weder Besitz noch Quellen ein zweites Mal', () => {
  const first = projectOwetaEquipmentDatabase(options);
  const second = projectOwetaEquipmentDatabase({ ...options, registry: first.registry, snapshot: first.snapshot, report: first.report,
    record: first.records[0].record, characters: characters.map(character => character.id === OWETA_EQUIPMENT_ID ? first.records[0].record.character : character) });
  for (const field of ['registry', 'snapshot', 'report', 'records', 'exported']) assert.deepEqual(second[field], first[field], field);
  assert.deepEqual(second.verification.addedItemIds, []);
  assert.deepEqual(second.verification.removedPlaceholderIds, []);
});

test('Widersprüchliche Weltidentität stoppt Owetas lokale Projektion', () => {
  const conflicting = structuredClone(record);
  conflicting.identity.worldPersonId = 'person--haus-draig--gawain-draig';
  assert.throws(() => projectOwetaEquipmentDatabase({ ...options, record: conflicting }));
});
