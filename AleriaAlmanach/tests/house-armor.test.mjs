import test from 'node:test';
import assert from 'node:assert/strict';
import { houseArmorRank, buildHouseArmorTemplates, findArmorHouse } from '../modules/house-armor/house-armor-model.js';
import { assignHouseArmor, prepareHouseArmorWrite } from '../modules/house-armor/house-armor-assignment.js';
import { queryRegister } from '../modules/item-register/item-register-model.js';
import { prepareCharacterDocumentWrite } from '../modules/characters/character-save-guard.js';
import { prepareHouseArmorRelease } from '../modules/house-armor/house-armor-release.js';
const fixture = (level = 5) => ({ id: 'test-wyrm', name: 'Test Wyrm', genealogy: { houseId: 'house-wyrm' }, inventory: { items: [], money: { gold: 7 } }, combatProfile: { progression: { level }, hitPoints: { current: 3, maximum: 22 }, resources: { action: 0 }, armorClass: { base: 11 }, armorItems: [] } });
test('User rank thresholds and shared art remain descriptive, without combat definitions', () => {
  for (const [level, rank] of [[1,null],[3,null],[4,'jungritter'],[6,'jungritter'],[7,'ritter'],[9,'ritter'],[10,'seniorritter'],[20,'seniorritter']]) assert.equal(houseArmorRank(level)?.id || null, rank);
  const items = buildHouseArmorTemplates().filter(item => item.houseArmor.houseId === 'haus-wyrm');
  assert.equal(items.length, 3); assert.equal(new Set(items.map(item => item.image)).size, 1);
  assert.ok(items.every(item => item.combatDefinition === null && item.priceRange === null));
});
test('First grant is idempotent, unequipped, owned and never changes combat or money', () => {
  const before = fixture(); const frozen = JSON.stringify(before); const after = assignHouseArmor(before);
  assert.equal(after.inventory.items.length, 1); assert.equal(after.inventory.items[0].equipped, false);
  assert.equal(after.inventory.items[0].ownerCharacterId, before.id);
  assert.deepEqual(after.combatProfile, before.combatProfile); assert.deepEqual(after.inventory.money, before.inventory.money);
  assert.equal(assignHouseArmor(after), after); assert.equal(JSON.stringify(before), frozen);
});
test('Sold/transferred/deleted grants are not recreated, including complete imports', () => {
  const granted = assignHouseArmor(fixture()); const removed = { ...granted, inventory: { ...granted.inventory, items: [] } };
  assert.equal(assignHouseArmor(removed), removed);
  const write = prepareCharacterDocumentWrite(removed, fixture(), { replaceExisting: true, userId: 'u', now: 100 });
  assert.equal(write.data.inventory.items.length, 0); assert.deepEqual(write.data.houseArmorAssignment, removed.houseArmorAssignment);
});
test('Level-up changes only variant metadata and generated title, preserving custom art and mechanics', () => {
  const granted = assignHouseArmor(fixture(6)); const item = granted.inventory.items[0]; item.image = '/custom.png';
  const after = prepareHouseArmorWrite(granted, { combatProfile: { ...granted.combatProfile, progression: { level: 10 } } });
  assert.equal(after.inventory.items.length, 1); assert.equal(after.inventory.items[0].id, item.id);
  assert.equal(after.inventory.items[0].houseArmor.rankId, 'seniorritter'); assert.equal(after.inventory.items[0].image, '/custom.png');
  assert.equal(after.inventory.items[0].combatDefinition, null); assert.deepEqual(after.combatProfile.hitPoints, granted.combatProfile.hitPoints);
});
test('Personal armor, custom names, IDs and bonuses remain intact; no duplicate grant', () => {
  const before = fixture(); before.inventory.items = [{ id: 'special', name: 'Meine Rüstung', category: 'armor', image: '/personal.png', equipped: true, combatDefinition: { baseArmorClass: 18 }, quantity: '1' }];
  const after = assignHouseArmor(before); const { houseArmor, ...item } = after.inventory.items[0];
  assert.deepEqual(item, before.inventory.items[0]); assert.equal(after.inventory.items.length, 1); assert.equal(houseArmor.rankId, 'jungritter');
});
test('Primary house wins over guest trees; unrelated, missing and unknown houses are skipped', () => {
  const before = fixture(); before.genealogy = { houseId: 'house-neidr', sources: [{ familyId: 'haus-draig' }] };
  assert.equal(findArmorHouse(before), null); assert.equal(assignHouseArmor(before), before);
  before.genealogy.houseId = 'house-aelmor'; assert.equal(assignHouseArmor(before), before);
  before.genealogy.houseId = ''; assert.equal(assignHouseArmor(before), before);
});
test('House register filters region, house and search together', () => {
  const found = queryRegister(buildHouseArmorTemplates(), { section: 'regional', category: 'ruestungen', regionId: 'celtigerns-wacht', houseId: 'haus-wyrm', search: 'Senior' });
  assert.equal(found.length, 1); assert.equal(found[0].houseArmor.rankId, 'seniorritter');
});

