import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSceneItemDefinition, sceneItemDraftFromTemplate, SCENE_ITEM_KINDS } from '../modules/scene-items/scene-item-definition.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';
import { renderSceneItemEvent } from '../modules/scene-items/scene-items-ui.js';
import { deriveSceneItems } from '../modules/scene-items/scene-items-model.js';
const draft = { name: 'Fundstück', description: 'Ein verwittertes Fundstück.', category: 'equipment' };

test('all six authoring templates use the existing inventory card variants', () => {
  const expected = { weapon: 'weapon', armor: 'armor', potions: 'consumable', artifact: 'artifact', equipment: 'equipment', documents: 'document' };
  for (const category of Object.keys(SCENE_ITEM_KINDS)) {
    const item = buildSceneItemDefinition({ ...draft, category });
    assert.equal(inventoryCardModel(item).kind, expected[category]);
  }
});
test('unspecified prices remain open; one amount is a fixed price and Pfennige are retained', () => {
  assert.equal(buildSceneItemDefinition(draft).valuation, null);
  assert.deepEqual(buildSceneItemDefinition({ ...draft, priceMin: '12.34', priceMax: '' }).valuation, { minCopper: 12.34, maxCopper: 12.34 });
  assert.deepEqual(buildSceneItemDefinition({ ...draft, priceMin: 0, priceMax: 0 }).valuation, { minCopper: 0, maxCopper: 0 });
});
test('trusted template mechanics survive editing, custom drafts cannot inject arbitrary trigger rules', () => {
  const template = { id: 'standard:test', title: 'Klinge', description: 'Eine Klinge.', category: 'waffen', priceRange: { minCopper: 400, maxCopper: 500 },
    combatDefinition: { kind: 'weapon', damageFormula: '1d8', triggerRules: [{ id: 'trusted-effect', description: 'Vorlageneffekt' }] } };
  const item = buildSceneItemDefinition({ ...sceneItemDraftFromTemplate(template), name: 'Eigene Klinge', combatDefinition: { triggerRules: [{ id: 'forged-effect' }] } }, template);
  assert.equal(item.name, 'Eigene Klinge');assert.deepEqual(item.combatDefinition.triggerRules, template.combatDefinition.triggerRules);
  assert.deepEqual(item.valuation, template.priceRange);
});
test('invalid image links and dice are rejected before placement', () => {
  assert.throws(() => buildSceneItemDefinition({ ...draft, image: 'javascript:alert(1)' }), /Bildlink/);
  assert.throws(() => buildSceneItemDefinition({ ...draft, category: 'weapon', damageFormula: 'unendlich' }), /Würfelformel/);
  assert.throws(() => buildSceneItemDefinition({ ...draft, name: '' }), /Name/);
});
test('published segments are immediately available and expose escaped item-card data', () => {
  const item = buildSceneItemDefinition({ ...draft, name: 'Fund <img src=x>', description: 'Ein "besonderer" Fund.' });
  const event = { operation: 'place', sceneItemId: 'test-scene-item', item };
  assert.equal(deriveSceneItems([{ commentSegments: [{ sceneItemEvent: event }] }]).get(event.sceneItemId).available, true);
  const html = renderSceneItemEvent(event);
  assert.ok(html.includes('data-scene-item-action="card"'));assert.ok(html.includes('data-scene-item-card='));
  assert.ok(!html.includes('<img src=x>'));assert.ok(html.includes('&lt;img src=x&gt;'));
});
