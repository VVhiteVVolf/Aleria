import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildGwynthorCityPlaces, CITY_PLACES_SECTION } from '../modules/gwynthor-stadtorte/stadtorte-module.mjs';
import { GWYNTHOR_CITY_PLACES } from '../modules/gwynthor-stadtorte/stadtorte-scenes.mjs';
import { CITY_PLACES_ART_BRIEFS } from '../modules/gwynthor-stadtorte/stadtorte-art.mjs';
import { GWYNTHOR_CITY_PATH, projectGwynthorSections } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
import { buildGwynthorMarketplace } from '../modules/gwynthor-marktplatz/marketplace-module.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { SITE_BUILD_TASKS } from '../../netlify/build/site-build-tasks.mjs';
import { isReadOnlyValidationCommand, isCheckpointCommand } from '../../netlify/build/validation-commands.mjs';

const root = new URL('../../', import.meta.url);
const entries = buildGwynthorCityPlaces();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

test('release validation owns both scene checks and their source/asset dependencies', () => {
  const task = SITE_BUILD_TASKS.find(task => task.id === 'gwynthor-stadtorte');
  assert.ok(task);
  assert.ok(task.inputs.includes('AleriaAlmanach/modules/gwynthor-stadtorte/'));
  assert.ok(task.inputs.includes('AleriaAlmanach/public/assets/gwynthor-stadtorte/'));
  for (const command of task.commands) {
    assert.equal(isReadOnlyValidationCommand(command), true);
    assert.equal(isCheckpointCommand(command), true);
  }
});

test('the four existing places and three new places offer twenty independent city scenes', () => {
  assert.deepEqual(entries.map(entry => [entry.id, entry.pages.length]), [
    ['gwynthor-osttor', 3], ['gwynthor-westtor', 3], ['gwynthor-hafen', 3], ['gwynthor-stadtzentrum', 3],
    ['gwynthor-altstadt', 3], ['gwynthor-nordtor', 2], ['gwynthor-vorstadt', 3]
  ]);
  assert.deepEqual(CITY_PLACES_SECTION.path, GWYNTHOR_CITY_PATH);
  for (const entry of entries) {
    assert.equal(entry.appendCommentsPage, false);
    for (const page of entry.pages) {
      assert.equal(page.sessionPage, true);
      assert.match(page.sessionLocation, /^Gwynthor-Stadt · /);
      assert.ok(page.sessionIntro && page.sessionEmptyTitle && page.sessionHint);
      assert.deepEqual(page.sessionDateAleria, { year: null, month: null, day: null });
    }
  }
  assert.match(entries[2].pages[2].pageTitle, /Südtor-Hafen/);
  assert.match(entries[2].pages[2].sessionIntro, /Südosten/);
  assert.match(entries[3].pages[2].sessionIntro, /vor|Vor|Kathedrale/);
  assert.match(entries[4].pages[0].sessionIntro, /Bis zur Errichtung der Großen Kathedrale der Neun/);
  assert.match(entries[4].pages[1].sessionIntro, /Fundament/);
  assert.match(entries[5].pages[0].sessionIntro, /Cochllamwyr.*geschlossenen/s);
  assert.match(entries[6].pages[1].sessionIntro, /Fuhrleute und Kutscher der Gwyllach/);
  assert.match(entries[6].pages[2].sessionLocation, /Neben der Vorstadt/);
});

test('repeated registration preserves saved modules and the existing marketplace object', async () => {
  const source = await readFile(new URL('../modules/gwynthor-stadtorte/stadtorte-data.js', import.meta.url), 'utf8');
  const market = buildGwynthorMarketplace();
  const saved = { ...structuredClone(entries[0]), title: 'Eigener gespeicherter Titel' };
  const other = { id: 'unrelated-module', title: 'Unverändert' };
  for (const initial of [[], [{ ...CITY_PLACES_SECTION, entries: [market] }], [
    { tab: CITY_PLACES_SECTION.tab, path: ['Eigener alter Abschnitt'], entries: [saved, other] },
    { ...CITY_PLACES_SECTION, entries: [market] }
  ]]) {
    const context = vm.createContext({ SECTIONS: initial });
    vm.runInContext(source, context); vm.runInContext(source, context);
    const projected = projectGwynthorSections(context.SECTIONS);
    for (const entry of entries) {
      const found = projected.filter(section => section.entries.some(item => item.id === entry.id));
      assert.equal(found.length, 1);
      assert.deepEqual([...found[0].path], GWYNTHOR_CITY_PATH);
      assert.equal(found[0].entries.filter(item => item.id === entry.id).length, 1);
    }
    if (initial.some(section => section.entries.includes(other))) {
      assert.equal(projected.flatMap(section => section.entries).find(entry => entry.id === saved.id), saved);
      assert.equal(initial[0].entries[0], other);
    }
    if (initial.some(section => section.entries.includes(market))) {
      assert.equal(projected.flatMap(section => section.entries).find(entry => entry.id === market.id), market);
    }
  }
});

