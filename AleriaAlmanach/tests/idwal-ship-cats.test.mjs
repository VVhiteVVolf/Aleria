import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { IDWAL_SHIP_CATS, TREVOR_CHARACTER_ID } from '../modules/creatures/catalog/idwal-ship-cats.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature, makeCreatureExportPayload, normalizeCreatureImportPayload } from '../modules/creatures/creature-model.js';
import { withIdwalShipCatsHierarchy } from '../modules/ship-crews/idwal-ship-cats-hierarchy.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
import { inventoryCompanionViews } from '../modules/character-inventory/character-inventory-identity.js';

test('chosen ship cats survive creature import with distinct portraits, histories and Trevor ownership', async () => {
  const catalog = getBuiltinCreatureTemplates();
  assert.deepEqual(IDWAL_SHIP_CATS.map(c => c.name), ['Bwmbo', 'Uffel']);
  for (const source of IDWAL_SHIP_CATS) {
    const [cat] = normalizeCreatureImportPayload(makeCreatureExportPayload(source));
    assert.equal(catalog.filter(c => c.id === cat.id).length, 1);
    assert.equal(cat.itemOrigin.ownerCharacterId, TREVOR_CHARACTER_ID);
    assert.equal(cat.level, 2);
    assert.equal(cat.combatProfile.progression.level, cat.level);
    assert.equal(cat.combatProfile.hitPoints.hitDie, 4);
    assert.equal(sanitizeCreature(cat).combatProfile.hitPoints.hitDie, 4);
    assert.deepEqual(cat.classification, { genus: 'Katzen', location: 'Tiefenwyrm', house: '' });
    const image = await readFile(new URL('../..' + cat.portrait, import.meta.url));
    assert.equal(image.readUInt32BE(16), 1024);
    assert.equal(image.readUInt32BE(20), 1536);
  }
  assert.match(IDWAL_SHIP_CATS[0].biography.appearance, /Backenbüschel/);
  assert.match(IDWAL_SHIP_CATS[1].biography.history, /bereits auf der Tiefenwyrm/);
  assert.match(IDWAL_SHIP_CATS[1].biography.appearance, /milchig-trüb/);
});

test('fourth hierarchy tree leaves existing command trees and all other pages intact on repeated preparation', async () => {
  const source = JSON.parse(await readFile(new URL('../../Charakter Archiv Exporte/Gruppenübersichten-2026-10-05/idwals-schiffsmannschaft-gruppenuebersicht.json', import.meta.url), 'utf8')).module.entry;
  const original = structuredClone(source);
  const edited = withIdwalShipCatsHierarchy(source);
  const hierarchy = edited.pages.find(p => p.hierarchyPage).hierarchy;
  const before = source.pages.find(p => p.hierarchyPage).hierarchy;
  assert.deepEqual(hierarchy.trees.map(t => t.label), ['Führung', 'Kämpfer', 'Besatzung', 'Schiffskatzen']);
  assert.deepEqual(hierarchy.trees.slice(0, 3), before.trees);
  assert.deepEqual(hierarchy.levels, before.levels);
  assert.deepEqual(hierarchy.trees[3].levels[0].nodes.map(n => n.title), ['Bwmbo', 'Uffel']);
  for (let i = 0; i < source.pages.length; i++) if (!source.pages[i].hierarchyPage) assert.deepEqual(edited.pages[i], source.pages[i]);
  assert.deepEqual(withIdwalShipCatsHierarchy(edited), edited);
  assert.deepEqual(source, original);
  assert.throws(() => withIdwalShipCatsHierarchy({ ...source, id: 'another-crew' }), /Mannschaftsmodul/);
});

test('both cats link once to Trevor while existing possessions, money and combat remain unchanged', () => {
  const cats = IDWAL_SHIP_CATS.map(sanitizeCreature);
  const before = { id: TREVOR_CHARACTER_ID, name: 'Trevor Gwyvern', combatProfile: { hitPoints: { current: 7 }, conditions: [{ id: 'kept' }] }, inventory: {
    money: '17', items: [{ id: 'kept', name: 'Existing possession' }], companions: [
      { id: 'blank', name: 'Reittier / Gefährte', species: 'Tier oder Begleiter', image: '', description: '', status: 'Noch festlegen' },
      { id: 'another', name: 'Existing companion', species: 'Tier', description: 'Keep' }
    ]
  } };
  const after = structuredClone(before);
  for (const cat of cats) after.inventory = attachCreatureToInventory(after, cat, '2026-10-12T12:00:00Z');
  assert.deepEqual(after.combatProfile, before.combatProfile);
  assert.equal(after.inventory.money, before.inventory.money);
  assert.equal(after.inventory.companions[0].status, 'Gesund');
  assert.deepEqual(after.inventory.items[0], before.inventory.items[0]);
  assert.deepEqual(after.inventory.companions[1], before.inventory.companions[1]);
  for (const cat of cats) {
    assert.equal(inventoryCompanionViews(after.inventory, cats).filter(c => c.creatureId === cat.id).length, 1);
    assert.deepEqual(attachCreatureToInventory(after, cat), after.inventory);
  }
  assert.equal(before.inventory.companions[0].name, 'Reittier / Gefährte');
});
