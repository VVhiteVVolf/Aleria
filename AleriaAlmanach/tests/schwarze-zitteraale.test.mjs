import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { buildZitteraaleModule } from '../modules/schwarze-zitteraale/zitteraale-module.mjs';
import { ZITTERAALE_LEADERS, ZITTERAALE_DEPUTIES, ZITTERAALE_GROUPS } from '../modules/schwarze-zitteraale/zitteraale-people.mjs';
import { buildZitteraaleGroupModules, ZITTERAALE_GROUP_SECTION_PATH } from '../modules/schwarze-zitteraale/zitteraale-group-modules.mjs';
import { buildZitteraaleCharacters, buildZitteraalInventory, ZUNDER_CREATURE_ID } from '../modules/schwarze-zitteraale/zitteraale-characters.mjs';
import { buildMedrawdBiography, buildMedrawdCharacterExport, MEDRAWD_ID } from '../modules/schwarze-zitteraale/medrawd-angau.mjs';
import { projectZitteraaleCharacterUpdates } from '../modules/schwarze-zitteraale/zitteraale-character-updates.mjs';
import { upgradeZitteraaleEntry } from '../modules/schwarze-zitteraale/zitteraale-migration.mjs';
import { ZITTERAAL_ZUNDER } from '../modules/creatures/catalog/zitteraal-zunder.js';
import { mergeCharacterExportAssignments } from '../../CharakterDatenbank/lib/character-export-assignments.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import online from '../modules/schwarze-zitteraale/sources/module-online-20261116.json' with { type: 'json' };

const read = file => readFile(new URL(file, import.meta.url), 'utf8');
const entry = buildZitteraaleModule();
const groups = buildZitteraaleGroupModules();
const all = [entry, ...groups];