test('all twenty scene routes remain stable when places and pages are reordered; marketplace threads stay separate', async () => {
  const context = vm.createContext({
    getValidSections: () => [{ ...CITY_PLACES_SECTION, entries: [...entries, buildGwynthorMarketplace()] }],
    getRenderableEntry: value => value, getPages: value => value.pages
  });
  for (const file of ['comments/comments-routing.js', 'scene-transition/scene-transition-state.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8'), context);
  }
  const before = context.getSceneTransitionEndpoints();
  assert.equal(before.length, 28);
  assert.equal(new Set(before.map(endpoint => endpoint.threadId)).size, 28);
  const changed = structuredClone(entries).reverse();
  changed.forEach(entry => entry.pages.reverse());
  context.getValidSections = () => [{ ...CITY_PLACES_SECTION, entries: [...changed, buildGwynthorMarketplace()] }];
  const after = context.getSceneTransitionEndpoints();
  for (const endpoint of before) {
    assert.equal(after.find(item => item.entryId === endpoint.entryId && item.pageTitle === endpoint.pageTitle).threadId, endpoint.threadId);
    const location = context.parseCommentThreadLocation(endpoint.threadId);
    assert.equal(location.kind, 'session');
    assert.equal(location.baseEntryId, endpoint.entryId);
  }
});

test('all seven importable packages match runtime entries and the canonical city section', async () => {
  for (const entry of entries) {
    const date = GWYNTHOR_CITY_PLACES.find(place => place.id === entry.id).firstAuthoredOn || '2026-11-12';
    const exported = JSON.parse(await readFile(new URL(`Charakter Archiv Exporte/Module/Gwynthor Stadtorte/${entry.id}-${date}.json`, root), 'utf8'));
    assert.deepEqual(exported.module.entry, entry);
    assert.deepEqual(exported.module.section.path, GWYNTHOR_CITY_PATH);
  }
});

test('twenty artworks have exact provenance and superseded versions stay in the source archive', async () => {
  const results = JSON.parse(await readFile(new URL('AleriaAlmanach/assets/gwynthor-stadtorte/image-results.json', root), 'utf8'));
  assert.equal(results.images.length, 20);
  assert.equal(new Set(results.images.map(item => item.id)).size, results.images.length);
  for (const brief of CITY_PLACES_ART_BRIEFS) {
    const original = await readFile(new URL(brief.original, root));
    const active = await readFile(new URL(brief.destination, root));
    const result = results.images.find(item => item.id === brief.id);
    assert.equal(original.subarray(1, 4).toString(), 'PNG');
    assert.equal(original.readUInt32BE(16) * 3, original.readUInt32BE(20) * 2);
    assert.equal(active.subarray(0, 4).toString(), 'RIFF');
    assert.equal(active.subarray(8, 12).toString(), 'WEBP');
    assert.equal(sha256(original), result.originalSha256);
    assert.equal(sha256(active), result.sha256);
    assert.equal(sha256(brief.prompt), result.promptSha256);
    assert.equal(result.original, brief.original);
    assert.equal(result.file, brief.destination);
    assert.equal(shouldPublish(brief.destination), true);
    assert.equal(shouldPublish(brief.original), false);
    if (/^(osttor|westtor)-/.test(brief.id)) {
      assert.match(brief.prompt, /IMMER VOLLSTÄNDIG GESCHLOSSEN/);
      assert.match(brief.prompt, /COCHLLAMWYR/);
      assert.equal(shouldPublish(brief.references[0]), false);
      assert.ok((await readFile(new URL(brief.references[0], root))).length > 0);
      assert.match(entries.find(entry => entry.id === brief.moduleId).pages.find(page => page.commentThreadKey === `gwynthor-${brief.id}`).sessionIntro, /geschlossen/);
    }
    if (brief.id.startsWith('nordtor-')) {
      assert.match(brief.prompt, /vollständig geschlossen/);
      assert.match(brief.references.at(-1), /cochllamwyr-v1\.png$/);
    }
    if (brief.id === 'altstadt-burgplatz') {
      assert.equal(brief.version, 2);
      assert.equal(shouldPublish(brief.references[0]), false);
      assert.ok((await readFile(new URL(brief.references[0], root))).length > 0);
    }
  }
  assert.equal(shouldPublish('AleriaAlmanach/assets/gwynthor-stadtorte/image-prompts.json'), false);
  assert.equal(shouldPublish('AleriaAlmanach/modules/gwynthor-stadtorte/stadtorte-art.mjs'), false);
  assert.equal(shouldPublish('AleriaAlmanach/assets/gwynthor-stadtorte/image-results.json'), false);
});
