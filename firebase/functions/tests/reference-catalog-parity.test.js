import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CULTURAL_ORIGINS as browserOrigins, getCulturalOriginTemplate as browserOrigin } from '../../../AleriaAlmanach/modules/character-origins/cultural-origin-catalog.js';
import { CHARACTER_CULTURAL_ORIGINS as serverOrigins, getCulturalOriginTemplate as serverOrigin } from '../src/generated/character-origins/cultural-origin-catalog.js';
import { getCharacterCreationTemplate as browserTemplate } from '../../../AleriaAlmanach/modules/combat/character-creation-templates.js';
import { getCharacterCreationTemplate as serverTemplate } from '../src/generated/combat/character-creation-templates.js';
import { createCharacterCreationDraft, applyCharacterCreationDraft } from '../../../AleriaAlmanach/modules/combat/character-creation-model.js';
import { STANDARD_ITEMS as browserItems, STANDARD_VERSION as browserVersion } from '../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { STANDARD_ITEMS as serverItems, STANDARD_VERSION as serverVersion } from '../src/generated/item-register/item-register-standard.js';
import { synchronizeEquipmentFromInventory as browserSync } from '../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';
import { synchronizeEquipmentFromInventory as serverSync } from '../src/generated/character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile as browserNormalize } from '../../../AleriaAlmanach/modules/combat/combat-profile-model.js';
import { sanitizeCharacterCombatProfile as serverNormalize } from '../src/generated/combat/combat-profile-model.js';
import { resolveCombatProfile as browserResolve } from '../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { resolveCombatProfile as serverResolve } from '../src/generated/combat/combat-profile-resolver.js';
import { getCombatWeaponProfileFamilies as browserFamilies, isCombatWeaponProfileAllowed as browserAllowed } from '../../../AleriaAlmanach/modules/combat/combat-weapon-profile-family.js';
import { getCombatWeaponProfileFamilies as serverFamilies, isCombatWeaponProfileAllowed as serverAllowed } from '../src/generated/combat/combat-weapon-profile-family.js';

const attributeKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
const weapons = browserItems.filter(item => item.category === 'waffen' && item.id.startsWith('standard:waffen-rustungen:'));

test('all 28 cultural packages retain their exact budgets and selected attributes on the server without granting possessions', () => {
  assert.equal(browserOrigins.length, 28);
  assert.deepEqual(serverOrigins, browserOrigins);
  for (const origin of browserOrigins) {
    for (const key of [origin.id, origin.label, ...origin.aliases]) assert.deepEqual(serverOrigin(key), browserOrigin(key), key);
    assert.deepEqual(serverTemplate('ancestry', origin.id), browserTemplate('ancestry', origin.id));
    assert.deepEqual(Object.values(origin.attributeBonuses).sort(), [1, 2], origin.id);
    const original = browserNormalize({ progression: { development: { mode: 'purchase' } } });
    const draft = createCharacterCreationDraft(original);
    draft.selections = { ancestryId: origin.id, backgroundId: 'ritter', classId: 'teulu' };
    draft.attributeMethod = 'free';
    draft.baseAttributes = Object.fromEntries(attributeKeys.map(key => [key, 10]));
    const created = applyCharacterCreationDraft(original, draft, { now: '2026-11-03T00:00:00.000Z' });
    assert.equal(created.ok, true, origin.id);
    created.profile.hitPoints.current = 7;
    const before = structuredClone(created.profile);
    const server = serverNormalize(created.profile);
    assert.deepEqual(server, browserNormalize(created.profile), origin.id);
    for (const key of attributeKeys) assert.equal(server.attributes.find(attribute => attribute.key === key).score, 10 + (origin.attributeBonuses[key] || 0), `${origin.id}: ${key}`);
    assert.deepEqual(server.weapons, original.weapons, origin.id);
    assert.deepEqual(server.techniques, original.techniques, origin.id);
    assert.equal(server.hitPoints.current, 7);
    assert.deepEqual(server.resources, created.profile.resources, origin.id);
    assert.deepEqual(created.profile, before, 'Server projection never rewrites the source character');
  }
  assert.equal(serverOrigin('Briath'), null);
  assert.equal(serverOrigin('Dunkelhain'), null);
});

