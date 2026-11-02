import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { KNIGHT_EQUIPMENT_TARGETS, planKnightEquipment } from '../modules/gwynthor-seven/knight-equipment-plan.mjs';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { buildGwynthorSevenItems } from '../modules/gwynthor-seven/equipment.mjs';
import { normalizeItemDefinition, itemDefinitionContent } from '../modules/item-definitions/item-definition-model.js';
import { withRegisterGameplayDefaults } from '../modules/item-register/item-register-gameplay-defaults.js';

const now = '2026-11-02T20:00:00.000Z';
const templates = buildGwynthorSevenItems().map(withRegisterGameplayDefaults).map(item => {
  const definition = normalizeItemDefinition({ ...item, kind: 'shared', weight: null }, { id: item.id, revision: 'draft' });
  return { ...item, definitionRef: { id: item.id,
    revision: createHash('sha256').update(itemDefinitionContent(definition)).digest('hex').slice(0, 24) } };
});
const target = key => KNIGHT_EQUIPMENT_TARGETS.find(entry => entry.key === key);
const entry = (plan, key) => plan.entries.find(row => row.key === key);
function character(key, extra = {}) {
  const spec = target(key);
  return { id: spec.knownIds[0], name: spec.name, identity: { worldPersonId: spec.worldPersonId },
    inventory: { revision: 7, items: [] }, combatProfile: { weapons: [], armorItems: [] }, ...extra };
}
function characters() { return KNIGHT_EQUIPMENT_TARGETS.map(spec => character(spec.key)); }
function plan(input = {}) { return planKnightEquipment({ characters: characters(), templates, now, ...input }); }
function grant(key, id, extra = {}) {
  const template = templates.find(item => item.id === `gwynthor-seven:${key}`);
  assert.ok(template, key);
  return { ...createGrantedItem(template, { id, characterId: 'existing-owner', now: 'old' }), ...extra };
}
const placeholder = { id: 'untouched-example', category: 'weapon', name: 'Hauptwaffe', type: 'Waffe',
  description: 'Beschreibe Material, Zustand und besondere Merkmale.' };

test('four canonical identities and exact requested sets include three individual harpoons, two daggers and Owetas three pieces', () => {
  const result = plan();
  assert.equal(result.targetCount, 4);
  assert.equal(result.createdCount, 0);
  assert.equal(result.addedItemCount, 23);
  const caralyn = entry(result, 'caralyn-chwedlonol').character;
  assert.equal(caralyn.id, 'Eka4z7TWpzEgx8KjhIzy');
  assert.equal(caralyn.inventory.items.filter(item => item.templateId === 'gwynthor-seven:chwedonol-harpune').length, 3);
  assert.ok(caralyn.inventory.items.filter(item => item.templateId === 'gwynthor-seven:chwedonol-harpune').every(item => item.quantity === '1'));
  const lefraye = entry(result, 'lefraye-gafyr').character;
  assert.equal(lefraye.inventory.items.filter(item => item.templateId === 'gwynthor-seven:helwyr-kampfdolch').length, 2);
  const oweta = entry(result, 'oweta-draig').character;
  assert.equal(oweta.id, 'vk0xAa3ZcEhVvGC1CzNq');
  assert.equal(oweta.inventory.items.length, 3);
  assert.equal(oweta.combatProfile.weapons.length, 2);
  assert.equal(oweta.combatProfile.armorItems[0].baseArmorClass, 15);
  assert.equal(oweta.combatProfile.armorItems[0].dexterityMode, 'none');
  assert.equal(oweta.combatProfile.weapons.find(item => item.name === 'Draig Ritterschwert').versatileDamageFormula, '1d10');
  for (const row of result.entries) {
    const c = row.character;
    for (const item of [...c.combatProfile.weapons, ...c.combatProfile.armorItems]) {
      assert.ok(c.inventory.items.some(owned => owned.id === item.inventoryItemId));
      assert.equal(item.attackBonus || 0, 0);
      assert.equal(item.damageBonus || 0, 0);
    }
  }
});

