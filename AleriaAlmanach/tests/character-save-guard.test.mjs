import assert from 'node:assert/strict';
import test from 'node:test';

import { detectStaleCharacterFields, stampFreshRevisions, selectChangedSections } from '../modules/characters/character-save-guard.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

test('sanitizeCharacterCombatProfile bewahrt eine mitgegebene Revision und faellt sonst auf 0 zurueck', () => {
  assert.equal(sanitizeCharacterCombatProfile({}).revision, 0);
  assert.equal(sanitizeCharacterCombatProfile({ revision: 1723000000000 }).revision, 1723000000000);
  assert.equal(sanitizeCharacterCombatProfile({ revision: -5 }).revision, 0, 'negative Werte werden auf 0 gekappt');
});

test('detectStaleCharacterFields erkennt ein veraltetes Kampfprofil, laesst frische oder fehlende Felder aber durch', () => {
  const currentDoc = { combatProfile: { revision: 200 }, inventory: { revision: 50 } };

  const staleWrite = { combatProfile: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, staleWrite), ['Kampfprofil']);

  const freshWrite = { combatProfile: { revision: 300 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, freshWrite), []);

  const unrelatedWrite = { name: 'Neuer Titel' };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, unrelatedWrite), [], 'ein Speichervorgang ohne combatProfile/inventory wird nicht blockiert');
});

test('detectStaleCharacterFields prueft Kampfprofil und Inventar unabhaengig voneinander', () => {
  const currentDoc = { combatProfile: { revision: 200 }, inventory: { revision: 200 } };
  const bothStale = { combatProfile: { revision: 100 }, inventory: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, bothStale), ['Kampfprofil', 'Inventar']);

  const onlyInventoryStale = { combatProfile: { revision: 250 }, inventory: { revision: 100 } };
  assert.deepEqual(detectStaleCharacterFields(currentDoc, onlyInventoryStale), ['Inventar']);
});

test('detectStaleCharacterFields behandelt ein frisch angelegtes Dokument (keine Revision) als nicht veraltet', () => {
  assert.deepEqual(detectStaleCharacterFields(null, { combatProfile: { revision: 5 } }), []);
  assert.deepEqual(detectStaleCharacterFields({}, { combatProfile: { revision: 5 } }), []);
});

test('stampFreshRevisions setzt eine neue Revision auf vorhandene Felder, ohne andere Felder zu veraendern', () => {
  const stamped = stampFreshRevisions({ name: 'Rhiannon', combatProfile: { revision: 1 }, inventory: { revision: 1 } }, ['combatProfile', 'inventory'], 999);
  assert.equal(stamped.name, 'Rhiannon');
  assert.equal(stamped.combatProfile.revision, 999);
  assert.equal(stamped.inventory.revision, 999);
});

test('stampFreshRevisions laesst ein Dokument ohne combatProfile/inventory unangetastet', () => {
  const stamped = stampFreshRevisions({ name: 'Rhiannon' }, ['combatProfile', 'inventory'], 999);
  assert.deepEqual(stamped, { name: 'Rhiannon' });
});

test('selectChangedSections meldet nur echte Aenderungen - ein reiner Avatar-Upload laesst Kampfprofil/Inventar unberuehrt', () => {
  const baseline = {
    images: { portrait: 'alt.png', emotes: [] },
    inventory: { items: [{ id: 'sword' }] },
    combatProfile: { weapons: [{ id: 'axe' }] }
  };
  // Nur das Bild wurde tatsaechlich veraendert, Inventar/Kampfprofil kommen unveraendert
  // aus dem (potenziell veralteten) Formularzustand zurueck.
  const current = {
    images: { portrait: 'neu.png', emotes: [] },
    inventory: { items: [{ id: 'sword' }] },
    combatProfile: { weapons: [{ id: 'axe' }] }
  };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), ['images']);
});

test('selectChangedSections erkennt Aenderungen in mehreren Abschnitten gleichzeitig', () => {
  const baseline = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  const current = { images: { a: 1 }, inventory: { a: 2 }, combatProfile: { a: 2 } };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), ['inventory', 'combatProfile']);
});

test('selectChangedSections behandelt eine fehlende Baseline (neu angelegte Figur) als "alles geaendert"', () => {
  const current = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  assert.deepEqual(selectChangedSections(current, null, ['images', 'inventory', 'combatProfile']), ['images', 'inventory', 'combatProfile']);
});

test('selectChangedSections meldet keine Aenderung, wenn ueberhaupt nichts angefasst wurde', () => {
  const baseline = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  const current = { images: { a: 1 }, inventory: { a: 1 }, combatProfile: { a: 1 } };
  assert.deepEqual(selectChangedSections(current, baseline, ['images', 'inventory', 'combatProfile']), []);
});
