import test from 'node:test';
import assert from 'node:assert/strict';
import { createBronaCompanions, BRONA_COMPANION_OWNER_ID } from '../modules/brona-biography/brona-companions.mjs';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { sanitizeCreature } from '../modules/creatures/creature-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const now = '2026-11-08T18:30:00.000Z';
const source = () => ({ personId: BRONA_COMPANION_OWNER_ID, biographyModule: { biography: {
  connections: [{ type: 'connection', name: 'Honigwind', image: 'https://i.imgur.com/x4GjAIm.jpeg' },
    { type: 'connection', name: 'Brocken', image: 'https://i.imgur.com/HUe4JAC.jpeg' }],
  trivia: ['Sie liebt Ziegen und besitzt neben einem Pferd auch einen morgornischen Sturmbock namens Brocken.',
    'Brocken ist ausgesprochen störrisch und lässt sich von Fremden nur schwer führen. Brona gegenüber ist er hingegen außerordentlich loyal.'],
} } });
const character = () => ({ id: BRONA_COMPANION_OWNER_ID, name: 'Brona Eisenherz', portrait: 'https://i.imgur.com/yEPvXLm.png',
  combatProfile: { hitPoints: { current: 17 } }, inventory: { revision: 42, moneyState: { gold: 5 },
    items: [{ id: 'existing-item', name: 'Bestehender Besitz', description: 'Unverändert' }],
    companions: [{ id: 'empty-one', name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', image: '', description: '' },
      { id: 'empty-two', name: 'Treuer Begleiter', species: 'Tier / Person', image: '', description: '' }],
  } });

test('Bronas two sourced animals keep their exact identities, portraits and bounded ownership', () => {
  const person = character(), original = structuredClone(person), input = source(), inputBefore = structuredClone(input);
  const [horse, ram] = createBronaCompanions(person, input, now);
  assert.deepEqual(person, original);
  assert.deepEqual(input, inputBefore);
  assert.deepEqual([horse.id, ram.id], ['companion-brona-honigwind', 'companion-brona-brocken']);
  assert.equal(horse.portrait, input.biographyModule.biography.connections[0].image);
  assert.equal(ram.portrait, input.biographyModule.biography.connections[1].image);
  assert.equal(horse.species, 'Pferd');
  assert.equal(horse.bestiaryReference, null);
  assert.equal(ram.species, 'Sturmbock');
  assert.equal(ram.bestiaryReference.id, 'tiere/besondere/sturmbock');
  assert.equal(ram.classification.genus, 'Widder');
  for (const creature of [horse, ram]) {
    assert.equal(creature.itemOrigin.ownerCharacterId, BRONA_COMPANION_OWNER_ID);
    assert.equal(creature.itemOrigin.ownerCharacterName, person.name);
    assert.equal(creature.createdAt, now);
    assert.equal(creature.updatedAt, now);
    assert(creature.needsStatReview);
    assert(!creature.biography.facts.some(row => ['Alter', 'Geschlecht', 'Rasse'].includes(row.label)));
  }
});

test('unknown combat values remain technical and Brocken receives no authored attack or equipment', () => {
  const [horse, ram] = createBronaCompanions(character(), source(), now);
  assert.equal(horse.level, 1);
  assert.match(horse.notes, /technische Pferdegrundprofil/);
  assert.match(ram.notes, /technische Mindestwerte/);
  assert.match(ram.biography.personality, /störrisch.*Brona.*loyal/);
  for (const key of ['armorItems', 'techniques', 'conditions']) assert.deepEqual(ram.combatProfile[key], []);
  assert.deepEqual(ram.combatProfile.weapons.map(weapon => [weapon.id, weapon.equipped]), [['default-unarmed-melee', false]]);
  assert.deepEqual(ram.combatProfile.weapons.map(weapon => [weapon.name, weapon.damageFormula]), [['', '']]);
  assert.deepEqual(sanitizeCreature(ram).combatProfile.weapons, ram.combatProfile.weapons);
  assert.deepEqual(resolveCombatProfile(sanitizeCreature(ram)).actions.filter(action => action.kind === 'weapon'), []);
  assert.equal(ram.combatProfile.magic.enabled, false);
  assert(!ram.inventory);
});

test('existing inventory coupling preserves possessions, money, combat and card IDs and remains idempotent', () => {
  const person = character(), original = structuredClone(person), creatures = createBronaCompanions(person, source(), now);
  for (const creature of creatures) person.inventory = attachCreatureToInventory(person, creature, now);
  assert.deepEqual(person.combatProfile, original.combatProfile);
  assert.deepEqual(person.inventory.moneyState, original.inventory.moneyState);
  assert.deepEqual(person.inventory.items[0], original.inventory.items[0]);
  assert.deepEqual(person.inventory.companions.map(card => card.id), ['empty-one', 'empty-two']);
  assert.equal(person.inventory.items.length, 3);
  assert.equal(inventoryCompanionViews(person.inventory, creatures).length, 2);
  for (const creature of creatures) {
    const item = person.inventory.items.find(item => item.creatureId === creature.id);
    const card = person.inventory.companions.find(card => card.creatureId === creature.id);
    assert.equal(item.id, creature.itemOrigin.inventoryItemId);
    assert.equal(item.instanceId, creature.itemOrigin.instanceId);
    assert.equal(card.inventoryItemId, item.id);
    assert.deepEqual(attachCreatureToInventory(person, creature, now), person.inventory);
  }
});

test('wrong owner, missing source evidence, duplicate names and invalid source images fail before creating a plan', () => {
  assert.throws(() => createBronaCompanions({ ...character(), id: 'another' }, source(), now), /Personen-ID/);
  assert.throws(() => createBronaCompanions(character(), { ...source(), personId: 'another' }, now), /Personen-ID/);
  assert.throws(() => createBronaCompanions(character(), source(), 'invalid'), /Planzeitpunkt/);
  const duplicate = source();
  duplicate.biographyModule.biography.connections.push(duplicate.biographyModule.biography.connections[0]);
  assert.throws(() => createBronaCompanions(character(), duplicate, now), /mehrdeutig/);
  const noEvidence = source(); noEvidence.biographyModule.biography.trivia = [];
  assert.throws(() => createBronaCompanions(character(), noEvidence, now), /nicht belegt/);
  const badImage = source(); badImage.biographyModule.biography.connections[1].image = 'javascript:alert(1)';
  assert.throws(() => createBronaCompanions(character(), badImage, now), /Tierverbindung/);
});
