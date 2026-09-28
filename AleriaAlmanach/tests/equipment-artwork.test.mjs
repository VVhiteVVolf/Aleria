import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolveEquipmentImage, projectEquipmentArtwork } from '../modules/character-equipment/equipment-artwork.js';
import { EQUIPMENT_ARTWORK } from '../modules/character-equipment/equipment-artwork-catalog.js';
import { resolveInventoryItem } from '../modules/character-inventory/character-inventory-identity.js';
import { buildOwnedItems } from '../modules/item-register/item-register-model.js';
import { resolveCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { extractCharacterArchiveEntries, normalizeCharacterArchiveEntry } from '../modules/character-archive/character-archive-model.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { renderEquipmentArtwork } from '../modules/character-equipment/equipment-artwork-view.js';
import { renderWeaponLoadout } from '../modules/combat/ui/combat-weapon-loadout-view.js';
import { renderCombatSupportEquipment } from '../modules/combat/ui/combat-support-equipment-view.js';

const gawain = JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
const freya = JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/freya-skald.json', import.meta.url), 'utf8')).character;
const rhiannon = JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/rhiannon-draig.json', import.meta.url), 'utf8')).character;
const expected = key => EQUIPMENT_ARTWORK.find(entry => entry.key === key).image;

test('inventory, owned market, combat, sheet and archive resolve the same item without mutating the character', () => {
  const before = structuredClone(gawain);
  const item = gawain.inventory.items.find(item => item.id === 'item-mqu1vat1-0-w8ef');
  const weapon = gawain.combatProfile.weapons.find(entry => entry.inventoryItemId === item.id);
  const image = expected('gawain-drachenzahn');
  assert.equal(resolveInventoryItem(item, { character: gawain }).image, image);
  assert.equal(buildOwnedItems([gawain]).find(entry => entry.inventoryItemId === item.id).image, image);
  assert.equal(resolveCharacterCombatProfile(gawain).weapons.find(entry => entry.id === weapon.id).image, image);
  assert.match(renderEquipmentArtwork(weapon, { characterId: gawain.id }), /gawain-drachenzahn-v1\.png/);
  assert.equal(extractCharacterArchiveEntries(gawain).find(entry => entry.data.id === weapon.id).icon, image);
  assert.deepEqual(gawain, before);
});

test('generic questionnaire IDs and class starter IDs stay scoped to their character', () => {
  const sword = gawain.inventory.items[0];
  assert.equal(resolveEquipmentImage(sword, { characterId: 'another-character' }), sword.image);
  assert.equal(resolveEquipmentImage({ id: 'starter-uchelwyr-longsword' }, { characterId: 'another-knight' }), '');
  assert.equal(resolveEquipmentImage({ id: 'item-mqu1vat1-0-w8ef' }, { characterId: 'y7MBxDiAaesbWHBtmw5Q' }), expected('rhiannon-amethyst-zauberstab'));
  assert.equal(resolveEquipmentImage({ id: 'gildas-gafyr-duty-sword' }, { characterId: 'person--haus-gafyr--gildas-gafyr' }), expected('gildas-pflichtschwur'));
});

test('custom artwork survives in every projection and archive overrides', () => {
  const character = structuredClone(gawain);
  const item = character.inventory.items[0];
  item.image = '/personal/custom-sword.png';
  assert.equal(resolveInventoryItem(item, { character }).image, item.image);
  assert.equal(resolveCharacterCombatProfile(character).weapons.find(entry => entry.inventoryItemId === item.id).image, item.image);
  const weapon = character.combatProfile.weapons.find(entry => entry.inventoryItemId === item.id);
  assert.equal(extractCharacterArchiveEntries(character).find(entry => entry.data.id === weapon.id).icon, item.image);
  assert.equal(projectEquipmentArtwork(character).combatProfile.weapons.find(entry => entry.id === weapon.id).image, item.image);
  const archived = normalizeCharacterArchiveEntry({ kind: 'attack', data: weapon, iconOverride: '/personal/archive.png', sources: [{ kind: 'character', id: character.id }] });
  assert.equal(archived.icon, '/personal/archive.png');
});

test('shield and shield bash use one image, also in the comment equipment controls', () => {
  const projected = projectEquipmentArtwork(freya);
  const shield = projected.combatProfile.armorItems.find(item => item.id === 'freya-shield');
  const bash = projected.combatProfile.weapons.find(item => item.id === 'freya-shield-bash');
  assert.equal(shield.image, expected('freya-schild'));
  assert.equal(bash.image, shield.image);
  const actor = { ...projected.combatProfile, actions: [{ kind: 'equipment-switch' }] };
  assert.match(renderWeaponLoadout(actor), /freya-schild-v1\.png/);
  assert.match(renderCombatSupportEquipment(actor, { right: { weaponType: 'sword' }, dualWield: false }), /freya-schild-v1\.png/);
});

test('transferred equipment retains artwork, rules and quantity under a new owner', () => {
  const giver = structuredClone(gawain);
  const item = giver.inventory.items.find(item => item.id === 'gawain-draig-dagger-item');
  const before = structuredClone(item);
  const result = applySceneInventoryTransfer(giver, { id: 'recipient', name: 'Empfänger' }, { kind: 'item', itemId: item.id, quantity: 1 }, { transferredAt: '2026-09-28T00:00:00Z' });
  const received = result.receiverInventory.items[0];
  assert.equal(received.image, expected('draig-dolch'));
  assert.equal(result.object.image, received.image);
  assert.equal(resolveEquipmentImage(received), received.image);
  assert.deepEqual(received.combatDefinition, before.combatDefinition);
  assert.equal(received.quantity, '1');
  assert.equal(received.ownerCharacterId, 'recipient');
  assert.deepEqual(item, before);
});

test('read projection only changes equipment image fields and is idempotent', () => {
  const projected = projectEquipmentArtwork(gawain);
  assert.deepEqual(projectEquipmentArtwork(projected), projected);
  const withoutImages = value => JSON.parse(JSON.stringify(value, (key, entry) => key === 'image' ? undefined : entry));
  assert.deepEqual(withoutImages(projected), withoutImages(gawain));
});

test('unrelated characters retain their existing combat image precedence', () => {
  const character = { id: 'unrelated', inventory: { items: [{ id: 'item', image: '/inventory.png' }] }, combatProfile: { weapons: [
    { id: 'weapon', inventoryItemId: 'item', image: '/chosen-weapon.png' },
    { id: 'fallback', inventoryItemId: 'item', image: '' }
  ] } };
  const result = projectEquipmentArtwork(character);
  assert.equal(result.combatProfile.weapons[0].image, '/chosen-weapon.png');
  assert.equal(result.combatProfile.weapons[1].image, '/inventory.png');
});

test('legacy archived icons refresh while arbitrary image URLs and symbols do not break fallbacks', () => {
  const weapon = gawain.combatProfile.weapons.find(entry => entry.id === 'gawain-draig-knightly-sword');
  assert.equal(normalizeCharacterArchiveEntry({ kind: 'attack', icon: weapon.image, data: weapon, sources: [{ kind: 'character', id: gawain.id }] }).icon, expected('gawain-drachenzahn'));
  assert.equal(resolveEquipmentImage({ id: weapon.id, icon: '⚔' }, { characterId: gawain.id }), expected('gawain-drachenzahn'));
  assert.equal(resolveInventoryItem({ id: 'ordinary', icon: '⚔', itemDbKey: 'template' }, { templates: new Map([['template', { image: '/template.png' }]]) }).image, '/template.png');
});

test('Rhiannon has the three confirmed possessions without invented combat rules', () => {
  const items = buildOwnedItems([rhiannon]).filter(item => item.image.includes('/rhiannon-'));
  assert.equal(items.length, 3);
  assert.deepEqual(items.map(item => item.title).sort(), ['Amethyst-Zauberstab', 'Amulett', 'Dolch'].sort());
  for (const item of rhiannon.inventory.items.filter(item => item.image.includes('/rhiannon-'))) {
    assert.equal(item.combatDefinition, null);
    assert.equal(item.equipmentLink, null);
  }
});

test('revised published artwork follows transferred items while shared external placeholders remain scoped', () => {
  const source = { id: 'transferred-instance', ownerCharacterId: 'new-owner', image: '/AleriaAlmanach/public/assets/character-equipment/rhiannon-dolch-v1.png' };
  assert.notEqual(source.image, expected('rhiannon-dolch'));
  assert.equal(resolveEquipmentImage(source), expected('rhiannon-dolch'));
  assert.equal(source.image, '/AleriaAlmanach/public/assets/character-equipment/rhiannon-dolch-v1.png');
  assert.equal(resolveEquipmentImage({image:'https://i.imgur.com/38Na5EY.png'}), 'https://i.imgur.com/38Na5EY.png');
  assert.equal(resolveEquipmentImage({...source,image:'/personal/own-dagger.png'}), '/personal/own-dagger.png');
});
