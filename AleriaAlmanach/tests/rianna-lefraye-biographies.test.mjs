import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { enrichGwynthorBiography } from '../modules/gwynthor-seven/biography-enrichment.mjs';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { loadHorseBreedingData } from '../../Bestiarium/modules/horse-breeding/horse-breeding-data.mjs';
import { horsePairKey, horseCrossingAnchor, calculateFoal } from '../../Bestiarium/modules/horse-breeding/horse-breeding-model.mjs';
import { buildBiographyExportPayload, parseBiographyImportPayload } from '../../js/biography/biography-transfer.mjs';
import { normalizePersonBiographyModule, getPersonBiographyModule } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { GWYNTHOR_EQUIPMENT_ARTWORK } from '../modules/gwynthor-seven/equipment-artwork.mjs';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';

const root = new URL('../../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const plan = await json('AleriaAlmanach/modules/gwynthor-seven/source/character-plan.json');
const before = await json('diagnostics/rianna-lefraye-biographies-20261102/before.json');
const selected = plan.characters.filter(character => before.characters.some(old => old.id === character.id));

// Another authorized equipment publication replaced local image URLs while this
// biography was being prepared. Accept only that explicit original-image map;
// all mechanical fields, identities, quantities and live values still compare.
function withPublishedEquipmentArtwork(value) {
  if (Array.isArray(value)) return value.map(withPublishedEquipmentArtwork);
  if (!value || typeof value !== 'object') return value;
  const copy = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, withPublishedEquipmentArtwork(entry)]));
  const artwork = GWYNTHOR_EQUIPMENT_ARTWORK[value.image];
  if (artwork) {
    copy.image = artwork.url;
    if (value.definitionRef && artwork.sourceItems.includes(value.definitionRef.id)) {
      const definition = AUTHORED_ITEMS.find(item => item.id === value.definitionRef.id);
      assert(definition);
      copy.definitionRef.revision = definition.definitionRef.revision;
    }
  }
  return copy;
}

test('the authored family and training histories use the correct people and ordered mentors', () => {
  const [rianna, lefraye] = ['Rianna Wyrm', 'Lefraye Gafyr'].map(name => selected.find(character => character.name === name));
  assert.deepEqual(rianna.biography.biography.knightMentors.map(mentor => mentor.name), ['Derwen Wyrm', 'Rhydian Wyrm', 'Eiddon Wyrm']);
  assert.equal(rianna.biography.biography.knightMentors[2].role, 'Lehrmeister · Marschall');
  assert.deepEqual(lefraye.biography.biography.knightMentors.map(mentor => mentor.name), ['Niniel Mwyalchen']);
  assert.match(rianna.bio, /Elaine Saethwyr/); assert.match(rianna.bio, /Kaninchens/); assert.match(rianna.bio, /Eilir/);
  assert.match(rianna.bio, /schädigen/); assert.match(rianna.bio, /Konstitution/);
  assert.match(lefraye.bio, /Crannath/); assert.match(lefraye.bio, /Heledd Gafyr/); assert.match(lefraye.bio, /Oweta Draig/);
  assert.match(lefraye.bio, /Gründermutter/);
});

test('biography enrichment preserves existing combat state and each original possession', () => {
  for (const character of selected) {
    const old = before.characters.find(entry => entry.id === character.id);
    assert.deepEqual(character.combatProfile, withPublishedEquipmentArtwork(old.combatProfile), character.name);
    for (const item of old.inventory.items) assert.deepEqual(character.inventory.items.find(entry => entry.id === item.id), withPublishedEquipmentArtwork(item), item.id);
    assert.equal(character.inventory.items.length, old.inventory.items.length + 2);
    assert.deepEqual(character.identity, old.identity);
    assert.deepEqual(character.imageSets, old.imageSets);
  }
});

test('reapplying the editorial content keeps live resources, changed quantities and unrelated items', () => {
  for (const source of selected) {
    const current = structuredClone(source);
    current.combatProfile.hitPoints.current = 1;
    current.inventory.items[0].quantity = '7';
    current.inventory.items.push({ id: 'later-personal-item', name: 'Späterer Besitz', quantity: '3' });
    const result = enrichGwynthorBiography(current, source.updatedAt);
    assert.deepEqual(result.combatProfile, current.combatProfile);
    assert.deepEqual(result.inventory, current.inventory);
    assert.deepEqual(result.biography, current.biography);
    assert.equal(result.inventory.companions.length, 2);
  }
  const unrelated = { id: 'unrelated', inventory: { items: [] } };
  assert.equal(enrichGwynthorBiography(unrelated, ''), unrelated);
});

