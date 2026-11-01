import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { withRegisterGameplayDefaults } from '../modules/item-register/item-register-gameplay-defaults.js';
import { normalizeItemDefinition } from '../modules/item-definitions/item-definition-model.js';
import { itemDefinitionRegistry } from '../modules/item-definitions/item-definition-registry.js';
import { materializeInventoryItem } from '../modules/item-definitions/item-definition-resolver.js';
import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';
import { getArmorClass, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { prepareCombatEquipment, reserveCombatEquipment } from '../modules/combat/combat-equipment-preparation.js';
import { canCarryCombatShield } from '../modules/combat/combat-support-equipment.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { renderWeaponLoadout } from '../modules/combat/ui/combat-weapon-loadout-view.js';
import { describeEquipmentStats } from '../modules/character-equipment/equipment-stat-description.js';
import { detail } from '../modules/item-register/item-register-view.js';
import { receipts } from './fixtures/jungdrache-fixtures.mjs';
import { itemBuilderDraft, definitionFromBuilderDraft } from '../modules/item-builder/item-builder-model.js';
import { itemBuilderMarkup } from '../modules/item-builder/item-builder-view.js';
import { attachInventoryEquipment } from '../modules/character-equipment/character-equipment-registration.js';
import { getCombatAttackRange } from '../modules/combat/combat-attack-range.js';
import { sanitizeCombatTriggerRule } from '../modules/combat/combat-trigger-rules.js';
import { resolvePreparedCounterProfile } from '../modules/combat/combat-counter-resolution.js';
import { createHuskarlTechnique } from '../modules/combat-styles/huskarl/huskarl-technique-factory.js';
import { createSirenentanzTechnique } from '../modules/combat-styles/sirenentanz/sirenentanz-technique-factory.js';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('../../Markt/WaffenRüstungen/data/shop-data.js', import.meta.url), 'utf8'), context);
const sources = JSON.parse(JSON.stringify(context.window.ARMORY_DATA.items));
const template = id => {
  const row = sources.find(row => row.id === id);
  assert.ok(row, id);
  return withRegisterGameplayDefaults({ id: `standard:waffen-rustungen:${id}`, title: row.name, description: row.desc,
    category: row.category === 'Waffen' ? 'waffen' : 'ruestungen', type: row.type,
    sourceRefs: [{ market: 'Waffen & Rüstungen', sourceId: id }] });
};
const definition = id => normalizeItemDefinition({ ...template(id), kind: 'shared', revision: 'test-2026-11' });
const sword = { id: 'personal-sword', name: 'Persönliches Jungritter-Ritterschwert', weaponType: 'sword',
  damageFormula: '1d8', versatileDamageFormula: '1d10', properties: 'Vielseitig', equipped: true };
