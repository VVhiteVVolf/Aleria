import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { WEAPON_STANDARD_CATALOG, getWeaponStandardMarketItems } from '../modules/weapon-standards/weapon-standard-catalog.js';
import { normalizeItemDefinition } from '../modules/item-definitions/item-definition-model.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { canCarryCombatShield } from '../modules/combat/combat-support-equipment.js';
import { buildStandardWeaponArchiveEntries } from '../modules/character-archive/character-archive-standard-weapons.js';
import { createCharacterArchiveProfileItem } from '../modules/character-archive/character-archive-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { ARCHIVED_ITEM_DEFINITIONS } from '../modules/item-definitions/item-definition-versions.js';
import { itemBuilderDraft, definitionFromBuilderDraft } from '../modules/item-builder/item-builder-model.js';
import { createGrantedItem } from '../modules/item-register/item-register-model.js';
import { materializeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { resolveStandardItemImage } from '../modules/item-register/item-register-standard-artwork.js';

const sourceText = await readFile(new URL('../../Markt/WaffenRüstungen/data/shop-data.js', import.meta.url), 'utf8');
function market(text) {
  const context = { window: {} };
  vm.runInNewContext(text, context);
  return JSON.parse(JSON.stringify(context.window.ARMORY_DATA.items));
}
const sourceRows = market(sourceText);
const sourceId = id => `standard:waffen-rustungen:${id}`;
const asDefinition = row => normalizeItemDefinition({ id: sourceId(row.id), revision: 'weapon-test-20261103',
  category: 'waffen', title: row.name, description: row.desc, image: row.image, weight: row.weight,
  priceRange: { minCopper: row.price.min, maxCopper: row.price.max }, combatDefinition: row.combatDefinition });

test('35 neutral standards cover missing blade, claw, polearm and eastern forms without replacing released goods', () => {
  assert.equal(WEAPON_STANDARD_CATALOG.length, 35);
  assert.equal(new Set(WEAPON_STANDARD_CATALOG.map(row => row.id)).size, 35);
  for (const id of ['degen', 'rapier', 'saebel', 'kampfklauen', 'khopesh', 'shamshir', 'kukri', 'chakram',
    'katana', 'wakizashi', 'tanto', 'nodachi', 'naginata', 'jian', 'dao', 'yari', 'tonfa', 'nunchaku', 'wurfstern']) {
    assert.ok(WEAPON_STANDARD_CATALOG.some(row => row.id === id), id);
  }
  const original = market(sourceText.split('// BEGIN GENERATED WEAPON STANDARDS')[0]);
  const withoutCompletion = row => { const copy = structuredClone(row); delete copy.combatDefinition; return copy; };
  assert.deepEqual(sourceRows.slice(0, original.length).map(withoutCompletion), original.map(withoutCompletion));
  assert.deepEqual(sourceRows.find(row => row.id === 'saex'), original.find(row => row.id === 'saex'));
  assert.equal(sourceRows.filter(row => row.category === 'Waffen').length, 52);
  const copy = getWeaponStandardMarketItems();
  copy[0].combatDefinition.damageFormula = '9d20';
  assert.equal(WEAPON_STANDARD_CATALOG[0].combatDefinition.damageFormula, '1d8');
});

test('every new standard survives definitions, inventory attachment and real combat-profile normalization', () => {
  for (const row of getWeaponStandardMarketItems()) {
    const definition = asDefinition(row), reference = { id: definition.id, revision: definition.revision };
    const inventory = { items: [{ id: 'owned-standard', name: row.name, quantity: '1', definitionRef: reference, equipped: true }] };
    const prior = { progression: { level: 1, development: { mode: 'purchase' } }, weapons: [],
      hitPoints: { current: 7, maximumOverride: 21 }, resources: [{ id: 'mana-focus', current: 2, maximum: 9 }] };
    const before = structuredClone({ inventory, prior });
    const synced = synchronizeEquipmentFromInventory({ inventory, combatProfile: prior,
      definitions: new Map([[`${reference.id}@${reference.revision}`, definition]]), addMissingEquipment: true });
    const profile = sanitizeCharacterCombatProfile(synced.combatProfile);
    const weapon = profile.weapons.find(weapon => weapon.inventoryItemId === 'owned-standard');
    assert.ok(weapon, row.name);
    assert.equal(weapon.weaponType, row.combatDefinition.weaponType, row.name);
    assert.equal(weapon.weaponProfileId, row.combatDefinition.weaponProfileId, row.name);
    assert.equal(weapon.damageFormula, row.combatDefinition.damageFormula, row.name);
    assert.equal(weapon.versatileDamageFormula, row.combatDefinition.versatileDamageFormula, row.name);
    assert.equal(weapon.attackBonus, 0); assert.equal(weapon.damageBonus, 0);
    const shieldCompatible = !row.combatDefinition.properties.includes('Zweihändig') && row.id !== 'handarmbrust';
    assert.equal(canCarryCombatShield(weapon), shieldCompatible, row.name);
    const actor = resolveCombatProfile({ id: `standard-test-${row.id}`, combatProfile: profile });
    const attack = actor.actions.find(action => action.kind === 'weapon' && action.sourceId === weapon.id);
    assert.ok(attack, row.name);
    assert.equal(attack.formula, row.combatDefinition.damageFormula, row.name);
    assert.deepEqual(attack.costs.map(cost => [cost.resourceId, cost.amount]), [['action', 1]], row.name);
    assert.equal(actor.currentHitPoints, 7);
    assert.equal(profile.resources.find(resource => resource.id === 'mana-focus').current, 2);
    assert.deepEqual({ inventory, prior }, before, row.name);
  }
});

test('archive references expose every standard as an unequipped base attack with its actual artwork and no ownership write', () => {
  const templates = getWeaponStandardMarketItems().map(row => ({ id: sourceId(row.id), title: row.name,
    category: 'waffen', image: row.image, description: row.desc, type: row.type, tags: row.tags,
    sourceRefs: [{ sourceId: row.id }], combatDefinition: row.combatDefinition }));
  const before = structuredClone(templates);
  const entries = buildStandardWeaponArchiveEntries(templates);
  assert.equal(entries.length, 35);
  assert.equal(new Set(entries.map(entry => entry.key)).size, entries.length);
  for (const entry of entries) {
    assert.equal(entry.kind, 'attack'); assert.equal(entry.builtin, true);
    assert.equal(entry.data.equipped, false); assert.equal(entry.data.proficient, false);
    assert.match(entry.icon, /^\/AleriaAlmanach\/public\/assets\/weapon-standards\/[a-z-]+\.png$/);
    assert.equal(entry.data.archiveStandardWeaponId, entry.data.templateId);
    const item = createCharacterArchiveProfileItem(entry, 'weapons');
    assert.notEqual(item.id, entry.data.id);
    assert.equal(item.equipped, false);
    assert.equal(item.damageFormula, entry.data.damageFormula);
    assert.equal(item.inventoryItemId, undefined);
  }
  assert.deepEqual(templates, before);
});

test('cultural silhouettes retain ordinary budgets and manufactured claws remain weapons', () => {
  const get = id => WEAPON_STANDARD_CATALOG.find(row => row.id === id).combatDefinition;
  assert.equal(get('nodachi').damageFormula, '1d12');
  assert.equal(get('katana').damageFormula, '1d8'); assert.equal(get('katana').versatileDamageFormula, '1d10');
  assert.equal(get('naginata').damageFormula, '1d10');
  assert.equal(get('degen').weaponProfileId, get('rapier').weaponProfileId);
  assert.equal(get('kampfklauen').weaponType, 'dagger');
  assert.equal(get('kampfklauen').damageFormula, '1d4');
  for (const row of WEAPON_STANDARD_CATALOG) {
    assert.equal(row.combatDefinition.triggerRules.length, 0, row.name);
    assert.equal(row.combatDefinition.effects.length, 0, row.name);
    assert.match(row.desc, /[.!]/);
    assert.ok(row.weight > 0 && row.price.min > 0, row.name);
  }
});

test('authored weapon kg survive the real register, unique-item builder and inventory without replacing pinned history', () => {
  for (const row of getWeaponStandardMarketItems()) {
    const standard = STANDARD_ITEMS.find(item => item.id === sourceId(row.id));
    assert.ok(standard, row.id);
    assert.equal(standard.weight, row.weight, row.id);
    const definition = itemDefinitionRegistry.get(standard.definitionRef);
    assert.equal(definition.weight, row.weight, row.id);
    const draft = itemBuilderDraft(standard, { intent: 'unique' });
    assert.equal(draft.weight, row.weight, row.id);
    const unique = definitionFromBuilderDraft({ ...draft, title: `Individuelles ${row.name}` });
    assert.equal(unique.kind, 'unique'); assert.equal(unique.weight, row.weight, row.id);
    const reference = { id: unique.id, revision: unique.revision };
    const owned = createGrantedItem({ ...unique, definitionRef: reference }, { id: `owned-${row.id}`, quantity: 2 });
    const definitions = new Map([[`${reference.id}@${reference.revision}`, unique]]);
    assert.equal(owned.weight, String(row.weight), row.id);
    assert.equal(materializeInventoryItem(owned, definitions).weight, String(row.weight), row.id);
    assert.equal(materializeInventoryItem({ ...owned, weight: '7.5' }, definitions).weight, '7.5');
    assert.equal(materializeInventoryItem({ ...owned, weight: '' }, definitions).weight, String(row.weight));
    assert.equal(owned.quantity, '2');
    assert.equal(itemDefinitionRegistry.get(standard.definitionRef).weight, row.weight);
  }
  const old = ARCHIVED_ITEM_DEFINITIONS.find(definition => definition.id === sourceId('stahlschwert') && definition.weight === null);
  assert.ok(old, 'The formerly weightless published weapon revision remains addressable');
  const oldItem = { id: 'old-owned', quantity: '3', definitionRef: { id: old.id, revision: old.revision } };
  const before = structuredClone(oldItem);
  const projected = materializeInventoryItem(oldItem);
  assert.equal(projected.weight, undefined);
  assert.deepEqual(projected.combatDefinition, old.combatDefinition);
  assert.deepEqual(oldItem, before);
});

test('new standard-art fallback uses exact identities and never overwrites a personal unique illustration', () => {
  const id = sourceId('katana'), expected = '/AleriaAlmanach/public/assets/weapon-standards/katana.png';
  assert.equal(resolveStandardItemImage({ templateId: id }), expected);
  assert.equal(resolveStandardItemImage({ definitionRef: { id, revision: 'pinned' } }), expected);
  assert.equal(resolveStandardItemImage({ templateId: id, image: '/personal-katana.png' }), '/personal-katana.png');
  assert.equal(resolveStandardItemImage({ definitionRef: { id: 'unique:personal-katana', revision: 'pinned' }, templateId: id }), '');
});
