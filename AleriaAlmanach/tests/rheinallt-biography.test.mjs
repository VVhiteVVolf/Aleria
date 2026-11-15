import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { RHEINALLT_BIOGRAPHY, RHEINALLT_CHARACTER_ID, RHEINALLT_IMAGE_URLS } from '../modules/rheinallt-biography/rheinallt-biography.js';
import { planRheinalltBiography } from '../modules/rheinallt-biography/rheinallt-biography-plan.mjs';
import { HOUSE_GAFYR_FAMILY } from '../../Stammbäume/assets/js/data/house-gafyr-family.js';
import { HOUSE_GWEFRYDD_FAMILY } from '../../Stammbäume/assets/js/data/house-gwefrydd-family.js';
import { getPersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';

const now = '2026-11-15T19:00:00.000Z';
const owner = () => ({ id: RHEINALLT_CHARACTER_ID, name: 'Rheinallt Gafyr',
  identity: { worldPersonId: RHEINALLT_CHARACTER_ID },
  portrait: '/Stammbäume/assets/images/portraits/haus-gafyr/rheinallt-gafyr.jpg',
  inventory: { revision: 7, moneyState: { totalCopper: 145 },
    items: [{ id: 'kept', name: 'Eigenes Erinnerungsstück', note: 'Nicht überschreiben' }], companions: [] },
  combatProfile: { revision: 53, hitPoints: { current: 8 }, resources: [{ id: 'focus', current: 2 }] },
  emotes: [{ img: Object.keys(RHEINALLT_IMAGE_URLS)[0], label: 'Eigener Emotename', extra: 'bewahren' }],
  imageSets: [{ id: 'standard', name: 'Standard', emotes: [{ img: Object.keys(RHEINALLT_IMAGE_URLS)[0], label: 'Eigener Emotename' }] },
    { id: 'own', name: 'Eigener Satz', emotes: [{ img: 'https://example.invalid/own.png', label: 'Privater Entwurf' }] }] });

test('Rheinallts beide Familienprojektionen lösen dieselbe vollständige Biografie ohne Graphmigration auf', () => {
  for (const family of [HOUSE_GAFYR_FAMILY, HOUSE_GWEFRYDD_FAMILY]) {
    assertValidFamily(family);
    const person = family.persons.find(person => person.id === 'rheinallt-gafyr');
    assert(person); assert.equal(person.birth, '1694'); assert.equal(person.worldPersonId, RHEINALLT_CHARACTER_ID);
    assert(!Object.hasOwn(person.extensions, 'biographyModule'));
    const before = structuredClone(person);
    assert.deepEqual(getPersonBiographyModule(person), RHEINALLT_BIOGRAPHY);
    assert.deepEqual(person, before);
  }
  const bio = RHEINALLT_BIOGRAPHY.biography;
  assert.equal(bio.abilities.length, 13); assert.equal(bio.portraitStages.filter(Boolean).length, 4);
  assert.equal(bio.works.length, 11); assert.equal(bio.trivia.length, 20);
  assert.deepEqual(bio.extraSections.map(section => section.title), ['Geschichte & Vergangenheit', 'Geschichte & Wirkung']);
  assert.equal(bio.quotes.length, 1); assert(bio.quotes[0].includes('seiner Ehre treu'));
  assert(bio.extraSections[0].text.includes('Ferydnand')); assert(!JSON.stringify(bio).includes('Ferdynand'));
  assert.deepEqual(bio.knightMentors.map(mentor => mentor.name), ['Sir Eiddon Wyrm']);
});

test('Zwei neue Tiere erhalten eindeutige Besitzinstanzen, vorhandene Gegenstände und Geld bleiben erhalten', () => {
  const current = owner(), before = structuredClone(current);
  const foreign = { id: 'companion-maredudd-cadarn', name: 'Cadarn', itemOrigin: { ownerCharacterId: 'maredudd' }, combatProfile: { revision: 99 } };
  const originalForeign = structuredClone(foreign);
  const plan = planRheinalltBiography(current, [foreign], now);
  assert.deepEqual(current, before); assert.deepEqual(foreign, originalForeign);
  assert(!Object.hasOwn(plan.patch, 'combatProfile')); assert(!Object.hasOwn(plan.patch, 'identity')); assert(!Object.hasOwn(plan.patch, 'genealogy'));
  assert.deepEqual(plan.patch.inventory.items[0], before.inventory.items[0]);
  assert.deepEqual(plan.patch.inventory.moneyState, before.inventory.moneyState);
  assert.deepEqual(plan.creatures.map(creature => creature.id), ['companion-rheinallt-cadarn', 'companion-rheinallt-cawg']);
  assert(plan.creatures.every(creature => creature.needsStatReview && creature.level === 1));
  assert.equal(plan.creatures[0].bestiaryReference.id, 'tiere/pferde/ceffyl');
  assert(!plan.creatures[1].bestiaryReference);
  for (const creature of plan.creatures) {
    const card = plan.patch.inventory.companions.find(card => card.creatureId === creature.id);
    const item = plan.patch.inventory.items.find(item => item.creatureId === creature.id);
    assert.equal(card.inventoryItemId, item.id); assert.equal(item.instanceId, creature.itemOrigin.instanceId);
    assert.equal(item.ownerCharacterId, current.id); assert.equal(creature.itemOrigin.ownerCharacterId, current.id);
  }
});

test('Erneuter Abgleich regeneriert weder Tierressourcen noch Inventar oder Revisionen', () => {
  const current = owner();
  const first = planRheinalltBiography(current, [], now);
  const stored = structuredClone(first.creatures);
  stored[0].combatProfile.hitPoints.current = 2;
  stored[0].combatProfile.resources[0].current = 0;
  stored[0].notes += ' Persönliche spätere Ergänzung.';
  // The actual inventory synchronizer owns descriptive changes. Once aligned,
  // repeating this editorial publication preserves all stored creature fields.
  const aligned = planRheinalltBiography({ ...current, ...first.patch }, stored, now);
  const result = planRheinalltBiography({ ...current, ...first.patch, ...aligned.patch }, stored, '2026-11-15T20:00:00.000Z');
  assert.deepEqual(result.creatures, []); assert.deepEqual(result.patch, {});
  assert.equal(stored[0].combatProfile.hitPoints.current, 2);
});

test('Fremde Tierbesitzer und mehrdeutige eigene Tieridentitäten werden vor einem Write abgewiesen', () => {
  const current = owner();
  assert.throws(() => planRheinalltBiography(current, [{ id: 'companion-rheinallt-cadarn', name: 'Cadarn', itemOrigin: { ownerCharacterId: 'foreign' } }], now), /Tierbesitzer/);
  assert.throws(() => planRheinalltBiography(current, [{ id: 'other-cadarn', name: 'Cadarn', itemOrigin: { ownerCharacterId: current.id } }], now), /Tieridentität/);
  assert.throws(() => planRheinalltBiography({ ...current, identity: { worldPersonId: 'another-person' } }, [], now));
  assert.equal(planRheinalltBiography({ ...current, inventory: null }, [], now).patch.inventory.items.length, 2);
});

test('Lokale Bildpfade erhalten Emotenamen, Zusatzfelder und unabhängige Bildsätze', () => {
  const current = owner(), plan = planRheinalltBiography(current, [], now);
  assert.equal(plan.patch.emotes[0].label, current.emotes[0].label);
  assert.equal(plan.patch.emotes[0].extra, 'bewahren');
  assert(plan.patch.emotes[0].img.startsWith('/AleriaAlmanach/assets/rheinallt-biography/'));
  assert.deepEqual(plan.patch.imageSets[1], current.imageSets[1]);
});

test('Katalog respektiert entfernte und individuell geänderte Biografien sowie fremde Weltidentitäten', () => {
  const catalog = globalThis.AleriaBiographyCatalog;
  assert.equal(catalog.resolve({ disabled: true }, { characterId: RHEINALLT_CHARACTER_ID }), null);
  assert.equal(catalog.resolve(null, { characterId: RHEINALLT_CHARACTER_ID, worldPersonId: 'person--haus-grael--rheinallt-grael' }), null);
  const own = structuredClone(RHEINALLT_BIOGRAPHY);
  own.biography.biographyText = 'Eine persönliche spätere Bearbeitung.';
  assert.equal(catalog.resolve(own, { characterId: RHEINALLT_CHARACTER_ID }).biography.biographyText, own.biography.biographyText);
});

test('Alle 24 aufgenommenen Bilder und 13 Symbole sind vorhanden und entsprechen ihren Originalbelegen', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/rheinallt-biography/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.assets.length, 24);
  for (const asset of manifest.assets) {
    const bytes = await readFile(new URL('../../' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(asset.generated, ['civil', 'young-knight', 'squire', 'child'].includes(asset.id));
  }
  for (const trait of RHEINALLT_BIOGRAPHY.biography.abilities) {
    assert((await readFile(new URL('../../' + decodeURIComponent(trait.icon.slice(1)), import.meta.url))).length > 0);
  }
});
