import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeCreature, createCreatureDraft, createCreatureDuplicate, makeCreatureExportPayload, normalizeCreatureImportPayload, makeCreatureSceneActor } from '../modules/creatures/creature-model.js';
import { getCreatureImageSet, updateCreatureImageSet, CREATURE_IMAGE_LIBRARY } from '../modules/creatures/creature-images-model.js';
import '../modules/image-library/image-library-import.js';

const imports = globalThis.AleriaAvatarImport;

test('alte Kreaturen behalten Avatar-IDs, lange Beschriftungen und Kommentar-Indizes', () => {
  const avatars = [
    { id: 'a', img: 'https://example.com/owl.png', label: 'Wachsam mit leicht zur Seite geneigtem Kopf' },
    { id: 'b', img: 'https://example.com/owl.png', label: 'Gleicher Ausdruck mit anderer Bedeutung' }
  ];
  const source = { id: 'owl', portrait: 'https://example.com/main.png', avatars };
  const creature = sanitizeCreature(source);
  assert.deepEqual(creature.avatars, avatars);
  assert.equal(creature.imageSets[0].portrait, source.portrait);
  assert.deepEqual(sanitizeCreature(creature).imageSets, creature.imageSets, 'wiederholtes Laden verändert den Bildbestand nicht');
  assert.deepEqual(sanitizeCreature(creature).avatars, avatars);
  assert.equal(makeCreatureSceneActor(creature).emotes[1].label, avatars[1].label);
});

test('80 Avatare und zusätzliche Bildersets überstehen Export, Import und Duplizieren', () => {
  const emotes = Array.from({ length: 80 }, (_, i) => ({ img: `https://example.com/${i}.png`, label: `Ausdruck ${i}` }));
  const creature = sanitizeCreature({ id: 'owl', avatars: emotes, imageSets: [{ id: 'winter', name: 'Winterfell', portrait: 'https://example.com/winter.png', emotes }], activeImageSetId: 'winter' });
  const [restored] = normalizeCreatureImportPayload(makeCreatureExportPayload(creature));
  assert.equal(restored.avatars.length, 80);
  assert.deepEqual(restored.imageSets, creature.imageSets);
  assert.equal(restored.activeImageSetId, 'winter');
  assert.deepEqual(createCreatureDuplicate(restored, []).imageSets, creature.imageSets);
  assert.equal(CREATURE_IMAGE_LIBRARY.applyPresentation(makeCreatureSceneActor(restored), 'winter').emotes.length, 80);
});

test('geleerte Standard-Sets werden nicht aus veralteten Legacy-Feldern wieder befüllt', () => {
  const creature = sanitizeCreature({ portrait: 'https://example.com/main.png', avatars: [{ img: 'https://example.com/old.png' }] });
  updateCreatureImageSet(creature, { portrait: null, emotes: [] });
  assert.equal(creature.portrait, '');
  assert.deepEqual(creature.avatars, []);
  assert.equal(sanitizeCreature(creature).imageSets[0].portrait, null);
});

test('Bildänderungen berühren Kampfprofil und Beute nicht; neue Lootboxen bleiben leer', () => {
  const creature = createCreatureDraft();
  const before = structuredClone({ combatProfile: creature.combatProfile, loot: creature.loot });
  updateCreatureImageSet(creature, { portrait: 'https://example.com/new.png' });
  assert.deepEqual({ combatProfile: creature.combatProfile, loot: creature.loot }, before);
  assert.deepEqual(creature.loot.items, []);
  assert.equal(creature.loot.currency, '');
  assert.equal(getCreatureImageSet(creature).portrait, 'https://example.com/new.png');
});

test('Imgur-Einzelbildseiten werden direkt übernommen und vorhandene Links nicht verdoppelt', () => {
  const result = imports.merge({ rawValue: 'https://imgur.com/AbCd123\nhttps://i.imgur.com/AbCd123.png\nhttps://example.com/new.png', slots: [{ img: 'https://i.imgur.com/AbCd123.png', label: 'Bestehend' }] });
  assert.equal(result.addedCount, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.slots[0].label, 'Bestehend');
  assert.equal(result.slots.filter(Boolean).length, 2);
  assert.equal(imports.normalizeUrl('https://imgur.com/a/AbCd123'), null);
  assert.equal(imports.normalizeUrl('javascript:alert(1)'), null);
});

test('volle Galerien melden Kapazität und ersetzen keinen bestehenden Avatar', () => {
  const slots = Array.from({ length: 80 }, (_, i) => ({ img: `https://example.com/${i}.png`, label: `Bild ${i}` }));
  const result = imports.merge({ rawValue: 'https://example.com/additional.png', slots });
  assert.equal(result.addedCount, 0);
  assert.equal(result.skippedCapacityCount, 1);
  assert.deepEqual(result.slots, slots);
});

test('lange gleichlautende Set-IDs bleiben eindeutig', () => {
  const name = 'a'.repeat(60);
  const first = CREATURE_IMAGE_LIBRARY.createId(name);
  const second = CREATURE_IMAGE_LIBRARY.createId(name, [first]);
  assert.notEqual(first, second);
  assert.equal(second.length, 48);
});