test('all four creature sheets have matching inventory, companion card and owner identities', async () => {
  assert.equal(plan.creatures.length, 4);
  assert.equal(new Set(plan.creatures.map(creature => creature.id)).size, 4);
  for (const creature of plan.creatures) {
    const owner = selected.find(character => character.id === creature.itemOrigin.ownerCharacterId);
    assert(owner);
    const item = owner.inventory.items.find(item => item.id === creature.itemOrigin.inventoryItemId);
    const card = owner.inventory.companions.find(card => card.creatureId === creature.id);
    assert(item && card);
    assert.equal(item.creatureId, creature.id); assert.equal(card.inventoryItemId, item.id);
    assert.equal(item.instanceId, creature.itemOrigin.instanceId);
    assert.equal(item.ownerCharacterId, owner.id); assert.equal(item.image, creature.portrait);
    assert.deepEqual(resolveCreatureBestiaryReference(creature), creature.bestiaryReference);
    const [path, anchor] = creature.bestiaryReference.url.split('#');
    const html = await readFile(new URL(path.slice(1), root), 'utf8');
    if (anchor) assert(html.includes(`id="${anchor}"`));
    const exported = await json(`Charakter Archiv Exporte/Gwynthor Sieben/${creature.id}.json`);
    assert.deepEqual(exported.creature, creature);
  }
  const bird = plan.creatures.find(creature => creature.name === 'Agravaine');
  assert.equal(bird.species, 'Mwyalchen-Drossel');
  assert(bird.combatProfile.weapons.every(weapon => !/Krallenhieb|Schnabelhieb/.test(weapon.name)));
});

test('Farnschritt is a symmetric Tirashan–Rhyfel crossing with a real stable Bestiarium anchor', async () => {
  const data = await loadHorseBreedingData();
  const crossing = data.crossings.find(entry => entry.bestiaryId === 'farnschritt');
  assert.equal(crossing.name, 'Farnschritt'); assert.equal(horsePairKey(crossing.mareId, crossing.sireId), 'rhyfel|tirashan');
  assert.match(crossing.note, /Thalena/);
  for (const [first, second] of [['rhyfel', 'tirashan'], ['tirashan', 'rhyfel']]) {
    const result = calculateFoal(data.breeds.find(breed => breed.id === first), data.breeds.find(breed => breed.id === second), { crossing, random: () => 0.5 });
    assert.equal(result.crossing.name, 'Farnschritt');
  }
  const horse = plan.creatures.find(creature => creature.name === 'Thalena');
  assert.equal(horse.bestiaryReference.url.split('#')[1], horseCrossingAnchor('tirashan', 'rhyfel'));
});

test('the two extra portraits per biography, companion portraits and mentor portraits are real local files', async () => {
  for (const character of selected) {
    const bio = character.biography.biography;
    assert.equal(bio.portraitStages.filter(Boolean).length, 2);
    assert.equal(bio.portraitCaptions.filter(Boolean).length, 3);
    for (const path of [...bio.portraitStages.filter(Boolean), ...plan.creatures.filter(creature => creature.itemOrigin.ownerCharacterId === character.id).map(creature => creature.portrait)]) {
      const data = await readFile(new URL(path.slice(1), root));
      assert.equal(data.subarray(1, 4).toString(), 'PNG');
      assert.equal(data.readUInt32BE(16) * 3, data.readUInt32BE(20) * 2);
    }
    for (const entry of [...bio.knightMentors, ...bio.abilities]) await access(new URL((entry.image || entry.icon).slice(1), root));
  }
});

test('character, family-tree catalog and standalone biography transfer agree', () => {
  for (const character of selected) {
    const tree = getPersonBiographyModule({ id: character.id.split('--').at(-1) });
    assert.deepEqual(tree, normalizePersonBiographyModule(character.biography));
    const payload = buildBiographyExportPayload({ biographyModule: character.biography, personId: character.id, personName: character.name });
    assert.deepEqual(normalizePersonBiographyModule(parseBiographyImportPayload(payload)), normalizePersonBiographyModule(character.biography));
  }
});
