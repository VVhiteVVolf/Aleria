import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DRAIG_COMPANION_SOURCES } from '../modules/creatures/catalog/draig-companions.js';
import { sanitizeCreature } from '../modules/creatures/creature-model.js';
import { linkCreatureToInventoryCompanion } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';
import { inventoryWithCreatureIdentity } from '../modules/item-register/item-register-companions.js';
import { getMaximumHitPoints, getArmorClass } from '../modules/combat/combat-profile-model.js';

const sourceCharacter = async creature => {
  const slug = creature.itemOrigin.ownerCharacterName.startsWith('Idwal') ? 'idwal' : 'anaraut';
  const path = `../../CharakterDatenbank/records/familien/haus-draig/${slug}-draig--${creature.itemOrigin.ownerCharacterId}/character.json`;
  const record = JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8')).character;
  return { ...record, id: creature.itemOrigin.ownerCharacterId };
};

test('the four companions have the requested levels, individual combat values and preserved descriptions and portraits', async () => {
  assert.deepEqual(DRAIG_COMPANION_SOURCES.map(c => [c.name, c.level]), [['Distry', 1], ['Drecksack', 2], ['Merfyn', 4], ['Gwrgi', 3]]);
  for (const source of DRAIG_COMPANION_SOURCES) {
    const creature = sanitizeCreature(source);
    const owner = await sourceCharacter(creature);
    const legacy = owner.inventory.companions.find(c => c.name === creature.name);
    assert.equal(creature.portrait, legacy.image);
    if (legacy.description) assert.equal(creature.biography.personality, legacy.description);
    assert.equal(creature.combatProfile.progression.level, creature.level);
    assert.equal(getMaximumHitPoints(creature.combatProfile), creature.combatProfile.hitPoints.current);
    assert.ok(getArmorClass(creature.combatProfile) >= 12);
    const attack = creature.combatProfile.weapons.find(w => w.weaponType === 'natural');
    assert.equal(attack.activationType, 'action');
    assert.equal(attack.costs[0].resourceId, 'action');
    assert.equal(creature.combatProfile.magic.enabled, false);
  }
});

test('linking keeps one card, existing IDs, money, possessions and personality; later creature edits use the shared mapping', async () => {
  for (const source of DRAIG_COMPANION_SOURCES) {
    const creature = sanitizeCreature(source);
    const owner = await sourceCharacter(creature);
    const before = structuredClone(owner);
    const legacy = owner.inventory.companions.find(c => c.name === creature.name);
    const inventory = linkCreatureToInventoryCompanion(owner, legacy.id, creature);
    assert.deepEqual(owner, before, 'pure operation');
    assert.equal(inventory.money, owner.inventory.money);
    assert.deepEqual(inventory.items.filter(i => i.id !== creature.itemOrigin.inventoryItemId), owner.inventory.items.filter(i => i.id !== creature.itemOrigin.inventoryItemId));
    assert.equal(inventory.companions.find(c => c.id === legacy.id).description, legacy.description);
    const views = inventoryCompanionViews(inventory, [creature]);
    assert.equal(views.length, owner.inventory.companions.length);
    assert.equal(views.filter(c => c.creatureId === creature.id).length, 1);
    assert.equal(views.find(c => c.creatureId === creature.id).personality, creature.biography.personality);
    const repeated = linkCreatureToInventoryCompanion({ ...owner, inventory }, legacy.id, creature);
    assert.equal(repeated.items.length, inventory.items.length);
    const renamed = inventoryWithCreatureIdentity({ ...owner, inventory }, { ...creature, name: 'Neuer Name' });
    assert.equal(renamed.items.find(i => i.creatureId === creature.id).name, 'Neuer Name');
    assert.throws(() => linkCreatureToInventoryCompanion(owner, legacy.id, { ...creature, itemOrigin: { ...creature.itemOrigin, ownerCharacterId: 'other' } }), /Besitzer/);
  }
});
