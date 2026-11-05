import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAIG_STARTING_TARGETS } from '../modules/draig-starting-possessions/starting-possessions.mjs';
import { projectDraigStartingPossessionsDatabase } from '../modules/draig-starting-possessions/starting-possessions-database.mjs';
import { moneyState, formatMoney } from '../modules/item-register/item-register-money.js';
import { buildCharacterDatabase, markCharacterDatabaseOverlay } from '../../CharakterDatenbank/lib/character-database-model.mjs';

const at = '2026-11-05T01:00:00.000Z';
function fixture() {
  const records = [], people = [], rows = [], remote = [], proofs = [];
  for (const target of DRAIG_STARTING_TARGETS) {
    const path = `records/familien/${target.key}/character.json`, recordId = `character--${target.id}`;
    const classification = { primary: { kind: 'family', id: target.key, label: target.name }, familyStatus: 'linked' };
    const prior = { id: `${target.id}-prior`, name: 'Bestehendes Andenken', ownerCharacterId: target.id, customized: true };
    const character = { id: target.id, name: target.name, bio: 'Eigener lokaler Text.', portrait: 'lokal.png',
      identity: { worldPersonId: target.worldPersonId }, genealogy: { worldPersonId: target.worldPersonId },
      inventory: { items: [prior], moneyState: moneyState(0), money: formatMoney(moneyState(0)), revision: 2,
        companions: [{ id: 'unveraenderter-begleiter' }], localInventorySetting: true },
      combatProfile: { hitPoints: { current: 7, maximum: 19 }, resources: { focus: 2 } }, updatedAt: '2026-11-01T00:00:00.000Z' };
    const record = { recordId, identity: { name: target.name, aliases: [], worldPersonId: target.worldPersonId }, classification,
      links: { firestore: { documentId: target.id, documentIds: [target.id], documents: [] } },
      local: { notes: 'Lokale Notiz' }, sources: { firestoreExports: [] },
      sync: { sourceArchive: 'alter-export.json', sourceExportedAt: character.updatedAt, sourceDocumentIds: [target.id] }, character };
    const person = { ...structuredClone(character), localRecord: { recordId, path, contentHash: 'old', firestoreDocumentIds: [target.id] } };
    person.inventory.items.push({ id: `${target.id}-snapshot-only`, name: 'Nur im Snapshot vorhandener Entwurf' });
    person.inventory.snapshotSetting = 'behalten';
    person.inventory.revision = 8;
    const added = [1, 2].map(number => ({ id: `${target.id}-draig-start-possessions-20261105-${number}`,
      name: `Kleinigkeit ${number}`, ownerCharacterId: target.id, ownerCharacterName: target.name,
      category: 'other', quantity: '1', definitionRef: { id: `standard:test:${number}`, revision: 'rev-1' } }));
    const published = { ...structuredClone(character), bio: 'Dieser Online-Text darf lokal nicht übernommen werden.',
      inventory: { ...structuredClone(character.inventory), items: [...character.inventory.items, ...added,
        { id: `${target.id}-unrelated-online`, name: 'Nicht zu importierender Onlinebesitz' }],
      moneyState: moneyState(target.key.startsWith('refri') ? 0.12 : 1000), revision: 5 },
      combatProfile: { hitPoints: { current: 0 } } };
    published.inventory.money = formatMoney(published.inventory.moneyState);
    records.push(record); people.push(person);
    rows.push({ recordId, name: target.name, firestoreDocumentId: target.id, firestoreDocumentIds: [target.id],
      path, primary: classification.primary, familyStatus: 'linked' });
    remote.push(published); proofs.push({ id: target.id, name: target.name, addedItemIds: added.map(item => item.id), moneyState: published.inventory.moneyState });
  }
  people.push({ id: 'unrelated', name: 'Unbeteiligte Figur', inventory: { revision: 77 } });
  rows.push({ recordId: 'character--unrelated', firestoreDocumentId: 'unrelated', primary: { kind: 'family' }, familyStatus: 'linked', firestoreDocumentIds: ['unrelated'] });
  return { registry: { records: rows, sourceOverlays: [], sourceExportedAt: '2026-11-01T00:00:00.000Z', count: rows.length },
    snapshot: { characters: people, sourceOverlays: [], charTabs: { map: { Eigen: ['unrelated'] } } },
    report: { summary: {}, pending: [], customReportField: 'behalten' }, records,
    online: { capturedAt: at, characters: remote },
    verification: { verified: true, dryRun: false, idempotent: true, committedAt: at, profiles: proofs } };
}

test('Die begrenzte Projektion erhält alle lokalen Items, unabhängige Snapshotfelder und Kampfressourcen', () => {
  const input = fixture(), before = structuredClone(input);
  const result = projectDraigStartingPossessionsDatabase(input);
  assert.equal(result.records.length, 4); assert.equal(result.exports.length, 4);
  for (const target of DRAIG_STARTING_TARGETS) {
    const record = result.records.find(entry => entry.record.character.id === target.id).record;
    const person = result.snapshot.characters.find(person => person.id === target.id);
    const prior = input.records.find(record => record.character.id === target.id).character;
    assert.equal(record.character.bio, prior.bio); assert.deepEqual(record.character.combatProfile, prior.combatProfile);
    assert.deepEqual(record.character.inventory.items[0], prior.inventory.items[0]);
    assert.equal(record.character.inventory.items.length, 3); assert.equal(person.inventory.items.length, 4);
    assert.equal(record.character.inventory.revision, 5); assert.equal(person.inventory.revision, 8);
    assert.equal(person.inventory.snapshotSetting, 'behalten');
    assert.equal(record.local.notes, 'Lokale Notiz');
    assert.deepEqual(record.character.inventory.moneyState, input.online.characters.find(person => person.id === target.id).inventory.moneyState);
  }
  assert.deepEqual(result.snapshot.characters.at(-1), input.snapshot.characters.at(-1));
  assert.deepEqual(result.snapshot.charTabs, input.snapshot.charTabs);
  for (const exported of result.exports) assert.deepEqual(Object.keys(exported.character).sort(), ['id', 'name', 'inventory', 'updatedAt'].sort());
  assert.deepEqual(input, before);
});

