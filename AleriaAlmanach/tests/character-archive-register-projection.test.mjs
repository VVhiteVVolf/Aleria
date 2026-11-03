import test from 'node:test';
import assert from 'node:assert/strict';
import { coalesceRegisterArchiveEntries } from '../modules/character-archive/character-archive-register-projection.js';
import { projectItemRegisterArchiveEntries } from '../modules/character-archive/character-archive-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const standard = STANDARD_ITEMS.find(item => item.id === 'standard:gemischtwarenhandler:rucksack');
const entry = item => projectItemRegisterArchiveEntries([item])[0];
const offer = (id, overrides = {}) => entry({ ...structuredClone(standard), id, canonicalKey: id,
  section: 'offer', templateId: standard.id, listName: id, ...overrides });

test('a pinned standard and its shop offers form one view card without losing original identities or availability', () => {
  const input = [offer('module:first', { description: 'Erstes Angebot', stock: 3, priceRange: { minCopper: 10, maxCopper: 12 } }),
    entry(standard), offer('module:second', { description: 'Zweites Angebot', stock: 0, priceRange: { minCopper: 18, maxCopper: 18 } })];
  const before = structuredClone(input);
  const result = coalesceRegisterArchiveEntries(input);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, input[1].id, 'The actual standard remains the primary card even when offers arrive first');
  assert.equal(result[0].registerPresentation.kind, 'template');
  assert.equal(result[0].registerPresentation.variantCount, 3);
  assert.deepEqual(new Set(result[0].sourceIds), new Set(input.map(row => row.data.id)));
  assert.deepEqual(result[0].registerVariants, before);
  assert.equal(result[0].registerVariants[0].data.stock, 3);
  assert.equal(result[0].registerVariants[2].data.stock, 0);
  assert.equal(result[0].sources.length, 3);
  assert.deepEqual(input, before);
  assert.deepEqual(coalesceRegisterArchiveEntries(result), result, 'Repeated presentation never nests or loses source variants');
});

test('matching names do not join unknown definitions, different definitions, revisions or rule overrides', () => {
  const plain = entry(standard);
  const missingA = offer('module:no-ref-a'); delete missingA.data.definitionRef;
  const missingB = offer('module:no-ref-b'); delete missingB.data.definitionRef;
  const other = offer('module:other'); other.data.definitionRef = { id: 'shared:unknown', revision: '1' };
  const old = offer('module:old'); old.data.definitionRef = { ...standard.definitionRef, revision: 'old' };
  const changed = offer('module:changed'); changed.data.weight = 42;
  const result = coalesceRegisterArchiveEntries([plain, missingA, missingB, other, old, changed]);
  assert.equal(result.length, 6);
  assert.equal(result.find(row => row.data.id === 'module:changed').registerPresentation.label, 'Variante');
});

test('same-reference rule overrides remain variants while an icon-only assignment joins its template', () => {
  const weapon = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const base = entry(weapon);
  const changed = entry({ ...structuredClone(weapon), id: 'module:changed-weapon', canonicalKey: 'module:changed-weapon', section: 'offer',
    combatDefinition: { ...weapon.combatDefinition, damageFormula: '2d12' } });
  const manual = offer('module:manual'); manual.iconOverride = '/my-icon.png';
  const passive = offer('module:passive'); passive.data.passiveEffects = [{ id: 'my-rule', type: 'skill', skill: 'Athletik', bonus: 3 }];
  const result = coalesceRegisterArchiveEntries([base, changed, entry(standard), manual, passive]);
  assert.equal(result.length, 4);
  assert.equal(result.find(row => row.data.id === 'module:changed-weapon').data.combatDefinition.damageFormula, '2d12');
  const illustrated = result.find(row => row.data.id === standard.id);
  assert.equal(illustrated.iconOverride, '/my-icon.png');
  assert.ok(illustrated.registerVariants.some(row => row.data.id === 'module:manual'));
});

