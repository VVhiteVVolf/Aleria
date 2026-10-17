import test from 'node:test';
import assert from 'node:assert/strict';
import { VARULV_NEW_COMPANIONS } from '../modules/creatures/catalog/varulv-companions.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { inferCreatureGenus } from '../modules/creatures/creature-classification.js';
import { planVarulvCompanionImport } from '../../firebase/scripts/content/varulv-companion-import-plan.mjs';

test('ten Gamir share their real breed profile; nine keep personal ownership open', () => {
  const dogs = getBuiltinCreatureTemplates().filter(creature => VARULV_NEW_COMPANIONS.some(source => source.id === creature.id) && creature.species === 'Gamir');
  assert.equal(dogs.length, 10);
  assert.equal(new Set(dogs.map(dog => dog.portrait)).size, 10);
  for (const dog of dogs) {
    assert.equal(dog.bestiaryReference.id, 'tiere/vieh/haustiere/hunde/gamir');
    assert.equal(dog.classification.house, 'Clan Varulv');
    assert.equal(dog.classification.location, 'Rorikshall');
    assert.ok(dog.biography.facts.some(fact => fact.label === 'Alter'));
  }
  assert.equal(dogs.filter(dog => dog.itemOrigin).length, 1);
  assert.equal(dogs.find(dog => dog.itemOrigin).name, 'Trygg');
  assert.match(dogs.find(dog => dog.name === 'Trygg').biography.appearance, /Narbe/);
  assert.match(dogs.find(dog => dog.name === 'Njör').biography.personality, /verspielt/);
});

test('Sleipnir receives Trygg, Kappi and the corrected goshawk, with matching inventory identities', () => {
  const plan = planVarulvCompanionImport({ now: '2026-10-17T12:00:00.000Z' });
  assert.equal(plan.owner.genealogy.birth, '1696');
  assert.deepEqual(plan.owner.inventory.companions.map(card => card.name), ['Trygg', 'Kappi', 'Skuggi']);
  for (const card of plan.owner.inventory.companions) {
    const creature = plan.entries.find(entry => entry.id === card.creatureId).data;
    const item = plan.owner.inventory.items.find(item => item.id === card.inventoryItemId);
    assert.equal(item.creatureId, creature.id);
    assert.equal(item.instanceId, creature.itemOrigin.instanceId);
    assert.equal(item.ownerCharacterId, plan.owner.id);
  }
  const kappi = plan.entries.find(entry => entry.data.name === 'Kappi').data;
  const skuggi = plan.entries.find(entry => entry.data.name === 'Skuggi').data;
  assert.equal(kappi.bestiaryReference.id, 'tiere/pferde/hest');
  assert.equal(skuggi.species, 'Habicht');
  assert.equal(skuggi.bestiaryReference, null);
  assert.equal(inferCreatureGenus(skuggi), 'Vögel');
});

test('repeat import preserves live values, old IDs, other possessions and later child assignments', () => {
  const first = planVarulvCompanionImport({ now: '2026-10-17T12:00:00.000Z' });
  const owner = structuredClone(first.owner);
  owner.id = 'existing-online-sleipnir';
  owner.combatProfile = { hitPoints: { current: 7 }, conditions: ['verletzt'] };
  owner.inventory.items.push({ id: 'existing-sword', name: 'Schwert' });
  const creatures = first.entries.map(entry => structuredClone(entry.data));
  for (const creature of creatures) {
    creature.combatProfile.hitPoints.current = 1;
    if (creature.itemOrigin) creature.itemOrigin.ownerCharacterId = owner.id;
  }
  const yr = creatures.find(creature => creature.name === 'Yr');
  yr.itemOrigin = { ownerCharacterId: 'a-varulv-child' };
  // Rebuild cards for the real online owner before checking the stable repeat.
  owner.inventory.companions = [];
  owner.inventory.items = owner.inventory.items.filter(item => item.id === 'existing-sword');
  const second = planVarulvCompanionImport({ characters: [owner], creatures });
  const third = planVarulvCompanionImport({ characters: [second.owner], creatures: second.entries.map(entry => entry.data) });
  assert.equal(second.owner.id, owner.id);
  assert.deepEqual(second.owner.combatProfile, owner.combatProfile);
  assert.ok(second.owner.inventory.items.some(item => item.id === 'existing-sword'));
  assert.deepEqual(second.entries.map(entry => entry.data), creatures);
  assert.equal(third.inventoryChanged, false);
  assert.equal(third.entries.filter(entry => entry.create).length, 0);
});