function ownerWith(id, { equipped = true, level = 1, dexterity = 10 } = {}) {
  const rules = definition(id);
  const ref = { id: rules.id, revision: rules.revision };
  const inventory = { items: [{ id: 'possession', name: rules.title, quantity: '1', definitionRef: ref, equipped }] };
  const synced = synchronizeEquipmentFromInventory({ inventory, definitions: new Map([[`${ref.id}@${ref.revision}`, rules]]), addMissingEquipment: true,
    combatProfile: { progression: { level }, attributes: [{ key: 'dexterity', score: dexterity }], weapons: [sword], armorItems: [],
      hitPoints: { current: 7, maximumOverride: 30 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
  return { id: 'actor', name: 'Prüffigur', ...synced };
}

test('new weapon standards use approved dice, identity and hands without changing personal junior swords', () => {
  for (const [id, formula, twoHands] of [['streitaxt', '1d12', true], ['ritterschwert', '1d12', true], ['flegel', '3d4', false]]) {
    const rules = definition(id).combatDefinition;
    assert.equal(rules.damageFormula, formula);
    assert.equal(canCarryCombatShield(rules), !twoHands);
    assert.equal(rules.versatileDamageFormula, '');
  }
  assert.equal(template('ritterschwert').title, 'Großschwert');
  const personal = resolveCombatProfile({ id: 'junior', combatProfile: { weapons: [sword] } });
  assert.equal(personal.weapon.damageFormula, '1d8');
  assert.equal(personal.weapon.versatileDamageFormula, '1d10');
});

test('new armor bases stay differentiated while the existing category and level Dexterity limits still apply', () => {
  assert.equal(template('ritterplatte').title, 'Plattenrüstung');
  assert.equal(template('turnierruestung').title, 'Ritterrüstung');
  for (const [id, base] of [['ringpanzer', 12], ['kettenruestung', 13], ['stahlkuerass', 13], ['schuppenpanzer', 14], ['brigantine', 14], ['lamellenpanzer', 14]]) {
    for (const [level, bonus] of [[1, 2], [10, 4], [16, 6]]) {
      const owner = ownerWith(id, { level, dexterity: 22 });
      assert.equal(getArmorClass(owner.combatProfile), base + bonus, `${id} / ${level}`);
    }
  }
  assert.equal(getArmorClass(ownerWith('ritterplatte', { dexterity: 22 }).combatProfile), 15);
  assert.equal(getArmorClass(ownerWith('turnierruestung', { dexterity: 22 }).combatProfile), 18);
  assert.equal(getArmorClass(ownerWith('lederruestung', { dexterity: 22 }).combatProfile), 17);
  assert.equal(getArmorClass(ownerWith('verstaerkte-lederruestung', { dexterity: 22 }).combatProfile), 18);
  const legacy = sanitizeCharacterCombatProfile({ armorItems: [{ id: 'old', name: 'Mittlere Rüstung', kind: 'armor', armorCategory: 'medium', baseArmorClass: 12, equipped: true }] });
  assert.equal(legacy.armorItems[0].baseArmorClass, 14, 'Legacy balance is not retroactively replaced by the new authored bases.');
});

for (const [id, bonus, movement, initiative] of [
  ['buckler', 0, 9, 0], ['rundschild', 2, 9, 0], ['kite-schild', 3, 9, 0], ['turmschild', 4, 8, -1], ['pavese', 5, 6, -2]
]) test(`${id}: the displayed shield rules survive inventory projection and affect only actual equipped combat`, () => {
  const owner = ownerWith(id), profile = resolveCombatProfile(owner);
  const armor = profile.armorItems.find(item => item.inventoryItemId === 'possession');
  assert.equal(armor.armorRuleVersion, 2);
  assert.equal(profile.totalDefense, 10 + bonus);
  assert.equal(profile.movement, movement);
  assert.equal(profile.initiative, initiative);
  assert.equal(profile.currentHitPoints, 7);
  assert.equal(profile.resources.find(resource => resource.id === 'mana').current, 2);
  const label = describeEquipmentStats(definition(id).combatDefinition).join(' · ');
  assert.ok(label.includes(id === 'buckler' ? 'Nahkampf +1 RK' : `+${bonus} RK`));
  const markup = detail({ ...template(id), section: 'standard', priceRange: { minCopper: 1, maxCopper: 1 } }, { characters: [], owned: [], items: [], standards: [] }, {});
  assert.ok(markup.includes(id === 'buckler' ? 'Nahkampf +1 RK' : `+${bonus} RK`));
  const unequipped = resolveCombatProfile(ownerWith(id, { equipped: false }));
  assert.deepEqual([unequipped.totalDefense, unequipped.movement, unequipped.initiative], [10, 9, 0]);
  const blocked = structuredClone(owner);
  blocked.combatProfile.weapons = [{ ...sword, versatileDamageFormula: '', properties: 'Zweihändig', name: 'Zweihand-Prüfklinge' }];
  assert.deepEqual([resolveCombatProfile(blocked).totalDefense, resolveCombatProfile(blocked).movement, resolveCombatProfile(blocked).initiative], [10, 9, 0]);
});

function attacker(weapon = {}, techniques = [], actionId = '') {
  return resolveCombatProfile({ id: 'range-test-attacker', name: 'Waffenprüfer', combatProfile: {
    hitPoints: { current: 20, maximumOverride: 20 },
    weapons: [{ ...sword, id: 'held', equipped: true, proficient: false, versatileDamageFormula: '', ...weapon }], techniques
  } }, { actionId, includeAiSnapshot: false });
}

test('Buckler protects against actual melee hits only, including range overrides and inactive/blocked shields', async () => {
  const target = resolveCombatProfile(ownerWith('buckler'));
  for (const [weapon, defense] of [
    [{ range: 'Nahkampf' }, 11], [{ range: 'Fernkampf' }, 10], [{ range: 'Wurf 6/18 m', weaponType: 'axe' }, 10],
    [{ range: 'Waffenreichweite', weaponType: 'bow' }, 10], [{ range: 'Nahkampf', weaponType: 'bow' }, 10]
  ]) {
    const actor = attacker(weapon);
    const result = await new CombatResolutionService(receipts([10])).resolveAttack({ actor, target });
    assert.equal(result.attack.targetDefense, defense, weapon.range);
    assert.equal(result.attack.hit, defense === 10, 'The same roll must change its actual hit outcome.');
  }
  for (const target of [resolveCombatProfile(ownerWith('buckler', { equipped: false })),
    resolveCombatProfile({ ...ownerWith('buckler'), combatProfile: { ...ownerWith('buckler').combatProfile,
      weapons: [{ ...sword, versatileDamageFormula: '', properties: 'Zweihändig' }] } })]) {
    const result = await new CombatResolutionService(receipts([10])).resolveAttack({ actor: attacker(), target });
    assert.equal(result.attack.targetDefense, 10);
    assert.equal(result.attack.hit, true);
  }
  const otherSelected = ownerWith('buckler');
  otherSelected.combatProfile.armorItems.push({ ...ownerWith('rundschild').combatProfile.armorItems[0], id: 'round' });
  otherSelected.combatProfile.combat = { shieldId: 'round' };
  const result = await new CombatResolutionService(receipts([12])).resolveAttack({ actor: attacker(), target: resolveCombatProfile(otherSelected) });
  assert.equal(result.attack.targetDefense, 12, 'An unselected Buckler must not add its passive on top of the selected shield.');
});

test('authored throwing techniques, inherited repeated throws and alternating held weapons keep their actual attack ranges', async () => {
  const technique = { id: 'throw', name: 'Geworfene Prüfaxt', active: true, weaponTypes: ['axe'], attackRange: 'ranged',
    range: 'Waffenreichweite', damageFormula: '1d6', effects: [{ type: 'damage', target: 'target', on: 'hit', formula: '1d6' }],
    followUpAttack: { enabled: true, inheritWeapon: true, afterMiss: true, repeatCount: 2 } };
  const target = resolveCombatProfile(ownerWith('buckler'));
  const actor = attacker({ weaponType: 'axe', range: 'Nahkampf' }, [technique], 'technique:throw');
  assert.equal(actor.weapon.attackRange, 'ranged');
  const repeated = await new CombatResolutionService(receipts([10, 10, 10])).resolveAttack({ actor, target });
  assert.deepEqual([repeated.attack, ...repeated.followUpAttacks.map(entry => entry.attack)].map(attack => [attack.targetDefense, attack.hit]),
    [[10, true], [10, true], [10, true]]);
  const mixed = structuredClone(actor);
  mixed.weapons.push({ ...mixed.weapons[0], id: 'left', name: 'Linke Nahkampfaxt', equipped: false });
  mixed.combat = { ...mixed.combat, offHandWeaponId: 'left' };
  mixed.selectedAction.followUpAttack.alternateHands = true;
  const alternate = await new CombatResolutionService(receipts([10, 10, 10])).resolveAttack({ actor: mixed, target });
  assert.deepEqual([alternate.attack, ...alternate.followUpAttacks.map(entry => entry.attack)].map(attack => [attack.targetDefense, attack.hit]),
    [[10, true], [11, false], [11, false]], 'Explicit hand changes use their actual held melee weapons.');
  const override = attacker({ weaponType: 'axe' }, [{ ...technique, attackRange: undefined, range: 'Fernkampf' }], 'technique:throw');
  assert.equal(getCombatAttackRange(override), 'ranged');
});

test('a prepared counter uses its actual held weapon instead of the preceding throwing technique range', async () => {
  const previous = attacker({ weaponType: 'axe', range: 'Nahkampf' }, [{ id: 'throw', name: 'Wurf', active: true,
    weaponTypes: ['axe'], attackRange: 'ranged', damageFormula: '1d6' }], 'technique:throw');
  assert.equal(getCombatAttackRange(previous), 'ranged');
  const counter = resolvePreparedCounterProfile(previous, { counterAttack: {} });
  assert.equal(getCombatAttackRange(counter), 'melee');
  const result = await new CombatResolutionService(receipts([10])).resolveAttack({ actor: counter, target: resolveCombatProfile(ownerWith('buckler')) });
  assert.equal(result.attack.targetDefense, 11);
  assert.equal(result.attack.hit, false);
});

test('conditional shields register at zero static RK, old Buckler revisions and unfiltered trigger contracts remain unchanged', () => {
  const rules = definition('buckler'), profile = {}, item = { id: 'new-buckler', name: 'Buckler', quantity: '1' };
  attachInventoryEquipment(profile, item, { definition: rules });
  assert.equal(profile.armorItems.length, 1);
  assert.equal(profile.armorItems[0].triggerRules[0].attackRange, 'melee');
  assert.equal(Object.hasOwn(sanitizeCombatTriggerRule({ effects: { defenseModifier: 1 } }), 'attackRange'), false);
  assert.equal(Object.hasOwn(sanitizeCombatTriggerRule({ attackRange: 'invented' }), 'attackRange'), false);
  const old = itemDefinitionRegistry.get({ id: rules.id, revision: '81bf3a55e2cb1262666adc73' });
  assert.equal(old.combatDefinition.armorClassBonus, 1);
  assert.deepEqual(old.combatDefinition.triggerRules, []);
  for (const technique of [
    createHuskarlTechnique('skytte', 'huskarl-schildgrund', { slug: 'test-throw', name: 'Wurf', weapon: 'throwing', level: 1, cost: 'strike' }),
    createSirenentanzTechnique('milwr', { slug: 'test-harpoon', name: 'Wurf', formId: 'sirenentanz-junge-welle', weapon: 'harpoon', level: 1, cost: 'strike' })
  ]) {
    assert.equal(technique.attackRange, 'ranged');
    assert.equal(sanitizeCharacterCombatProfile({ techniques: [technique] }).techniques[0].attackRange, 'ranged');
  }
});

test('pavise deployment pays the same action and bonus action shown by inventory and combat, with no resource refill on reselection', async () => {
  const owner = ownerWith('pavese', { equipped: false });
  const shield = owner.combatProfile.armorItems[0];
  const selection = { rightWeaponId: sword.id, leftWeaponId: '', shieldId: shield.id };
  const prepared = prepareCombatEquipment(owner, selection);
  assert.deepEqual(prepared.preparation.costs.map(cost => [cost.resourceId, cost.amount]), [['action', 1], ['bonus-action', 1]]);
  const before = resolveCombatProfile(prepared.character, { actionId: 'combat:wait' });
  const reserved = reserveCombatEquipment(before, prepared.preparation);
  assert.equal(reserved.equipmentPreparation.error, '');
  for (const resourceId of ['action', 'bonus-action']) assert.equal(reserved.resources.find(resource => resource.id === resourceId).current,
    before.resources.find(resource => resource.id === resourceId).current - 1);
  const resolved = await new CombatResolutionService(receipts()).resolveAttack({ actor: reserved, target: reserved });
  for (const resourceId of ['action', 'bonus-action']) assert.equal(resolved.actorResourceSnapshot.after.find(resource => resource.id === resourceId).current,
    reserved.resources.find(resource => resource.id === resourceId).current);
  assert.equal(prepareCombatEquipment(prepared.character, selection).preparation, null);
  const markup = renderWeaponLoadout(reserved, { requestedLoadout: selection });
  assert.match(markup, /1 Aktion \+ 1 Bonusaktion/);
  const emptyAction = { ...before, resources: before.resources.map(resource => resource.id === 'action' ? { ...resource, current: 0 } : resource) };
  const refused = reserveCombatEquipment(emptyAction, prepared.preparation);
  assert.match(refused.equipmentPreparation.error, /1 Aktion \+ 1 Bonusaktion/);
  assert.deepEqual(refused.resources, emptyAction.resources);
  assert.deepEqual(prepareCombatEquipment(owner, selection, { free: true }).preparation.costs, []);
});

test('only the selected new shield contributes, and legacy equipment never acquires new penalties', () => {
  const owner = ownerWith('rundschild');
  const pavise = ownerWith('pavese').combatProfile.armorItems[0];
  owner.combatProfile.armorItems.push({ ...pavise, id: 'second-shield' });
  owner.combatProfile.combat = { shieldId: 'second-shield' };
  const profile = resolveCombatProfile(owner);
  assert.deepEqual([profile.totalDefense, profile.movement, profile.initiative], [15, 6, -2]);
  const legacy = ownerWith('pavese');
  delete legacy.combatProfile.armorItems[0].armorRuleVersion;
  assert.deepEqual([resolveCombatProfile(legacy).movement, resolveCombatProfile(legacy).initiative], [9, 0]);
});

test('the previously released standard knight sword remains pinned to its original one-handed and versatile damage', () => {
  const reference = { id: 'standard:waffen-rustungen:ritterschwert', revision: '5ae37b84286373b6d4569563' };
  const before = itemDefinitionRegistry.get(reference);
  assert.equal(before.combatDefinition.damageFormula, '1d8');
  assert.equal(before.combatDefinition.versatileDamageFormula, '1d10');
  const projected = materializeInventoryItem({ id: 'old-sword', definitionRef: reference, name: 'Mein altes Ritterschwert' });
  assert.equal(projected.combatDefinition.damageFormula, '1d8');
  assert.deepEqual(itemDefinitionRegistry.get(reference), before);
});

test('a consciously saved armor builder revision preserves edited bases and editable shield setup costs', () => {
  const body = definitionFromBuilderDraft(itemBuilderDraft({ title: 'Eigener Ringpanzer', category: 'ruestungen',
    combatDefinition: { armorKind: 'armor', armorCategory: 'medium', baseArmorClass: 12 } }, { intent: 'variant' }));
  assert.equal(body.combatDefinition.armorRuleVersion, 2);
  assert.equal(body.combatDefinition.baseArmorClass, 12);
  const draft = itemBuilderDraft({ ...template('pavese'), combatDefinition: definition('pavese').combatDefinition }, { intent: 'variant' });
  const saved = definitionFromBuilderDraft(draft);
  assert.equal(saved.combatDefinition.armorRuleVersion, 2);
  assert.deepEqual(saved.combatDefinition.equipCosts.map(cost => [cost.resourceId, cost.amount]), [['action', 1], ['bonus-action', 1]]);
  assert.match(itemBuilderMarkup(draft, []), /name="equipCosts"/);
  assert.throws(() => normalizeItemDefinition({ ...saved, combatDefinition: { ...saved.combatDefinition, equipCosts: [{ resourceId: 'mana', amount: 1 }] } }), /Aktionsressourcen/);
});