test('Wiederholung desselben bestätigten Imports ist einschließlich Quellen und Metadaten idempotent', () => {
  const input = fixture(), first = projectDraigStartingPossessionsDatabase(input);
  const second = projectDraigStartingPossessionsDatabase({ ...input, registry: first.registry, snapshot: first.snapshot,
    report: first.report, records: first.records.map(entry => entry.record) });
  for (const key of ['registry', 'snapshot', 'report', 'records', 'exports']) assert.deepEqual(second[key], first[key], key);
});

test('Der kanonische Datenbankbuilder erhält die bestätigten Startbesitzexporte gegenüber älteren reichen Inventarquellen', () => {
  const input = fixture(), projected = projectDraigStartingPossessionsDatabase(input);
  for (const reverse of [false, true]) {
    const older = input.records.map(record => structuredClone(record.character));
    const confirmed = projected.exports.map(exported => {
      assert.equal(exported.mergeStrategy, 'replace-exported-fields');
      assert.ok(projected.registry.sourceOverlays.includes(exported.sourcePath));
      assert.ok(projected.snapshot.sourceOverlays.includes(exported.sourcePath));
      assert.equal(exported.character.updatedAt, at);
      return markCharacterDatabaseOverlay(structuredClone(exported.character), { replaceExportedFields: true });
    });
    const sources = [...older, ...confirmed];
    if (reverse) sources.reverse();
    const rebuilt = buildCharacterDatabase({ characters: sources, exportedAt: at }, []).records;
    assert.equal(rebuilt.length, 4);
    for (const exported of projected.exports) {
      const character = rebuilt.find(entry => entry.record.character.id === exported.character.id).record.character;
      assert.deepEqual(character.inventory, exported.character.inventory);
      const previous = input.records.find(record => record.character.id === character.id).character;
      assert.deepEqual(character.combatProfile, previous.combatProfile);
      assert.equal(character.bio, previous.bio);
    }
  }
});

test('Unbestätigte Daten, falsche Identitäten und zusätzliche Empfänger werden abgewiesen', () => {
  for (const field of ['verified', 'idempotent']) {
    const input = fixture(); input.verification[field] = false;
    assert.throws(() => projectDraigStartingPossessionsDatabase(input));
  }
  const wrongDate = fixture(); wrongDate.online.capturedAt = '2026-11-06T00:00:00.000Z';
  assert.throws(() => projectDraigStartingPossessionsDatabase(wrongDate));
  const wrongPerson = fixture(); wrongPerson.online.characters[0].identity.worldPersonId = 'fremd';
  assert.throws(() => projectDraigStartingPossessionsDatabase(wrongPerson));
  const extra = fixture(); extra.online.characters.push({ id: 'fremd' });
  assert.throws(() => projectDraigStartingPossessionsDatabase(extra));
});

test('Fremde Eigentümer, falsche Kategorie, fehlende Besitzstücke und abweichende Wallets stoppen den Import', () => {
  for (const change of [input => { input.online.characters[0].inventory.items[1].ownerCharacterId = 'fremd'; },
    input => { input.online.characters[0].inventory.items[1].category = 'weapon'; },
    input => { input.online.characters[0].inventory.items.splice(1, 1); },
    input => { input.verification.profiles[0].moneyState = moneyState(999); }]) {
    const input = fixture(); change(input);
    assert.throws(() => projectDraigStartingPossessionsDatabase(input));
  }
});

test('Eine lokal veränderte oder anderweitig belegte deterministische Besitz-ID wird nicht überschrieben', () => {
  const input = fixture(), incoming = input.online.characters[0].inventory.items[1];
  input.records[0].character.inventory.items.push({ ...structuredClone(incoming), name: 'Lokale Änderung' });
  assert.throws(() => projectDraigStartingPossessionsDatabase(input), /lokal verändert/);
  const alias = fixture(); alias.records[0].character.inventory.items[0].instanceId = incoming.id;
  assert.throws(() => projectDraigStartingPossessionsDatabase(alias), /andere Instanz/);
});

test('Eine vollständig registrierte neuere Bestandsprojektion wird durch den historischen Beleg nicht zurückgesetzt', () => {
  const input = fixture(), source = 'Charakter Archiv Exporte/Später/person.json';
  input.registry.sourceOverlays.push(source); input.snapshot.sourceOverlays.push(source);
  for (const record of input.records) {
    record.sync.sourceArchive = source; record.sync.sourceExportedAt = '2099-01-01T00:00:00.000Z';
  }
  const result = projectDraigStartingPossessionsDatabase(input);
  assert.equal(result.verification.supersededProfiles, 4); assert.deepEqual(result.records, []); assert.deepEqual(result.exports, []);
  assert.deepEqual(result.snapshot, input.snapshot);
  input.snapshot.sourceOverlays = [];
  assert.throws(() => projectDraigStartingPossessionsDatabase(input), /nicht vollständig registriert/);
});