test('all 52 standard armory weapons preserve their catalog, equipped attack and action costs on browser and server', () => {
  assert.equal(weapons.length, 52);
  assert.equal(serverVersion, browserVersion);
  assert.deepEqual(serverItems, browserItems);
  for (const standard of weapons) {
    const inventory = { items: [{ id: 'owned-standard', name: standard.title, quantity: '1', templateId: standard.id,
      definitionRef: standard.definitionRef, equipped: true, combatDefinition: standard.combatDefinition }] };
    const combatProfile = { progression: { level: 1, development: { mode: 'purchase' } }, weapons: [],
      hitPoints: { current: 7, maximumOverride: 21 }, resources: [{ id: 'mana-focus', current: 2, maximum: 9 }] };
    const source = { inventory, combatProfile }, before = structuredClone(source);
    const browserEquipment = browserSync({ ...source, addMissingEquipment: true });
    const serverEquipment = serverSync({ ...source, addMissingEquipment: true });
    assert.deepEqual(serverEquipment, browserEquipment, standard.id);
    const clientProfile = browserNormalize(browserEquipment.combatProfile), serverProfile = serverNormalize(serverEquipment.combatProfile);
    assert.deepEqual(serverProfile, clientProfile, standard.id);
    const held = serverProfile.weapons.find(weapon => weapon.inventoryItemId === 'owned-standard');
    assert.ok(held, standard.id);
    assert.equal(held.damageFormula, standard.combatDefinition.damageFormula, standard.id);
    assert.equal(held.attackBonus, standard.combatDefinition.attackBonus || 0, standard.id);
    assert.equal(held.damageBonus, standard.combatDefinition.damageBonus || 0, standard.id);
    assert.deepEqual(serverFamilies(held.weaponProfileId, held.weaponType), browserFamilies(held.weaponProfileId, held.weaponType));
    const clientActor = browserResolve({ id: 'reference-parity', combatProfile: clientProfile });
    const serverActor = serverResolve({ id: 'reference-parity', combatProfile: serverProfile });
    assert.deepEqual(serverActor.actions, clientActor.actions, standard.id);
    const attack = serverActor.actions.find(action => action.kind === 'weapon' && action.sourceId === held.id);
    assert.ok(attack, standard.id);
    assert.equal(attack.formula, standard.combatDefinition.damageFormula, standard.id);
    assert.deepEqual(attack.costs.map(cost => [cost.resourceId, cost.amount]), [['action', 1]], standard.id);
    assert.equal(serverActor.currentHitPoints, 7, standard.id);
    assert.equal(serverProfile.resources.find(resource => resource.id === 'mana-focus').current, 2, standard.id);
    assert.deepEqual(source, before, 'Projection never changes possession, pinned definition, quantity or resources');
  }
});

test('server weapon families accept explicit variants while rejecting nearby specialized profiles', () => {
  const allowed = [
    ['sword', 'greatsword'], ['sword', 'shortsword'], ['crossbow', 'hand-crossbow'],
    ['crossbow', 'light-crossbow'], ['crossbow', 'heavy-crossbow'], ['staff', 'quarterstaff'],
    ['warhammer', 'maul'], ['rider-spear', 'lance']
  ];
  const forbidden = [
    ['sword', 'rapier'], ['rapier', 'sword'], ['greatsword', 'sword'], ['shortbow', 'longbow'],
    ['longbow', 'shortbow'], ['spear', 'harpoon'], ['harpoon', 'spear']
  ];
  for (const [family, actual] of allowed) {
    assert.equal(browserAllowed([family], actual), true, `${family}: ${actual}`);
    assert.equal(serverAllowed([family], actual), true, `${family}: ${actual}`);
  }
  for (const [family, actual] of forbidden) {
    assert.equal(browserAllowed([family], actual), false, `${family}: ${actual}`);
    assert.equal(serverAllowed([family], actual), false, `${family}: ${actual}`);
  }
});
