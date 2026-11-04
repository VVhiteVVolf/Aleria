import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { DRAIG_HOUSEHOLDS, DRAIG_WINGS } from '../modules/castell-draig-rooms/wing-households.mjs';
import { roomModuleId } from '../modules/castell-draig-rooms/wing-layout.mjs';

const moduleFiles = [
  'core/content-safety.js', 'core/app-core.js', 'module-store/module-store-tree.js',
  'modal/modal-controller.js', 'comments/comments-routing.js', 'archive/archive-view.js',
  'archive/archive-card-meta.js', 'archive/archive-hierarchy-browser.js', 'archive/archive-dashboard.js',
  'scene-transition/scene-transition-state.js', 'scene-transition/scene-transition-target-picker.js'
];
const sources = await Promise.all(moduleFiles.map(file => readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8')));
const plain = value => JSON.parse(JSON.stringify(value));
const roomPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', 'Castell Draig', 'Wohntrakte'];
const scene = (id, title, key = 'stable-room') => ({ id, title, multipage: true,
  pages: [{ sessionPage: true, pageTitle: title, commentThreadKey: key }] });

function harness(sections = []) {
  const context = vm.createContext({ URL, console,
    window: { location: { href: 'https://example.test/AleriaAlmanach/AleriaAlmanach.html' }, addEventListener() {} },
    document: { addEventListener() {}, querySelector() { return null; } },
    getValidSections: () => sections,
    getRenderableEntry: entry => entry
  });
  sources.forEach((source, index) => vm.runInContext(source, context, { filename: moduleFiles[index] }));
  return { context, sections,
    models: source => context.getSceneTransitionTargetModels(source),
    html(source = '', sourceEntryId = '') {
      return context.getSceneTransitionTargetModels(source)
        .map(model => context.renderSceneTransitionTargetNode(model.root, model, sourceEntryId, true)).join('');
    }
  };
}

function draigSections() {
  return DRAIG_WINGS.map(wing => ({ tab: 'Völker & Kulturen', key: wing.title,
    path: [...roomPath, wing.title], entries: DRAIG_HOUSEHOLDS.filter(room => room.wingId === wing.id)
      .map(room => scene(roomModuleId(room), room.title, `wohntrakte-${room.id}`)) }));
}

function imageSources(html) {
  return [...html.matchAll(/<img\b[^>]*\bsrc="([^"]*)"/g)].map(match => match[1]);
}

test('destination hierarchy reuses all six canonical Draig wings and their household scenes', () => {
  const { context, models, html } = harness(draigSections());
  const model = models()[0];
  assert.equal(model.tab, 'Völker & Kulturen');
  const residential = context.findArchiveHierarchyNode(model.root, roomPath);
  assert.deepEqual(new Set(residential.children.map(node => node.label)), new Set(DRAIG_WINGS.map(wing => wing.title)));
  assert.equal(residential.entries.length, DRAIG_HOUSEHOLDS.length);
  const output = html();
  for (const wing of DRAIG_WINGS) assert.ok(output.includes(wing.title), wing.title);
  for (const room of DRAIG_HOUSEHOLDS) assert.ok(output.includes(room.title), room.title);
  const gawain = context.getSceneTransitionCatalog().find(row => row.entry.id === 'modul-1781470059057');
  assert.equal(gawain.endpoint.threadId, 'modul-1781470059057::session:wohntrakte-gawain');
  assert.ok(context.getSceneTransitionTargetPath(gawain).includes('Castell Draig > Wohntrakte > Grafenflügel'));
});

test('current source is excluded while another scene in the same module stays selectable', () => {
  const entry = scene('palace', 'Palast', 'throne');
  entry.pages.push({ sessionPage: true, pageTitle: 'Gemach', commentThreadKey: 'chamber' });
  const { context, html } = harness([{ tab: 'Orte', key: 'Burg', path: ['Burg'], entries: [entry] }]);
  const output = html('palace::session:throne', 'palace');
  assert.doesNotMatch(output, /data-transition-thread-id="palace::session:throne"/);
  assert.match(output, /data-transition-thread-id="palace::session:chamber"/);
  assert.equal((output.match(/data-scene-transition-action="select-target"/g) || []).length, 1);
  assert.equal(context.getSceneTransitionEndpoints().length, 2);
  assert.match(output, /scene-transition-target-group" open/);
});

test('destinations respect the same interaction opt-outs as the comments router', () => {
  const entry = scene('palace', 'Palast', 'open');
  entry.pages.push(
    { sessionPage: true, enableComments: false, pageTitle: 'Geschlossen', commentThreadKey: 'closed' },
    { sessionPage: true, biographyPage: true, pageTitle: 'Biografie', commentThreadKey: 'bio' },
    { sessionPage: true, _commentsPage: true, pageTitle: 'Diskussion', commentThreadKey: 'discussion' }
  );
  const { context } = harness([{ tab: 'Orte', key: 'Burg', entries: [entry] }]);
  assert.deepEqual(Array.from(context.getSceneTransitionEndpoints(), endpoint => endpoint.threadId), ['palace::session:open']);
});

test('source-only sections, lore-only siblings and entire tabs without destinations are not rendered', () => {
  const { models, html } = harness([
    { tab: 'Orte', key: 'Quelle allein', path: ['Quelle allein'], entries: [scene('source', 'Ursprung')] },
    { tab: 'Orte', key: 'Leere Rubrik', path: ['Leere Rubrik'], entries: [] },
    { tab: 'Orte', key: 'Nur Wissen', path: ['Nur Wissen'], entries: [{ id: 'lore', title: 'Historie', multipage: true, pages: [{ description: 'Text' }] }] },
    { tab: 'Orte', key: 'Ziel', path: ['Ziel'], entries: [scene('target', 'Zielszene')] },
    { tab: 'Ganz leer', key: 'Ganz leer', entries: [] }
  ]);
  assert.equal(models('source::session:stable-room').length, 1);
  const output = html('source::session:stable-room');
  for (const omitted of ['Quelle allein', 'Leere Rubrik', 'Nur Wissen', 'Ganz leer', 'Historie']) assert.ok(!output.includes(omitted), omitted);
  assert.match(output, /Zielszene/);
  assert.equal((output.match(/data-scene-transition-action="select-target"/g) || []).length, 1);
});

test('moving and renaming a hierarchy node updates paths without changing the scene thread', () => {
  const entry = scene('guest-room', 'Quartier', 'permanent-key');
  const section = { tab: 'Orte', key: 'alter Anzeigename', nodeId: 'room-node', path: ['veralteter Pfad'], entries: [entry] };
  const { context, html } = harness([section]);
  context.nextNodes = [
    { id: 'root', tab: 'Orte', title: 'Orte', parentId: '' },
    { id: 'castle', tab: 'Orte', title: 'Castell Draig', parentId: 'root' },
    { id: 'residence', tab: 'Orte', title: 'Wohntrakte', parentId: 'castle' },
    { id: 'room-node', tab: 'Orte', title: 'Gästeflügel', parentId: 'residence' },
    { id: 'annex', tab: 'Orte', title: 'Neuer Anbau', parentId: 'castle' }
  ];
  vm.runInContext('_moduleSectionNodes = nextNodes;', context);
  assert.match(html(), /Castell Draig &gt; Wohntrakte &gt; Gästeflügel/);
  const before = plain(context.getSceneTransitionEndpoints());
  context.nextNodes.find(node => node.id === 'room-node').title = 'Besuchsflügel';
  context.nextNodes.find(node => node.id === 'room-node').parentId = 'annex';
  const output = html();
  assert.match(output, /Castell Draig &gt; Neuer Anbau &gt; Besuchsflügel/);
  assert.doesNotMatch(output, /veralteter Pfad|Gästeflügel|Wohntrakte/);
  assert.deepEqual(plain(context.getSceneTransitionEndpoints()), before);
});

test('duplicate section membership and duplicate page keys yield exactly one target per thread', () => {
  const entry = scene('shared', 'Gemeinsame Szene', 'named-key');
  entry.pages.push({ sessionPage: true, pageTitle: 'Doppelter Import', commentThreadKey: 'named-key' });
  const { context, html } = harness([
    { tab: 'Orte', key: 'Original', path: ['Original'], entries: [entry] },
    { tab: 'Orte', key: 'Doppelte Ablage', path: ['Doppelte Ablage'], entries: [entry] }
  ]);
  assert.deepEqual(plain(context.getSceneTransitionEndpoints()), [{
    threadId: 'shared::session:named-key', entryId: 'shared', entryTitle: 'Gemeinsame Szene', pageTitle: 'Gemeinsame Szene'
  }]);
  const output = html();
  assert.equal((output.match(/data-transition-thread-id=/g) || []).length, 1);
  assert.doesNotMatch(output, /Doppelte Ablage|Doppelter Import/);
});

test('named threads survive page reorder and metadata never leaks into persisted endpoints', () => {
  const entry = scene('rooms', 'Wohntrakt', 'gawain');
  entry.pages.push({ sessionPage: true, pageTitle: 'Idwal', commentThreadKey: 'idwal' });
  const { context } = harness([{ tab: 'Orte', key: 'Burg', path: ['Burg'], iconUrl: './icon.png', entries: [entry] }]);
  const before = plain(context.getSceneTransitionEndpoints()).sort((a, b) => a.threadId.localeCompare(b.threadId));
  entry.pages.reverse();
  const after = plain(context.getSceneTransitionEndpoints()).sort((a, b) => a.threadId.localeCompare(b.threadId));
  assert.deepEqual(after, before);
  for (const endpoint of after) assert.deepEqual(Object.keys(endpoint).sort(), ['entryId', 'entryTitle', 'pageTitle', 'threadId']);
  const row = context.getSceneTransitionCatalog()[0];
  const persisted = context.normalizeSceneTransition({ source: { ...row.endpoint, section: row.section, page: row.page }, target: after[0] });
  assert.equal(persisted.source.threadId, row.endpoint.threadId);
  assert.ok(!('section' in persisted.source));
  assert.ok(!('section' in persisted.target));
  assert.ok(!('page' in persisted.target));
});

test('page-specific imagery wins and fallback previews preserve URL query parameters exactly once', () => {
  const pageUrl = 'https://example.test/page.png?alt=media&token=page';
  const fallbackUrl = 'https://example.test/preview.png?alt=media&token=preview';
  const entry = scene('images', 'Bildszene');
  entry.previewImage = fallbackUrl;
  entry.pages[0].image = pageUrl;
  const { context } = harness([{ tab: 'Orte', key: 'Burg', entries: [entry] }]);
  let row = context.getSceneTransitionCatalog()[0];
  assert.deepEqual(imageSources(context.renderSceneTransitionTargetOption(row)), [pageUrl.replaceAll('&', '&amp;')]);
  delete entry.pages[0].image;
  row = context.getSceneTransitionCatalog()[0];
  const output = context.renderSceneTransitionTargetOption(row);
  assert.deepEqual(imageSources(output), [fallbackUrl.replaceAll('&', '&amp;')]);
  assert.doesNotMatch(output, /&amp;amp;/);
});

test('scene labels, paths, thread attributes and unsafe images cannot inject markup', () => {
  const entry = scene('scene" autofocus="true', '<script>Bad</script>', 'key" onclick="bad');
  entry.icon = '<img onerror="bad">';
  entry.image = 'javascript:alert(1)';
  entry.pages[0].image = 'data:image/svg+xml,<svg onload=alert(1)>';
  const { context, html } = harness([{ tab: 'Orte', key: '<b>Rubrik</b>', path: ['<b>Rubrik</b>'], entries: [entry] }]);
  const row = context.getSceneTransitionCatalog()[0];
  const output = context.renderSceneTransitionTargetOption(row);
  assert.deepEqual(imageSources(output), []);
  assert.match(output, /&lt;script&gt;Bad&lt;\/script&gt;/);
  assert.match(output, /&lt;b&gt;Rubrik&lt;\/b&gt;/);
  assert.doesNotMatch(output, /<script>|<b>Rubrik|"\s+(?:onclick|onerror|autofocus)=/);
  assert.doesNotMatch(html(), /<script>|<img onerror|"\s+(?:onclick|onerror|autofocus)=/);
});

test('quoted HTTP image URLs remain one safe attribute for scene and category icons', () => {
  const url = 'https://example.test/image.png?token=x" onerror="alert(1)&size=small';
  const { context } = harness();
  const output = context.renderSceneTransitionPlaceIcon(url);
  assert.deepEqual(imageSources(output), ['https://example.test/image.png?token=x&quot; onerror=&quot;alert(1)&amp;size=small']);
  assert.doesNotMatch(output, /"\s+onerror=/);
});

function filterFixture(context) {
  const first = { dataset: { targetSearch: context.normalizeSearchText('Castell Draig Grafenflügel Gemach Gawain') }, hidden: false };
  const second = { dataset: { targetSearch: context.normalizeSearchText('Castell Draig Odyars Familienflügel Gemach Tegan') }, hidden: false };
  const group = (buttons, open) => ({ dataset: {}, open, hidden: false,
    querySelector: () => buttons.find(button => !button.hidden) || null });
  const groups = [group([first, second], true), group([first], false), group([second], true)];
  const count = { textContent: '' };
  const empty = { hidden: true };
  const scope = {
    querySelectorAll: selector => selector === '[data-target-search]' ? [first, second] : groups,
    querySelector: selector => selector === '[data-scene-transition-target-count]' ? count
      : selector === '[data-scene-transition-target-empty]' ? empty : null
  };
  const input = { value: '', closest: () => scope };
  return { first, second, groups, count, empty, input };
}

test('search matches multiple terms across the full hierarchy and restores folder expansion', () => {
  const { context } = harness();
  const fixture = filterFixture(context);
  fixture.input.value = 'gawain GRAFENFLÜGEL';
  context.filterSceneTransitionTargets(fixture.input);
  assert.equal(fixture.first.hidden, false);
  assert.equal(fixture.second.hidden, true);
  assert.equal(fixture.groups[1].open, true);
  assert.equal(fixture.groups[2].hidden, true);
  assert.equal(fixture.count.textContent, '1 Szene gefunden');
  fixture.input.value = '';
  context.filterSceneTransitionTargets(fixture.input);
  assert.deepEqual(fixture.groups.map(group => group.open), [true, false, true]);
  assert.ok(fixture.groups.every(group => !group.hidden && !('beforeSearch' in group.dataset)));
  assert.equal(fixture.count.textContent, '2 Szenen verfügbar');
});

test('search without matches hides empty groups and exposes the empty-state message', () => {
  const { context } = harness();
  const fixture = filterFixture(context);
  fixture.input.value = 'unbekanntes-gemach';
  context.filterSceneTransitionTargets(fixture.input);
  assert.ok(fixture.first.hidden && fixture.second.hidden);
  assert.ok(fixture.groups.every(group => group.hidden));
  assert.equal(fixture.empty.hidden, false);
  assert.equal(fixture.count.textContent, '0 Szenen gefunden');
});
