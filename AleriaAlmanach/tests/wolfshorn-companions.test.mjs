import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { WOLFSHORN_COMPANIONS, WOLFSHORN_OWNER_IDS } from '../modules/creatures/catalog/wolfshorn-companions.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { sanitizeCreature, makeCreatureExportPayload, normalizeCreatureImportPayload, createCreatureDuplicate } from '../modules/creatures/creature-model.js';
import { resolveCreatureBestiaryAncestry } from '../modules/creatures/creature-bestiary-reference.js';
import { renderCreatureDossier } from '../modules/creatures/creature-dossier.js';
import { buildCreatureGroupTree } from '../modules/creatures/creature-classification.js';
import { attachCreatureToInventory } from '../modules/creatures/creature-companion-link.js';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const creatures = WOLFSHORN_COMPANIONS.map(sanitizeCreature);
const exportFolder = new URL('../../Charakter Archiv Exporte/gefaehrten/wolfshorn-2026-10-13/', import.meta.url);

test('five named companions have unique catalog identities, matching species, owner and selected portraits', async () => {
  assert.deepEqual(creatures.map(c => c.name), ['Skarn', 'Myrk', 'Lund', 'Häppchen', 'Silberkrone']);
  const assets = (await read(new URL('../assets/companions/wolfshorn/assets-2026-10-13.json', import.meta.url))).assets;
  for (const creature of creatures) {
    assert.equal(getBuiltinCreatureTemplates().filter(c => c.id === creature.id).length, 1);
    assert.ok(creature.level <= (creature.classification.genus === 'Pferde' ? 3 : 2));
    assert.equal(creature.combatProfile.progression.level, creature.level);
    assert.ok(creature.bestiaryReference || creature.bestiaryAncestry);
    const bytes = await readFile(new URL('../..' + creature.portrait, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), assets.find(a => a.path === creature.portrait).sha256);
    assert.equal(bytes.readUInt32BE(16), 1024); assert.equal(bytes.readUInt32BE(20), 1536);
  }
  const tree = buildCreatureGroupTree(creatures);
  assert.equal(tree.find(n => n.label === 'Pferde').children.find(n => n.label === 'Celtigerns Wacht').count, 4);
  assert.equal(tree.find(n => n.label === 'Wölfe').children.find(n => n.label === 'Celtigerns Wacht').count, 1);
});

test('Skarns age and grandfather relation and the horses individual histories are explicit', () => {
  const [skarn, myrk, lund, haeppchen, mare] = creatures;
  assert.match(skarn.biography.history, /36/); assert.match(skarn.biography.history, /Großvater/);
  assert.match(skarn.biography.history, /über die Schulter/); assert.equal(skarn.combatProfile.combat.movement, 6);
  assert.match(myrk.biography.personality, /Treue/); assert.match(lund.biography.history, /nicht als Zuchtpferd/);
  assert.match(lund.combatProfile.abilities.find(a => a.name === 'Wachsames Waldpferd').description, /Wahrnehmungsproben/);
  assert.match(haeppchen.biography.history, /vier bis fünf/); assert.match(mare.biography.appearance, /Flechtmähne/);
  assert.match(mare.biography.appearance, /Schildbuckel/);
});

test('uncertain mixed ancestry survives round trips, uses canonical links and never invents a breed', () => {
  const lund = creatures.find(c => c.name === 'Lund');
  assert.equal(lund.bestiaryReference, null);
  const [imported] = normalizeCreatureImportPayload(makeCreatureExportPayload(lund));
  assert.deepEqual(imported.bestiaryAncestry, lund.bestiaryAncestry);
  assert.deepEqual(createCreatureDuplicate(lund).bestiaryAncestry, lund.bestiaryAncestry);
  const html = renderCreatureDossier(lund);
  assert.match(html, /Abstammungsverweise/); assert.match(html, /Weitere Rassen/);
  for (const name of ['hest', 'tirashan']) assert.ok(html.includes(`/Bestiarium/tiere/pferde/${name}/index.html`));
  const ancestry = { references: [{ id: 'tiere/pferde/hest', url: 'javascript:alert(1)', name: '<script>' }, { id: 'invented' }], notes: 'Unsicher' };
  assert.deepEqual(resolveCreatureBestiaryAncestry({ species: 'Hest-Mischling', bestiaryAncestry: ancestry }).references,
    [{ id: 'tiere/pferde/hest', name: 'Hest', url: '/Bestiarium/tiere/pferde/hest/index.html' }]);
  for (const source of [{ species: 'Mensch' }, { species: 'Unbekannt' }, { species: 'Hest', classification: { genus: 'Katzen' } }]) {
    assert.equal(resolveCreatureBestiaryAncestry({ ...source, bestiaryAncestry: ancestry }), null);
  }
});

test('inventory attachments are idempotent and preserve existing Freki, possessions and live combat', () => {
  const mare = creatures.find(c => c.name === 'Silberkrone');
  const owner = { id: WOLFSHORN_OWNER_IDS.ylva, name: 'Ylva Wolfshorn', combatProfile: { hitPoints: { current: 7 }, resources: [{ current: 0 }], conditions: [{ active: true }] },
    inventory: { money: '17 Silber', items: [{ id: 'ylva-freki', creatureId: 'companion-ylva-freki', name: 'Freki' }],
      companions: [{ id: 'freki-card', name: 'Freki', creatureId: 'companion-ylva-freki', inventoryItemId: 'ylva-freki' }] } };
  const before = structuredClone(owner), inventory = attachCreatureToInventory(owner, mare);
  assert.deepEqual(owner, before); assert.deepEqual(inventory.items[0], before.inventory.items[0]);
  assert.deepEqual(inventory.companions[0], before.inventory.companions[0]); assert.equal(inventory.money, before.inventory.money);
  assert.deepEqual(attachCreatureToInventory({ ...owner, inventory }, mare), inventory);
  assert.equal(inventory.items[1].ownerCharacterId, owner.id); assert.equal(inventory.items[1].creatureId, mare.id);
});

test('local records and review exports link each companion to its actual owner; Freki and Skarns status remain distinct', async () => {
  const registry = await read(new URL('../../CharakterDatenbank/registry.json', import.meta.url));
  assert.equal(registry.count, 238);
  for (const [slug, id] of Object.entries(WOLFSHORN_OWNER_IDS)) {
    const review = (await read(new URL(`${slug}-vollstaendiger-entwurf.json`, exportFolder))).character;
    const entry = registry.records.find(r => r.firestoreDocumentId === id);
    const local = (await read(new URL('../../CharakterDatenbank/' + entry.path, import.meta.url))).character;
    for (const owner of [review, local]) for (const creature of creatures.filter(c => c.itemOrigin.ownerCharacterId === id)) {
      const cards = owner.inventory.companions.filter(c => c.creatureId === creature.id);
      assert.equal(cards.length, 1);
      const item = owner.inventory.items.find(i => i.id === cards[0].inventoryItemId);
      assert.equal(item.creatureId, creature.id); assert.equal(item.ownerCharacterId, owner.id);
      if (creature.name === 'Skarn') assert.equal(cards[0].status, 'Altersschwach');
    }
    if (slug === 'ylva') for (const owner of [review, local]) assert.equal(owner.inventory.companions.filter(c => c.creatureId === 'companion-ylva-freki').length, 1);
  }
  const freki = getBuiltinCreatureTemplates().find(c => c.id === 'companion-ylva-freki');
  assert.equal(freki.level, 4); assert.equal(freki.combatProfile.hitPoints.maximumOverride, 38);
});