test('the retained dossiers keep their identities and bounties while the removed dossier disappears', () => {
  assert.equal(entry.pages.length, 8);
  assert.deepEqual(ZITTERAALE_LEADERS.map(person => person.bountyCopper), [35000, 13000, 11000, 5000]);
  assert.deepEqual(ZITTERAALE_DEPUTIES.map(person => person.id), ['schlickzahn', 'donnerkiefer']);
  assert.deepEqual(ZITTERAALE_LEADERS.map(person => person.name), ['Der Schwarze Zitteraal', 'Der Schinder', 'Llineth', 'Der Eidlose']);
  const dossiers = entry.pages.filter(page => page.bountyFilePage);
  assert.equal(dossiers.length, 4);
  for (const [index, page] of dossiers.entries()) {
    assert.equal(page.commentThreadKey, `zitteraale-akte-${ZITTERAALE_LEADERS[index].id}`);
    assert.equal(page.bountyFile.portraitImage, ZITTERAALE_LEADERS[index].sketch);
    assert.equal(page.bountyFile.bountyCurrency, 'Goldtaler');
    assert.doesNotMatch(JSON.stringify(page), /\/portraits\//);
  }
  assert(!entry.sessionCast.includes('zitteraale-netznadel'));
  assert(!entry.pages.some(page => page.commentThreadKey === 'zitteraale-akte-netznadel'));
  assert.doesNotMatch(JSON.stringify(entry), /"(?:title|targetName|archiveTitle)":"(?:Schlickzahn|Donnerkiefer|Nachtkieme|Netznadel)"/);
});

test('the main hierarchy presents two deputies, eight group leaders and eight linked banners', () => {
  const trees = entry.pages.find(page => page.hierarchyPage).hierarchy.trees;
  assert.deepEqual(trees[0].levels.map(level => level.nodes.length), [1, 2, 8]);
  assert.equal(trees[0].levels[2].columns, 4);
  assert.equal(trees[1].label, 'Gruppen');
  assert.equal(trees[1].levels[0].columns, 4);
  assert.equal(trees[1].levels[0].nodes.length, 8);
  for (const [index, node] of trees[1].levels[0].nodes.entries()) {
    assert.equal(node.portrait, ZITTERAALE_GROUPS[index].banner);
    assert(node.text.includes(`?entry=${groups[index].id}`));
  }
  assert.equal(trees[2].levels[0].nodes[0].title, 'Llineth');
});

test('every subgroup has its own four-page module and independent headquarters thread', () => {
  assert.equal(groups.length, 8);
  assert.equal(groups[0].title, 'Die Untoten Aale');
  assert.deepEqual(groups.slice(1).map(group => group.title), ['Gruppe II.', 'Gruppe III.', 'Gruppe IV.', 'Gruppe V.', 'Gruppe VI.', 'Gruppe VII.', 'Gruppe VIII.']);
  const threads = [];
  for (const module of groups) {
    assert.equal(module.pages.length, 4);
    assert(module.pages[1].biographyPage);
    assert(module.pages[2].hierarchyPage);
    assert(module.pages[3].sessionPage);
    assert.equal(module.pages[3].sessionLocation, '');
    assert.deepEqual(module.pages[3].sessionDateAleria, { year: null, month: null, day: null });
    threads.push(module.pages[3].commentThreadKey);
  }
  assert.equal(new Set(threads).size, 8);
  assert(!threads.includes(entry.pages.at(-1).commentThreadKey));
});

test('each group has sixteen raiders, eight deceased places and four former places with no truncation', async () => {
  const context = vm.createContext({ document: { addEventListener() {} } });
  vm.runInContext(await read('../modules/module-editor/module-editor-data.js'), context);
  for (const group of groups) {
    const hierarchy = group.pages[2].hierarchy;
    const normalized = JSON.parse(JSON.stringify(context.sanitizeHierarchyData(hierarchy)));
    assert.deepEqual(normalized.trees[0].levels.map(level => level.nodes.length), [1, 2, 4, 4, 4, 4]);
    assert(normalized.trees[0].levels.slice(2).every(level => level.columns === 4));
    assert.equal(normalized.trees[1].levels[0].nodes.length, 8);
    assert.equal(normalized.trees[1].levels[0].columns, 4);
    assert.equal(normalized.trees[2].levels[0].nodes.length, 4);
    assert.equal(normalized.trees[2].levels[0].columns, 4);
  }
});

test('current lieutenants and the historical first and second lieutenants remain separate', () => {
  const trees = groups[0].pages[2].hierarchy.trees;
  const live = trees[0].levels[1].nodes;
  assert.match(live[0].portrait, /leutnant-1-v2/);
  assert.match(live[1].portrait, /leutnant-2-v3/);
  assert.match(live[1].title, /Leutnantin/);
  assert(!JSON.stringify(live).includes('Rhodri'));
  const deceased = trees[1].levels[0].nodes;
  assert(deceased.some(node => node.title === 'Brychan'));
  assert(deceased.some(node => node.title === 'Tegid'));
  assert(deceased.some(node => /Erster Leutnant/.test(node.title) && /Rhys Draig/.test(node.subtitle)));
  assert.equal(trees[2].levels[0].nodes[0].title, 'Rhodri');
  assert.match(trees[2].levels[0].nodes[0].subtitle, /zweiter Leutnant/);
});

test('the final group name, old age, territories and corrected attack account reach the page and character bio', () => {
  const text = JSON.stringify([groups[0], buildMedrawdCharacterExport()]);
  assert.match(text, /ältesten Unterbanden/);
  assert.doesNotMatch(text, /Untoten Aele|junge Unterbande|vergleichsweise jung/);
  for (const place of ['Bronhir', 'Llysfaen', 'Craithglyn', 'Mwyncreig', 'Tŵr Rhewgorn', 'Gwynthor']) assert(text.includes(place), place);
  for (const fact of ['Patriarch', 'Kharon', 'Hela', 'Huw Saethwyr', 'Medrawd war', 'Rekruten', 'abwesend', 'Nekromantie']) assert(text.includes(fact), fact);
  const bio = buildMedrawdBiography();
  assert(bio.stats.some(row => row.includes('Etwa 50 Jahre')));
  assert(bio.stats.some(row => row.includes('Etwa 34 Jahre')));
  assert.match(bio.biography.historyText, /Ohr teilweise zerstört/);
  assert.match(bio.biography.portrait, /medrawd-angau-v3/);
  assert(!('inventory' in buildMedrawdCharacterExport().character));
});

test('the regrouping keeps the existing headquarters scene and extra edited pages and is idempotent', () => {
  const previous = structuredClone(online);
  const oldScene = previous.pages.find(page => page.sessionPage);
  oldScene.sessionIntro = 'Bearbeitete Ruinenszene';
  previous.pages.push({ pageTitle: 'Eigene Zusatzseite', commentThreadKey: 'user-extra' });
  const next = upgradeZitteraaleEntry(previous, entry);
  assert.equal(next.pages.find(page => page.sessionPage).sessionIntro, 'Bearbeitete Ruinenszene');
  assert.equal(next.pages.find(page => page.sessionPage).commentThreadKey, oldScene.commentThreadKey);
  assert(next.pages.some(page => page.commentThreadKey === 'user-extra'));
  assert(!next.pages.some(page => page.commentThreadKey === 'zitteraale-akte-netznadel'));
  assert.deepEqual(next.pages.find(page => page.hierarchyPage).hierarchy, entry.pages[2].hierarchy);
  assert.equal(upgradeZitteraaleEntry(next, entry), next);
  assert.equal(online.pages.length, 9);
  const old = { ...online, zitteraaleRevision: '20261021-bandenakte-v1', pages: [...online.pages, { pageTitle: 'Legacy' }] };
  assert.equal(upgradeZitteraaleEntry(old, entry).pages.length, 8);
  const unrelated = { id: 'another-module' };
  assert.equal(upgradeZitteraaleEntry(unrelated, entry), unrelated);
});

test('normal built-in registration creates the nested group category and unique module identities', async () => {
  const context = vm.createContext({ SECTIONS: [{ key: 'Kriminalität', tab: 'Kriminalität', path: [], entries: [online] }], structuredClone });
  vm.runInContext(await read('../modules/schwarze-zitteraale/zitteraale-data.js'), context);
  const modules = context.SECTIONS.flatMap(section => section.entries);
  assert.equal(modules.length, 9);
  assert.equal(new Set(modules.map(module => module.id)).size, 9);
  const groupSection = context.SECTIONS.find(section => JSON.stringify(section.path) === JSON.stringify(ZITTERAALE_GROUP_SECTION_PATH));
  assert.equal(groupSection.entries.length, 8);
  assert.equal(modules.find(module => module.id === entry.id).pages.length, 8);
});

test('limited name updates preserve inventories, combat state, local notes, classifications and unrelated people', async () => {
  const registry = JSON.parse(await read('../../CharakterDatenbank/registry.json'));
  const snapshot = JSON.parse(await read('../../CharakterDatenbank/generated/characters.snapshot.json'));
  const report = JSON.parse(await read('../../CharakterDatenbank/generated/sync-report.json'));
  const selected = new Set(ZITTERAALE_LEADERS.slice(1).map(person => person.characterId));
  const records = await Promise.all(registry.records.filter(row => selected.has(row.firestoreDocumentId))
    .map(async row => JSON.parse(await read(`../../CharakterDatenbank/${row.path}`))));
  for (const record of records) {
    record.local.notes = 'Must survive this editorial change';
    record.character.inventory = { sentinel: record.character.id };
    record.character.combatProfile = { revision: 712, health: 31 };
  }
  const result = projectZitteraaleCharacterUpdates({ registry, snapshot, report, records });
  for (const item of result.records) {
    const original = records.find(record => record.recordId === item.record.recordId);
    assert.deepEqual(item.record.character.inventory, original.character.inventory);
    assert.deepEqual(item.record.character.combatProfile, original.character.combatProfile);
    assert.deepEqual(item.record.local, original.local);
    assert.deepEqual(item.record.classification, original.classification);
  }
  for (const person of snapshot.characters.filter(person => !selected.has(person.id))) assert.deepEqual(result.snapshot.characters.find(current => current.id === person.id), person);
  const repeated = projectZitteraaleCharacterUpdates({ registry: result.registry, snapshot: result.snapshot, report: result.report, records: result.records.map(item => item.record) });
  assert.deepEqual(repeated, result);
});

test('the retained chief inventory and creature bindings continue to use the established identities', () => {
  const characters = buildZitteraaleCharacters();
  const tabs = mergeCharacterExportAssignments({ tabs: ['Alle'], map: {} }, characters.map(character => ({ character, assignedTab: 'Schwarze Zitteraale' })));
  assert.equal(buildCharacterDatabase({ characters, charTabs: tabs }, []).records.length, 4);
  const inventory = buildZitteraalInventory();
  assert.equal(inventory.items.length, 3);
  assert.equal(inventory.companions[0].creatureId, ZUNDER_CREATURE_ID);
  assert.equal(ZITTERAAL_ZUNDER.itemOrigin.inventoryItemId, inventory.companions[0].inventoryItemId);
  assert.equal(buildMedrawdCharacterExport().character.id, MEDRAWD_ID);
});

test('every active illustration exists and retains the generator bytes and 2:3 framing', async () => {
  const values = JSON.stringify([...all, buildMedrawdBiography(), buildZitteraalInventory()]);
  const paths = new Set([...values.matchAll(/\/((?:AleriaAlmanach|Stammbäume|IconOrdner)\/[^"<>]+\.(?:png|webp))/g)].map(match => decodeURI(match[1])));
  for (const path of paths) await access(new URL(`../../${path}`, import.meta.url));
  const art = JSON.parse(await read('../docs/art/zitteraale-groups-20261116/generation.json'));
  assert.equal(art.mode, 'built-in image_gen');
  assert.equal(art.jobs.filter(job => job.active).length, 27);
  for (const job of art.jobs) {
    const original = await readFile(new URL(`../../${job.original}`, import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'), job.sha256);
    assert.equal(job.width * 3, job.height * 2);
    if (job.active) assert(original.equals(await readFile(new URL(`../../${job.target}`, import.meta.url))));
  }
});
