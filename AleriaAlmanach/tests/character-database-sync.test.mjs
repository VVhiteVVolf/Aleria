import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  mergeCharacterDatabases,
  mergeOnlineAndLocalCharacter
} from '../../CharakterDatenbank/assets/js/character-database-client.mjs';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const databaseRoot = resolve(testDirectory, '..', '..', 'CharakterDatenbank');

async function readJson(...parts) {
  return JSON.parse(await readFile(resolve(databaseRoot, ...parts), 'utf8'));
}

test('lokale Charakterdatenbank enthält jede exportierte Figur als eigene Akte', async () => {
  const registry = await readJson('registry.json');
  const snapshot = await readJson('generated', 'characters.snapshot.json');
  const report = await readJson('generated', 'sync-report.json');
  assert.equal(registry.schema, 'aleria.character-registry');
  assert.equal(registry.count, 176);
  assert.equal(snapshot.characters.length, registry.count);
  assert.equal(report.summary.sourceDocuments, 190);
  assert.equal(registry.records.reduce((sum, entry) => sum + entry.firestoreDocumentIds.length, 0), 190);

  await Promise.all(registry.records.map(async entry => {
    const record = await readJson(...entry.path.split('/'));
    assert.equal(record.schema, 'aleria.character-record');
    assert.equal(record.recordId, entry.recordId);
    assert.equal(record.links.firestore.documentId, entry.firestoreDocumentId);
    assert.deepEqual(record.links.firestore.documentIds, entry.firestoreDocumentIds);
    assert.equal(record.sync.contentHash, entry.contentHash);
  }));
});

test('gleichnamige Online-Dokumente werden ohne Alterskonflikt als eine Person geführt', async () => {
  const registry = await readJson('registry.json');
  const report = await readJson('generated', 'sync-report.json');
  const meurig = registry.records.filter(item => item.name === 'Meurig Draig');
  const gwendolyn = registry.records.filter(item => item.name === 'Gwendolyn Draig (geb. Aderyn)');
  assert.equal(meurig.length, 1);
  assert.equal(gwendolyn.length, 1);
  assert.equal(meurig[0].firestoreDocumentIds.length, 3);
  assert.equal(gwendolyn[0].firestoreDocumentIds.length, 6);
  assert.equal(report.summary.mergedSameNameGroups, 9);
  assert.equal(report.summary.familyAmbiguous, 0);
});

test('Gawain Draig ist mit Firestore und seiner Weltperson im Haus Draig verbunden', async () => {
  const registry = await readJson('registry.json');
  const snapshot = await readJson('generated', 'characters.snapshot.json');
  const entry = registry.records.find(item => item.name === 'Gawain Draig');
  const gawain = snapshot.characters.find(item => item.id === entry.firestoreDocumentId);

  assert.ok(entry);
  assert.equal(entry.firestoreDocumentId, 'q1QtSIug74FzzwUAqWrs');
  assert.equal(entry.worldPersonId, 'person--haus-draig--gawain-draig');
  assert.deepEqual(entry.primary, { kind: 'family', id: 'haus-draig', label: 'Haus Draig' });
  assert.equal(gawain.identity.worldPersonId, entry.worldPersonId);
  assert.equal(gawain.genealogy.birth, '1722');
  assert.equal(gawain.genealogy.houseName, 'Haus Draig');
  assert.ok(gawain.genealogy.relationships.parents.length >= 2);
  assert.equal(gawain.localRecord.classification.familyStatus, 'linked');
});

test('Gildas Gafyr ist als neue Weltperson samt Charakterbogen im Haus Gafyr registriert', async () => {
  const registry = await readJson('registry.json');
  const snapshot = await readJson('generated', 'characters.snapshot.json');
  const entry = registry.records.find(item => item.name === 'Gildas Gafyr');
  const gildas = snapshot.characters.find(item => item.id === entry?.firestoreDocumentId);

  assert.ok(entry);
  assert.equal(entry.firestoreDocumentId, 'gildas-gafyr');
  assert.equal(entry.worldPersonId, 'person--haus-gafyr--gildas-gafyr');
  assert.deepEqual(entry.primary, { kind: 'family', id: 'haus-gafyr', label: 'Haus Gafyr' });
  assert.equal(gildas.combatProfile.progression.level, 6);
  assert.equal(gildas.biography.biography.footer, 'Personenakte · Gildas Gafyr');
  assert.ok(gildas.genealogy.relationships.parents.length >= 2);
});

test('Figuren ohne eindeutigen Stammbaum werden nach Gruppe statt per Namensraten abgelegt', async () => {
  const snapshot = await readJson('generated', 'characters.snapshot.json');
  const agnes = snapshot.characters.find(item => item.name === 'Agnes');
  assert.ok(agnes);
  assert.equal(agnes.identity.worldPersonId, '');
  assert.deepEqual(agnes.localRecord.classification.primary, {
    kind: 'group',
    id: 'schwarzfische',
    label: 'Schwarzfische',
    source: 'archive-tab'
  });
});

test('Onlinewerte gewinnen, lokale Identität und Datenbankverweis bleiben erhalten', () => {
  const local = {
    id: 'gawain',
    name: 'Gawain Draig',
    identity: { worldPersonId: 'person--haus-draig--gawain-draig' },
    genealogy: {
      worldPersonId: 'person--haus-draig--gawain-draig',
      houseName: 'Haus Draig',
      sources: [{ familyId: 'haus-draig', personId: 'gawain-draig' }]
    },
    combatProfile: { hitPoints: { current: 30, maximum: 30 } },
    localRecord: { recordId: 'character--gawain', path: 'records/gawain/character.json' }
  };
  const online = {
    id: 'gawain',
    name: 'Gawain Draig',
    identity: { worldPersonId: '' },
    genealogy: { worldPersonId: '', houseName: '' },
    combatProfile: { hitPoints: { current: 7, maximum: 30 } }
  };
  const merged = mergeOnlineAndLocalCharacter(online, local);
  assert.equal(merged.combatProfile.hitPoints.current, 7);
  assert.equal(merged.identity.worldPersonId, local.identity.worldPersonId);
  assert.equal(merged.genealogy.houseName, 'Haus Draig');
  assert.equal(merged.localRecord.recordId, 'character--gawain');
  assert.deepEqual(mergeCharacterDatabases([online], [local]), [merged]);
});
