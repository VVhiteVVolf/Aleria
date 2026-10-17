import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWeaponDrop } from '../modules/scene-items/scene-items-model.js';
import { createWeaponDrop as createServerWeaponDrop } from '../../firebase/functions/src/generated/scene-items/scene-items-model.js';
import { renderSceneItemEvent } from '../modules/scene-items/scene-items-ui.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';

const { character } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/records/familien/haus-wyrm/gais-wyrm--person--haus-wyrm--gais-wyrm/character.json', import.meta.url), 'utf8'));
const lance = character.inventory.items.find(item => item.id === 'equipment-weapon-starter-uchelwyr-lance');
const image = '/AleriaAlmanach/public/assets/character-equipment/gais-lanze-v4.png';
const historicalDrop = () => ({ operation: 'drop', sceneItemId: 'dropped:gais', sourceActorId: character.id,
  weaponId: 'starter-uchelwyr-lance', item: structuredClone(lance), text: 'Die Lanze fällt zu Boden.' });
const cardItem = html => JSON.parse(html.match(/data-scene-item-card="([^"]*)"/)[1]
  .replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[entity]));

for (const [runtime, createDrop] of [['browser', createWeaponDrop], ['server', createServerWeaponDrop]]) {
  test(`${runtime}: a disarm captures Gais' actual inventory card and personal artwork without changing the sheet`, () => {
    const profile = resolveCombatProfile(character, { actionId: 'weapon:starter-uchelwyr-lance', includeAiSnapshot: false });
    const before = structuredClone(profile);
    const drop = createDrop(profile, { id: 'gais', encounterId: 'duel', reason: 'hit' });
    assert.equal(drop.item.image, image);
    assert.deepEqual(drop.item, { ...lance, quantity: '1', image });
    assert.equal(drop.weaponId, 'starter-uchelwyr-lance');
    assert.deepEqual(profile, before);
    drop.item.combatDefinition.damageFormula = 'changed';
    assert.deepEqual(profile, before, 'the receipt must be detached from the inventory');
  });

  test(`${runtime}: drops also retain individual artwork from the canonical weapon or icon`, () => {
    for (const source of ['weapon', 'icon']) {
      const profile = resolveCombatProfile(character, { actionId: 'weapon:starter-uchelwyr-lance', includeAiSnapshot: false });
      if (source === 'weapon') profile.weapons.find(weapon => weapon.id === profile.weapon.id).image = '/personal/lance.png';
      else profile.inventory.items.find(item => item.id === lance.id).icon = '/personal/lance.png';
      const drop = createDrop(profile, { id: 'custom', reason: 'hit' });
      assert.equal(drop.item.image, '/personal/lance.png');
    }
  });
}

test('an existing drop with an empty image shows the same personal artwork in the bubble and its own card', () => {
  const drop = historicalDrop(), before = structuredClone(drop);
  const html = renderSceneItemEvent(drop);
  assert.ok(html.includes(`<img src="${image}"`), 'root-relative equipment artwork must render');
  assert.deepEqual(cardItem(html), { ...lance, image });
  assert.deepEqual(drop, before, 'historical receipts and rules remain unchanged');
});

test('legacy weapon references resolve through the owner and combat entry, without assigning another owner\'s artwork', () => {
  const drop = historicalDrop();
  drop.item = { id: 'weapon:starter-uchelwyr-lance', name: 'Lanze', image: '' };
  assert.equal(cardItem(renderSceneItemEvent(drop)).image, image);
  drop.sourceActorId = 'another-uchelwyr';
  assert.equal(cardItem(renderSceneItemEvent(drop)).image, '');
});

test('individual card data and custom artwork survive presentation, while older published artwork refreshes', () => {
  const drop = historicalDrop();
  Object.assign(drop.item, { name: 'Gais’ eigene Lanze', description: 'Individuelle Beschreibung', image: '/personal/lance.png',
    valuation: { minCopper: 125, maxCopper: 125 }, infoRows: [{ label: 'Herkunft', value: 'Haus Wyrm' }] });
  assert.deepEqual(cardItem(renderSceneItemEvent(drop)), drop.item);
  drop.item.image = '/AleriaAlmanach/public/assets/character-equipment/gais-lanze-v2.png';
  assert.equal(cardItem(renderSceneItemEvent(drop)).image, image);
});

test('scene image URLs use the shared safety rules and escape card data', () => {
  for (const image of ['/items/lance.png', './items/lance.png', '../items/lance.png', 'public/items/lance.png', 'https://example.com/lance.png?alt=media&token=test']) {
    const html = renderSceneItemEvent({ operation: 'place', sceneItemId: 'placed', item: { name: 'Lanze', image } });
    assert.ok(html.includes('<img '));
    assert.equal(cardItem(html).image, image);
  }
  for (const image of ['javascript:alert(1)', '/item.png" onerror="alert(1)', '⚔']) {
    const html = renderSceneItemEvent({ operation: 'place', sceneItemId: 'placed', item: { name: '<Lanze>', image } });
    assert.ok(!html.includes('<img '));
    assert.ok(html.includes('&lt;Lanze&gt;'));
    assert.equal(cardItem(html).image, '');
  }
});
