import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGroupInventory, addGroupInventoryItem, updateGroupInventoryItem } from '../modules/landing/group-landing-inventory.js';
import { normalizeLandingData } from '../modules/landing/landing-model.js';
import { groupCatalogItems, groupPersonalItems } from '../modules/landing/group-landing-register.js';
import { landingMapFrameSource } from '../modules/landing/landing-map-model.js';

const goods = [
  { id: 'rope', section: 'standard', title: 'Seil', category: 'werkzeuge' },
  { id: 'bread', section: 'offer', title: 'Brot', category: 'speisen', listName: 'Bäckerei' },
  { id: 'old', section: 'offer', title: 'Altes Angebot', archived: true },
  { id: 'sword', section: 'owned', title: 'Schwert', ownerCharacterId: 'one' },
  { id: 'shield', section: 'owned', title: 'Schild', ownerCharacterId: 'two' }
];

test('Catalog filters reuse register search and keep personal property out of the stock chooser', () => {
  const snapshot = { items: goods };
  assert.deepEqual(groupCatalogItems(snapshot).map(item => item.id), ['bread', 'rope']);
  assert.deepEqual(groupCatalogItems(snapshot, { category: 'werkzeuge' }).map(item => item.id), ['rope']);
  assert.deepEqual(groupCatalogItems(snapshot, { search: 'Bäckerei' }).map(item => item.id), ['bread']);
  assert.deepEqual(groupCatalogItems(snapshot, { section: 'standard', search: 'brot' }), []);
  assert.deepEqual(groupPersonalItems([{ characterId: 'one', assignment: 'active' }, { characterId: 'two', assignment: 'reserve' }], snapshot).map(item => item.id), ['sword']);
});

test('Group stock preserves canonical register identity without mutating merchandise or personal inventories', () => {
  const before = JSON.stringify(goods);
  const items = addGroupInventoryItem([], goods[0], { id: 'stock', quantity: 3, holderMemberId: 'crew', location: 'Laderaum' });
  const next = updateGroupInventoryItem(items, 'stock', { quantity: 0, sourceKey: 'wrong', note: 'Verbraucht' });
  assert.equal(next[0].sourceKey, 'rope'); assert.equal(next[0].quantity, 0);
  assert.equal(items[0].quantity, 3); assert.equal(JSON.stringify(goods), before);
  assert.throws(() => addGroupInventoryItem(items, goods[3], { id: 'new' }));
  assert.throws(() => addGroupInventoryItem(items, goods[2], { id: 'new' }));
  assert.throws(() => addGroupInventoryItem(items, goods[0], { id: 'stock' }));
  assert.throws(() => updateGroupInventoryItem(items, 'stock', { quantity: 1.5 }));
  assert.throws(() => updateGroupInventoryItem(items, 'stock', { quantity: -1 }));
});

test('Imported stocks, icons and member badges survive all repeated landing normalizations', () => {
  const source = { group: { inventory: [{ id: 'one', sourceKey: 'missing-template', name: 'Alter Vorrat', quantity: 2, holderMemberId: 'guest', note: 'Erhalten' }],
    icons: { roster: '../IconOrdner/Güter/Abenteurerset.png', location: '⌖' },
    guests: [{ id: 'guest', name: 'Gast', badgeIcon: '⚑', assignment: 'active' }], members: [{ id: 'crew', badgeIcon: '♟' }] } };
  const clean = normalizeLandingData(source);
  assert.deepEqual(normalizeLandingData(clean), clean);
  assert.equal(clean.group.inventory[0].sourceKey, 'missing-template');
  assert.equal(clean.group.guests[0].badgeIcon, '⚑'); assert.equal(clean.group.members[0].badgeIcon, '♟');
  assert.equal(clean.group.icons.location, '⌖');
  assert.equal(normalizeGroupInventory([...clean.group.inventory, ...clean.group.inventory]).length, 1);
});

test('Selected maps embed the registered local viewer and retain the chosen display mode', () => {
  const registry = { byId: id => id === 'my-map' ? { id, link: 'javascript:wrong' } : null };
  assert.equal(landingMapFrameSource('my-map', registry), '../Karten/karte.html?map=my-map');
  assert.equal(landingMapFrameSource('https://unregistered.example', registry), '');
  assert.equal(normalizeLandingData({ group: {} }).mapDisplay, 'embed');
  const source = normalizeLandingData({ group: {}, mapKartenId: 'my-map', mapDisplay: 'image' });
  assert.equal(normalizeLandingData(source).mapDisplay, 'image');
});