test('manual archive markers and icon assignments alone neither split a template nor lose original artwork', () => {
  const manual = offer('module:manual-only');
  manual.id = 'custom--manual-artwork'; manual.builtin = false;
  manual.iconAssignmentVersion = 1; manual.icon = '/latest-artwork.png'; manual.updatedAt = '2026-11-03T12:00:00Z';
  const input = [manual, entry(standard)], before = structuredClone(input);
  const result = coalesceRegisterArchiveEntries(input);
  assert.equal(result.length, 1);
  assert.equal(result[0].data.id, standard.id);
  assert.equal(result[0].icon, '/latest-artwork.png');
  assert.equal(result[0].iconAssignmentVersion, 1);
  assert.deepEqual(result[0].registerVariants, before);
  assert.deepEqual(input, before);
  assert.deepEqual(coalesceRegisterArchiveEntries(result), result);
});

test('malformed historical rule data remains a separate variant without breaking the archive', () => {
  const weapon = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const malformed = entry({ ...structuredClone(weapon), id: 'module:malformed', canonicalKey: 'module:malformed', section: 'offer' });
  malformed.data.combatDefinition.damageFormula = 'not-a-die';
  const result = coalesceRegisterArchiveEntries([entry(weapon), malformed]);
  assert.equal(result.length, 2);
  assert.equal(result[1].registerPresentation.kind, 'variant');
  assert.equal(result[1].data.combatDefinition.damageFormula, 'not-a-die');
});

test('unknown rule fields are preserved as variants instead of disappearing through definition normalization', () => {
  const unknown = offer('module:unknown-rule'); unknown.data.futureRule = { bonus: 2 };
  const nested = offer('module:nested-rule'); nested.data.useDefinition = { futureRule: { bonus: 2 } };
  const weapon = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const combat = entry(weapon); combat.data.combatDefinition.futureRule = { armorPenetration: 2 };
  const result = coalesceRegisterArchiveEntries([entry(standard), unknown, nested, combat]);
  assert.equal(result.length, 4);
  assert.equal(result[1].data.futureRule.bonus, 2);
  assert.equal(result[2].data.useDefinition.futureRule.bonus, 2);
  assert.equal(result[3].data.combatDefinition.futureRule.armorPenetration, 2);
  assert.equal(result[3].registerPresentation.kind, 'variant');
});

test('owned items, individual animals and unique definitions keep stable identities and are clearly labeled', () => {
  const first = offer('owned:first', { section: 'owned', ownerCharacterId: 'owner', inventoryItemId: 'first', quantity: '2' });
  const second = offer('owned:second', { section: 'owned', ownerCharacterId: 'owner', inventoryItemId: 'second', quantity: '1' });
  const horse = STANDARD_ITEMS.find(item => item.mountId === 'afol');
  const animal = entry({ ...structuredClone(horse), id: 'offer:animal', canonicalKey: 'offer:animal', section: 'offer' });
  const unique = offer('unique:personal', { definitionKind: 'unique' });
  const input = [first, second, entry(horse), animal, unique], before = structuredClone(input);
  const result = coalesceRegisterArchiveEntries(input);
  assert.equal(result.length, input.length);
  for (const id of ['owned:first', 'owned:second']) assert.equal(result.find(row => row.data.id === id).registerPresentation.label, 'Besitz');
  assert.equal(result.find(row => row.data.id === 'offer:animal').registerPresentation.kind, 'animal');
  assert.equal(result.find(row => row.data.id === 'unique:personal').registerPresentation.label, 'Variante');
  assert.deepEqual(result.map(row => row.data), input.map(row => row.data));
  assert.deepEqual(input, before);
});

test('unrelated archive entries pass through without acquiring register semantics', () => {
  const ability = { id: 'personal-ability', kind: 'ability', name: 'Rucksack', data: { id: 'personal-ability' } };
  assert.equal(coalesceRegisterArchiveEntries([ability])[0], ability);
});