test('existing possessions, money, creature, resources, prose, attacks and historical records remain byte-equivalent', () => {
  const realWeapon = { id: 'heirloom', name: 'Hauptwaffe', category: 'weapon', equipped: true,
    combatDefinition: { kind: 'weapon', damageFormula: '2d8+7', properties: 'custom' }, custom: { durable: false } };
  const realArmor = { id: 'armor', name: 'My armor', category: 'armor', equipped: true, combatDefinition: { kind: 'armor', baseArmorClass: 19 } };
  const source = characters();
  source[0] = character('caralyn-chwedlonol', { inventory: { revision: 12, wallet: { copper: 33.25 },
    items: [placeholder, realWeapon, realArmor, { id: 'heulwen', name: 'Heulwen', creatureId: 'live-horse', equipped: true }],
    ledgers: [{ old: 'money history' }] }, biography: { custom: 'untouched prose' },
    combatProfile: { weapons: [{ id: 'history-sword', inventoryItemId: 'heirloom', damageFormula: '2d8+7', equipped: true }],
      armorItems: [{ id: 'old-armor', inventoryItemId: 'armor', baseArmorClass: 19, equipped: true }],
      resources: { mana: { current: 3, maximum: 27 } }, hitPoints: { current: 2, maximum: 41 },
      attacks: [{ id: 'personal' }], history: [{ rolled: 'yesterday' }], progression: { level: 8 }, weird: ['keep'] } });
  const frozen = structuredClone(source);
  const row = entry(plan({ characters: source }), 'caralyn-chwedlonol');
  assert.deepEqual(source, frozen, 'pure planning never mutates input');
  assert.deepEqual(row.before, frozen[0]);
  assert.deepEqual(row.character.biography, source[0].biography);
  for (const item of source[0].inventory.items.slice(1)) assert.deepEqual(row.character.inventory.items.find(i => i.id === item.id), item);
  assert.deepEqual(row.character.inventory.wallet, source[0].inventory.wallet);
  assert.deepEqual(row.character.inventory.ledgers, source[0].inventory.ledgers);
  assert.deepEqual(row.removedPlaceholderIds, ['untouched-example']);
  const { weapons, armorItems, ...keptProfile } = row.character.combatProfile;
  const { weapons: beforeWeapons, armorItems: beforeArmor, ...beforeProfile } = source[0].combatProfile;
  assert.deepEqual(keptProfile, beforeProfile);
  assert.deepEqual(weapons[0], beforeWeapons[0]);
  assert.deepEqual(armorItems[0], beforeArmor[0]);
  assert.ok(row.character.inventory.items.filter(i => row.addedItemIds.includes(i.id)).every(i => !i.equipped));
  assert.equal(row.character.inventory.revision, 13);
});

test('repeating a plan grants nothing, preserves revisions and changes no field', () => {
  const first = plan();
  const saved = first.entries.map(row => row.character);
  const repeated = plan({ characters: saved, now: 'later' });
  assert.equal(repeated.changedCount, 0);
  assert.equal(repeated.addedItemCount, 0);
  assert.deepEqual(repeated.entries.map(row => row.character), saved);
});

test('template and definition identity count existing individual pieces under any instance ID without refilling arrows', () => {
  const source = characters();
  const oneDagger = grant('helwyr-kampfdolch', 'custom-dagger', { name: 'My dagger', equipped: false });
  delete oneDagger.templateId;
  source[2].inventory.items = [oneDagger, grant('standardpfeil', 'used-arrows', { quantity: '4' })];
  const result = entry(plan({ characters: source }), 'lefraye-gafyr');
  assert.deepEqual(result.character.inventory.items.find(i => i.id === 'custom-dagger'), oneDagger);
  assert.equal(result.character.inventory.items.filter(i => i.definitionRef.id === oneDagger.definitionRef.id).length, 2);
  assert.equal(result.character.inventory.items.find(i => i.id === 'used-arrows').quantity, '4');
  assert.equal(result.addedItemIds.length, 7);
  const second = plan({ characters: plan({ characters: source }).entries.map(row => row.character) });
  assert.equal(second.addedItemCount, 0);
});

test('bows get missing itemState links while existing custom state and ammunition choices remain unchanged', () => {
  const source = characters();
  source[2].inventory.items = [grant('helwyr-langbogen', 'bow', { itemState: { durability: 7, ammunitionItemId: 'special-arrow-stack' } }),
    grant('helwyr-kurzbogen', 'short-bow', { itemState: { durability: 5 } }), grant('standardpfeil', 'arrow-stack', { quantity: '0' })];
  const c = entry(plan({ characters: source }), 'lefraye-gafyr').character;
  assert.deepEqual(c.inventory.items.find(i => i.id === 'bow').itemState, { durability: 7, ammunitionItemId: 'special-arrow-stack' });
  assert.deepEqual(c.inventory.items.find(i => i.id === 'short-bow').itemState, { durability: 5, ammunitionItemId: 'arrow-stack' });
  assert.equal(c.inventory.items.find(i => i.id === 'arrow-stack').quantity, '0');
  assert.equal(c.combatProfile.weapons.find(i => i.inventoryItemId === 'bow').ammunition.inventoryItemId, 'special-arrow-stack');
  assert.equal(c.combatProfile.weapons.find(i => i.inventoryItemId === 'short-bow').ammunition.inventoryItemId, 'arrow-stack');
});

test('a surviving later deterministic harpoon slot is reserved before earlier missing copies are granted', () => {
  const source = characters();
  const surviving = grant('chwedonol-harpune', 'caralyn-chwedlonol-chwedonol-harpune-6', { itemState: { durability: 2 } });
  source[0].inventory.items = [surviving];
  const row = entry(plan({ characters: source }), 'caralyn-chwedlonol');
  const harpoons = row.character.inventory.items.filter(i => i.templateId === 'gwynthor-seven:chwedonol-harpune');
  assert.equal(harpoons.length, 3);
  assert.deepEqual(harpoons.find(i => i.id === surviving.id), surviving);
  assert.equal(row.addedItemIds.length, 7);
});