test('Generic placeholders become house armor without changing possession or numerical attributes', () => {
  const before = fixture(20);
  before.inventory.items = [{ id: 'kept', instanceId: 'owned', name: 'Rüstung / Schutz', category: 'armor', image: '', quantity: '1', equipped: false, attributes: [{ label: 'Schutz', value: 3 }] }];
  const { patch } = prepareHouseArmorRelease(before);
  assert.equal(patch.inventory.items.length, 1);
  const item = patch.inventory.items[0];
  assert.equal(item.id, 'kept'); assert.equal(item.instanceId, 'owned'); assert.equal(item.equipped, false);
  assert.equal(item.name, 'Haus Wyrm · Seniorritter-Plattenrüstung');
  assert.equal(item.combatDefinition, undefined); assert.deepEqual(item.attributes, before.inventory.items[0].attributes);
  assert.equal(patch.combatProfile, undefined); assert.equal(patch.houseArmorAssignment.generated, true);
  assert.deepEqual(prepareHouseArmorRelease({ ...before, ...patch }).patch, {});
});

test('Administrative image release preserves every combat field, shield and item identity', () => {
  const before = fixture();
  before.combatProfile.armorItems = [{ id: 'cuirass', name: 'Kettenhemd', kind: 'armor', inventoryItemId: 'mail', image: '', baseArmorClass: 17, equipped: true }, { id: 'shield', name: 'Schild', kind: 'shield', image: '/shield.png' }];
  before.combatProfile.states = [{ id: 'wounded', remaining: 2 }];
  before.inventory.items = [{ id: 'mail', category: 'armor', name: 'Kettenhemd', image: '', equipped: true, combatDefinition: { armorClass: 17 } }, { id: 'sword', category: 'weapon', name: 'Schwert', image: '/sword.png' }];
  const frozen = JSON.stringify(before);
  const { patch } = prepareHouseArmorRelease(before);
  const withoutImages = entries => entries.map(({ image, ...entry }) => entry);
  assert.deepEqual(withoutImages(patch.combatProfile.armorItems), withoutImages(before.combatProfile.armorItems));
  assert.deepEqual({ ...patch.combatProfile, armorItems: null }, { ...before.combatProfile, armorItems: null });
  assert.deepEqual(patch.inventory.items[1], before.inventory.items[1]);
  assert.equal(patch.inventory.items[0].id, 'mail'); assert.equal(patch.inventory.items[0].equipped, true);
  assert.equal(JSON.stringify(before), frozen);
  assert.deepEqual(prepareHouseArmorRelease(fixture(1)).patch, {});
});

test('Verified legacy house receipt enables later rank updates; explicit primary house still wins', () => {
  const before = fixture(); delete before.genealogy;
  const released = { ...before, ...prepareHouseArmorRelease(before, { verifiedHouseId: 'house-draig' }).patch };
  assert.equal(findArmorHouse(released).id, 'haus-draig');
  released.combatProfile.progression.level = 10;
  assert.equal(assignHouseArmor(released).inventory.items[0].houseArmor.rankId, 'seniorritter');
  assert.equal(findArmorHouse({ ...released, genealogy: { houseId: 'house-neidr' } }), null);
  assert.equal(findArmorHouse({ genealogy: { houseId: 'house-craigddu' } }).id, 'craigddu');
});
