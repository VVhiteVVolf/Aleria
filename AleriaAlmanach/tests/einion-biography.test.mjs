import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EINION_BIOGRAPHY, EINION_CHARACTER_ID } from '../modules/einion-biography/einion-biography.js';
import { planEinionBiography } from '../modules/einion-biography/einion-biography-plan.mjs';
import { HOUSE_DRAIG_FAMILY } from '../../Stammbäume/assets/js/data/house-draig-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';

const owner = () => ({ id: EINION_CHARACTER_ID, name: 'Einion Draig',
  biography: null, inventory: { moneyState: { totalCopper: 735 }, revision: 3,
    items: [{ id: 'kept', name: 'Andenken', note: 'Lokale Notiz' },
      { id: 'einion-greif', instanceId: 'einion-greif', name: 'Greif', ownerCharacterId: EINION_CHARACTER_ID, creatureId: 'companion-einion-greif' }],
    companions: [{ name: 'Greif', creatureId: 'companion-einion-greif', inventoryItemId: 'einion-greif' }] },
  combatProfile: { resources: { currentHitPoints: 7 }, revision: 88 }, identity: { worldPersonId: 'person--haus-draig--einion-draig' } });

test('Einions vollständige Bio teilt die bestehende Weltperson und ändert keinen Familiengraphen', () => {
  assertValidFamily(HOUSE_DRAIG_FAMILY);
  const people = HOUSE_DRAIG_FAMILY.persons.filter(person => person.id === 'einion-draig');
  assert.equal(people.length, 1);
  assert.equal(people[0].worldPersonId, 'person--haus-draig--einion-draig');
  assert.equal(people[0].birth, '1723');
  assert.deepEqual(people[0].extensions.biographyModule, EINION_BIOGRAPHY);
  assert.equal(EINION_BIOGRAPHY.biography.abilities.length, 14);
  assert.deepEqual(EINION_BIOGRAPHY.biography.extraSections.map(section => section.title), ['Geschichte & Vergangenheit', 'Geschichte & Wirkung']);
  assert.equal(EINION_BIOGRAPHY.biography.works.length, 13);
  assert.equal(EINION_BIOGRAPHY.biography.trivia.length, 13);
  assert(EINION_BIOGRAPHY.biography.connections.some(row => row.name === 'Ollphéist von Blubberfels'));
  assert(EINION_BIOGRAPHY.biography.extraSections[0].text.includes('Verlobung mit Lady Caralyn'));
  assert(!EINION_BIOGRAPHY.biography.trivia.some(text => text.includes('angetraute')));
});

test('Greif bleibt eindeutig verknüpft, Gegenstände werden einmalig angelegt und der Goldfisch bleibt bio-only', () => {
  const current = owner(), original = structuredClone(current);
  const plan = planEinionBiography(current, '2026-11-14T17:00:00.000Z');
  assert.deepEqual(current, original, 'Reine Planung darf die Eingabe nicht verändern.');
  assert.deepEqual(Object.keys(plan.patch).sort(), ['biography', 'inventory', 'updatedAt']);
  assert.deepEqual(plan.creatures, []);
  assert.deepEqual(plan.patch.inventory.items.slice(0, 2), original.inventory.items);
  assert.deepEqual(plan.patch.inventory.companions, original.inventory.companions);
  assert.deepEqual(plan.patch.inventory.moneyState, original.inventory.moneyState);
  assert.deepEqual(plan.patch.inventory.items.slice(2).map(item => item.name), ['Sir Eichenbein', 'Lord Schmusedecke']);
  assert(plan.patch.inventory.items.slice(2).every(item => !item.creatureId && item.ownerCharacterId === current.id));
  assert(!JSON.stringify(plan.patch.inventory).includes('Ollph'));
  assert.deepEqual(planEinionBiography({ ...current, ...plan.patch }, '2026-11-14T18:00:00.000Z').patch, {});
});

test('Fehlende oder widersprüchliche Greif-Bindungen werden vor einem Write abgewiesen', () => {
  const current = owner();
  current.inventory.items[1].ownerCharacterId = 'somebody-else';
  assert.throws(() => planEinionBiography(current), /AssertionError/);
  current.inventory.items = [];
  assert.throws(() => planEinionBiography(current), /Greif/);
});

test('Revision 15 ergänzt alte lokale Biografien und erhält lokale Notizen und sämtliche Beziehungen', () => {
  const previous = structuredClone(HOUSE_DRAIG_FAMILY);
  previous.extensions.sourceRevision = 14;
  const person = previous.persons.find(person => person.id === 'einion-draig');
  delete person.extensions.biographyModule;
  person.title = 'Persönlicher lokaler Titel';
  person.notes = 'Unabhängige lokale Chronik';
  const result = resolveRegisteredFamilyUpgrade(HOUSE_DRAIG_FAMILY, previous);
  const updated = result.persons.find(person => person.id === 'einion-draig');
  assert.deepEqual(updated.extensions.biographyModule, EINION_BIOGRAPHY);
  assert.equal(updated.notes, person.notes);
  assert.equal(updated.title, person.title);
  assert.deepEqual(result.partnerships, previous.partnerships);
  assert.deepEqual(result.parentages, previous.parentages);
});

test('Der öffentliche Almanachkatalog verwendet dieselbe Bio nur für Einions eindeutige Identität', () => {
  const catalog = globalThis.AleriaBiographyCatalog;
  assert.deepEqual(catalog.resolve(null, { worldPersonId: 'person--haus-draig--einion-draig' }), EINION_BIOGRAPHY);
  assert.equal(catalog.resolve(null, { characterId: EINION_CHARACTER_ID, worldPersonId: 'person--other-house--einion' }), null);
  const personal = structuredClone(EINION_BIOGRAPHY);
  personal.biography.biographyText = 'Eine spätere persönliche Bearbeitung';
  assert.equal(catalog.resolve(personal, { characterId: EINION_CHARACTER_ID }).biography.biographyText, personal.biography.biographyText);
});

test('Übernommene Originalbilder und alle vorhandenen Traiticons sind vollständig', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/einion-biography/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.assets.length, 4);
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL('../../' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(bytes.length, asset.bytes);
  }
  for (const trait of EINION_BIOGRAPHY.biography.abilities) {
    assert((await readFile(new URL('../../' + decodeURIComponent(trait.icon.slice(1)), import.meta.url))).length > 0);
  }
});
