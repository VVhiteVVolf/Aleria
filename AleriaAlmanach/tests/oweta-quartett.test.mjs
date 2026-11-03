import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildOwetaQuartet, OWETA_QUARTET_ID, OWETA_QUARTET_IMAGE, OWETA_QUARTET_SCENE_THREAD } from '../modules/oweta-quartett/oweta-quartett-module.mjs';
import { OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS, OWETA_QUARTET_STARTER_STOCK } from '../modules/oweta-quartett/oweta-quartett-data.mjs';
import { collectGroupRoster, resolveGroupRoster } from '../modules/landing/group-landing-roster.js';
import { migrateGroupLandingEntry } from '../modules/landing/group-landing-migration.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

test('the quartet has one leader and exactly three equally ranked companions linked to existing characters', () => {
  const entry = buildOwetaQuartet();
  const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
  assert.deepEqual(hierarchy.trees[0].levels.map(level => level.nodes.length), [1, 3]);
  assert.equal(hierarchy.trees[0].levels[0].nodes[0].subtitle, 'Oweta Draig');
  assert.deepEqual(hierarchy.trees[0].levels[1].nodes.map(node => node.subtitle), ['Rianna Wyrm', 'Lefraye Gafyr', 'Caralyn Chwedonol']);
  const group = entry.pages.find(page => page.landingPage).landing.group;
  const roster = resolveGroupRoster(entry, group, OWETA_QUARTET_MEMBERS);
  assert.deepEqual(roster.filter(row => row.kind === 'character').map(row => row.characterId), OWETA_QUARTET_MEMBERS.map(row => row.id));
  assert.equal(collectGroupRoster(entry).length, 4);
  assert.ok(roster.every(row => row.assignment === 'active'));
  assert.deepEqual(migrateGroupLandingEntry(entry, { tab: 'Gruppen' }), entry);
  assert.equal(group.threadId, OWETA_QUARTET_SCENE_THREAD);
  assert.deepEqual(group.sceneThreads, [OWETA_QUARTET_SCENE_THREAD]);
});

test('six existing animals retain personal ownership; the goldfish and unbound placeholders cannot enter automatically', () => {
  const entry = buildOwetaQuartet();
  const group = entry.pages.find(page => page.landingPage).landing.group;
  const catalog = getBuiltinCreatureTemplates();
  assert.equal(group.includeCompanions, false);
  assert.equal(group.guests.length, 6);
  for (const animal of OWETA_QUARTET_COMPANIONS) {
    const creature = catalog.find(row => row.id === animal.id);
    assert.ok(creature, animal.id);
    assert.equal(creature.itemOrigin.ownerCharacterId, animal.ownerId);
    assert.ok(creature.bestiaryReference?.id, `${animal.name}: actual Bestiarium link`);
  }
  const roster = resolveGroupRoster(entry, group, OWETA_QUARTET_MEMBERS, catalog);
  assert.equal(roster.length, 10);
  assert.deepEqual(roster.filter(row => row.kind === 'creature').map(row => row.creatureId), OWETA_QUARTET_COMPANIONS.map(row => row.id));
  assert.ok(!JSON.stringify(entry).match(/Blubbrigkeit|Goldfisch|Treuer Begleiter/));
  assert.deepEqual(group.inventory, [], 'personal animals and authoritative starter stock are not duplicated in the manual stock list');
  assert.equal(group.treasury.openingCopper, null, 'no invented group money');
});

test('the starter supply uses available standard goods and provides three days of rations for four people', () => {
  const standards = new Map(STANDARD_ITEMS.map(item => [item.id, item]));
  assert.equal(new Set(OWETA_QUARTET_STARTER_STOCK.map(item => item.sourceKey)).size, OWETA_QUARTET_STARTER_STOCK.length);
  for (const stock of OWETA_QUARTET_STARTER_STOCK) {
    const item = standards.get(stock.sourceKey);
    assert.ok(item && !item.archived, stock.sourceKey);
    assert.ok(Number.isSafeInteger(stock.quantity) && stock.quantity > 0);
    assert.equal(item.section, 'standard');
    assert.ok(!item.combatDefinition, 'starter goods do not grant combat equipment');
  }
  assert.equal(OWETA_QUARTET_STARTER_STOCK.find(item => item.key === 'rationen').quantity, 12);
  assert.equal(OWETA_QUARTET_STARTER_STOCK.find(item => item.key === 'essbesteck').quantity, 4);
  assert.equal(OWETA_QUARTET_STARTER_STOCK.find(item => item.key === 'zelt-klein').quantity, 2);
});

test('the static archive seed is repeatable and image overrides reach every scene and folio cover', async () => {
  const code = await readFile(new URL('../modules/oweta-quartett/oweta-quartett-data.js', import.meta.url), 'utf8');
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(code, context); vm.runInContext(code, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.filter(entry => entry.id === OWETA_QUARTET_ID).length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(context.SECTIONS[0].entries[0])), buildOwetaQuartet());
  const image = 'https://example.invalid/oweta-mittagsrast.png';
  const entry = buildOwetaQuartet({ image });
  assert.equal(entry.image, image); assert.equal(entry.previewImage, image);
  assert.equal(entry.pages.find(page => page.landingPage).landing.coverImage, image);
  assert.ok(entry.pages.filter(page => page.image).every(page => page.image === image));
  assert.ok(!JSON.stringify(entry).includes(OWETA_QUARTET_IMAGE));
  for (const member of OWETA_QUARTET_MEMBERS) await access(new URL(`../..${member.portrait}`, import.meta.url));
});

test('the actual hierarchy normalizer and renderer keep the quartet free of unrelated template defaults', async () => {
  const context = vm.createContext({ document: { addEventListener() {} }, escapeHtml: value => String(value ?? ''),
    sanitizeImageSrc: value => String(value || ''), sanitizeContentHtml: value => String(value || ''),
    buildNav: () => '', getInlineCommentThreadForPage: () => '' });
  for (const file of ['module-editor/module-editor-data', 'hierarchy/hierarchy-renderer']) {
    vm.runInContext(await readFile(new URL(`../modules/${file}.js`, import.meta.url), 'utf8'), context);
  }
  const entry = buildOwetaQuartet(), page = entry.pages.find(row => row.hierarchyPage);
  const clean = context.sanitizeHierarchyData(page.hierarchy);
  assert.deepEqual(JSON.parse(JSON.stringify(clean.trees[0].levels.map(level => level.nodes.length))), [1, 3]);
  const rendered = context.buildHierarchyPage(page, entry, 1, 4);
  assert.equal((rendered.match(/class="hierarchy-node-card"/g) || []).length, 4);
  assert.match(rendered, /Gemeinsam unterwegs/);
  assert.doesNotMatch(rendered, /Wahrheitswaage|Wissen\. Gerechtigkeit\. Balance\./);
});
