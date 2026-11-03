import test from 'node:test';
import assert from 'node:assert/strict';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildStandardWeaponArchiveEntries } from '../modules/character-archive/character-archive-standard-weapons.js';
import { projectItemRegisterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { coalesceRegisterArchiveEntries } from '../modules/character-archive/character-archive-register-projection.js';
import { coalesceWeaponReferenceArchiveEntries, getWeaponReferenceArchiveEntryForKind } from '../modules/character-archive/character-archive-weapon-reference-projection.js';

const standard = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
const weapon = () => buildStandardWeaponArchiveEntries([standard])[0];
const register = () => projectItemRegisterArchiveEntries([standard])[0];

test('every current standard weapon has one combined card while both original picker contracts remain available', () => {
  const standards = STANDARD_ITEMS.filter(item => item.category === 'waffen' && item.combatDefinition?.kind === 'weapon');
  const input = [...buildStandardWeaponArchiveEntries(standards), ...projectItemRegisterArchiveEntries(standards)];
  const before = structuredClone(input), result = coalesceWeaponReferenceArchiveEntries(input);
  assert.equal(result.length, standards.length);
  for (const card of result) {
    assert.deepEqual(card.alternateKinds, ['attack', 'register-waffen']);
    const attack = getWeaponReferenceArchiveEntryForKind(card, 'attack');
    const goods = getWeaponReferenceArchiveEntryForKind(card, 'register-waffen');
    assert.equal(attack.kind, 'attack'); assert.equal(goods.kind, 'register-waffen');
    assert.equal(attack.data.archiveStandardWeaponId, goods.data.id);
    assert.ok(card.sourceIds.includes(goods.data.id));
    assert.equal(goods.data.definitionRef.id, attack.data.archiveStandardWeaponId);
    assert.notEqual(attack, card.weaponEntry);
    assert.notEqual(goods, card.registerEntry);
    assert.deepEqual(attack, card.weaponEntry);
    assert.deepEqual(goods, card.registerEntry);
  }
  assert.deepEqual(input, before);
  assert.deepEqual(coalesceWeaponReferenceArchiveEntries(result), result);
});

test('equal names never substitute for a standard identity and pinned definition version', () => {
  const personal = weapon(); personal.data.id = 'personal-weapon';
  assert.equal(coalesceWeaponReferenceArchiveEntries([personal, register()]).length, 2);
  const wrong = register(); wrong.data.definitionRef = { ...wrong.data.definitionRef, revision: 'other-version' };
  assert.equal(coalesceWeaponReferenceArchiveEntries([weapon(), wrong]).length, 2);
  const unlinked = register(); delete unlinked.data.definitionRef;
  assert.equal(coalesceWeaponReferenceArchiveEntries([weapon(), unlinked]).length, 2);
  const foreign = register(); foreign.data.id = 'standard:unrelated:blade'; foreign.data.definitionRef = { id: 'standard:unrelated:blade', revision: '1' };
  assert.equal(coalesceWeaponReferenceArchiveEntries([weapon(), foreign]).length, 2);
});

test('personal weapons, possessions and unknown or changed rules remain independent variants', () => {
  const personal = weapon(); personal.data.id = 'copied-instance'; personal.data.ownerCharacterId = 'owner';
  const changed = weapon(); changed.id = 'modified-reference'; changed.data.damageFormula = '2d12';
  const unknown = weapon(); unknown.id = 'future-rule'; unknown.data.newRule = { armorPenetration: 2 };
  const owned = register(); owned.data.section = 'owned'; owned.data.id = 'owned:blade'; owned.data.inventoryItemId = 'blade';
  const input = [weapon(), register(), personal, changed, unknown, owned], before = structuredClone(input);
  const result = coalesceWeaponReferenceArchiveEntries(input);
  assert.equal(result.length, 5);
  assert.ok(result.some(row => row.data.ownerCharacterId === 'owner'));
  assert.ok(result.some(row => row.data.damageFormula === '2d12'));
  assert.ok(result.some(row => row.data.newRule?.armorPenetration === 2));
  assert.ok(result.some(row => row.data.id === 'owned:blade'));
  assert.deepEqual(input, before);
});

test('a manual register icon is preferred without replacing either original row or weapon rules', () => {
  const attack = weapon(); attack.iconOverride = '/older-weapon-icon.png'; attack.updatedAt = '2026-11-02T12:00:00Z';
  const goods = register(); goods.iconOverride = '/newer-register-icon.png'; goods.updatedAt = '2026-11-03T12:00:00Z';
  const result = coalesceWeaponReferenceArchiveEntries([attack, goods]);
  assert.equal(result.length, 1);
  assert.equal(result[0].iconOverride, '/newer-register-icon.png');
  assert.equal(result[0].data.damageFormula, attack.data.damageFormula);
  assert.deepEqual(result[0].weaponEntry, attack);
  assert.equal(result[0].registerEntry.iconOverride, goods.iconOverride);
  const before = structuredClone(result[0]);
  const selectedAttack = getWeaponReferenceArchiveEntryForKind(result[0], 'attack');
  const selectedGoods = getWeaponReferenceArchiveEntryForKind(result[0], 'register-waffen');
  for (const selected of [selectedAttack, selectedGoods]) {
    assert.equal(selected.icon, '/newer-register-icon.png');
    assert.equal(selected.iconOverride, '/newer-register-icon.png');
    assert.equal(selected.data.icon, '/newer-register-icon.png');
    assert.equal(selected.data.image, '/newer-register-icon.png');
  }
  assert.equal(selectedAttack.id, attack.id);
  assert.equal(selectedAttack.data.id, attack.data.id);
  assert.equal(selectedAttack.data.damageFormula, attack.data.damageFormula);
  assert.equal(selectedGoods.id, goods.id);
  assert.equal(selectedGoods.data.id, goods.data.id);
  assert.deepEqual(selectedGoods.data.definitionRef, goods.data.definitionRef);
  assert.notEqual(selectedAttack, result[0].weaponEntry);
  assert.notEqual(selectedGoods, result[0].registerEntry);
  selectedAttack.data.damageFormula = 'changed only on selected clone';
  selectedGoods.data.definitionRef.id = 'changed only on selected clone';
  assert.deepEqual(result[0], before);
  assert.deepEqual(coalesceWeaponReferenceArchiveEntries(result), result);
});

test('shop identities and their original prices and stock survive a combined weapon/register card', () => {
  const offer = { ...structuredClone(standard), id: 'module:weapon-offer', canonicalKey: 'module:weapon-offer',
    section: 'offer', templateId: standard.id, listName: 'Shop', stock: 2,
    priceRange: { minCopper: 111, maxCopper: 222 } };
  const registerRows = coalesceRegisterArchiveEntries(projectItemRegisterArchiveEntries([offer, standard]));
  const input = [weapon(), ...registerRows], before = structuredClone(input);
  const [result] = coalesceWeaponReferenceArchiveEntries(input);
  assert.equal(result.registerVariants.length, 2);
  const originalOffer = result.registerEntry.registerVariants.find(row => row.data.id === offer.id);
  assert.deepEqual(originalOffer.data.priceRange, offer.priceRange);
  assert.equal(originalOffer.data.stock, 2);
  assert.ok(result.sourceIds.includes(offer.id));
  assert.deepEqual(input, before);
});