test('existing linked target equipment keeps every live field and its equipped state', () => {
  const source = characters();
  const item = grant('wyrm-ritterschwert', 'local-sword', { equipped: false });
  const combat = { id: 'existing-linked', inventoryItemId: item.id, weaponType: 'sword', equipped: true, damageFormula: '1d8+9', uses: 0, historical: true };
  source[1].inventory.items = [item]; source[1].combatProfile.weapons = [combat];
  const c = entry(plan({ characters: source }), 'rianna-wyrm').character;
  assert.deepEqual(c.combatProfile.weapons[0], combat);
  assert.deepEqual(c.inventory.items[0], item);
  assert.equal(c.combatProfile.weapons.filter(w => w.inventoryItemId === item.id).length, 1);
});

test('existing missing combat profile initializes only seed profile metadata and links only explicit new inventory', () => {
  const source = characters();
  delete source[2].combatProfile; delete source[2].inventory;
  const seed = character('lefraye-gafyr', { inventory: { wallet: { gold: 999 }, items: [{ id: 'not-live' }] },
    combatProfile: { progression: { level: 1 }, hitPoints: { current: 12, maximum: 12 },
      weapons: [{ id: 'seed-duplicate' }], armorItems: [{ id: 'seed-armor' }] } });
  const c = entry(plan({ characters: source, seeds: [seed] }), 'lefraye-gafyr').character;
  assert.deepEqual(c.combatProfile.progression, seed.combatProfile.progression);
  assert.deepEqual(c.combatProfile.hitPoints, seed.combatProfile.hitPoints);
  assert.equal(c.inventory.wallet, undefined);
  assert.equal(c.inventory.items.length, 9);
  assert.equal(c.combatProfile.weapons.length, 5);
  assert.equal(c.combatProfile.armorItems.length, 1);
  assert.equal(c.combatProfile.weapons.some(w => w.id === 'seed-duplicate'), false);
});

test('online record wins over seed; seed creates only a genuinely absent identity without duplicate equipment', () => {
  const first = plan();
  const seeds = first.entries.map(row => row.character);
  const online = characters().filter(c => c.name !== 'Rianna Wyrm');
  const result = plan({ characters: online, seeds });
  assert.equal(result.createdCount, 1);
  assert.equal(entry(result, 'rianna-wyrm').create, true);
  assert.equal(entry(result, 'rianna-wyrm').character.inventory.items.length, 3);
  assert.equal(entry(result, 'caralyn-chwedlonol').create, false);
  assert.equal(entry(result, 'caralyn-chwedlonol').addedItemIds.length, 8);
});

test('identity ambiguity, conflicting worlds, unsafe name-only fallback and missing seeds abort the plan', () => {
  const source = characters();
  assert.throws(() => plan({ characters: [...source, { ...source[0], id: 'duplicate-online' }] }), /mehrdeutig/);
  assert.throws(() => plan({ characters: source.map((c, i) => i ? c : { ...c, genealogy: { worldPersonId: 'person--another--person' } }) }), /widersprüchlich/);
  assert.throws(() => plan({ characters: source.map((c, i) => i ? c : { id: 'unknown-caralyn', name: c.name }) }), /Weltidentität/);
  assert.throws(() => plan({ characters: source.slice(1) }), /keine bestehende Akte/);
});

test('only untouched placeholders are removed and deterministic ID collisions abort without mutation', () => {
  const source = characters();
  source[0].inventory.items = [placeholder, { ...placeholder, id: 'edited-example', description: 'Owner changed this.' }];
  const result = entry(plan({ characters: source }), 'caralyn-chwedlonol');
  assert.ok(result.character.inventory.items.some(i => i.id === 'edited-example'));
  assert.deepEqual(result.removedPlaceholderIds, [placeholder.id]);
  source[0].inventory.items.push({ id: 'caralyn-chwedlonol-caralyn-chwedlonol-ruestung-1', name: 'Real unrelated possession' });
  const original = structuredClone(source);
  assert.throws(() => plan({ characters: source }), /bereits anders belegt/);
  assert.deepEqual(source, original);
});

test('current local source records produce no duplicate grants and preserve all existing profiles', async () => {
  const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
  const before = structuredClone(snapshot.characters);
  const result = plan({ characters: snapshot.characters });
  assert.deepEqual(snapshot.characters, before);
  assert.equal(result.createdCount, 0);
  for (const row of result.entries.filter(row => row.key !== 'oweta-draig')) {
    assert.equal(row.addedItemIds.length, 0, row.key);
    assert.deepEqual(row.character.combatProfile, row.before.combatProfile, row.key);
  }
});
