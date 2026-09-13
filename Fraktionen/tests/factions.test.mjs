import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { readFactionCatalog, validateFactionCatalog } from '../modules/catalog/faction-repository.mjs';
import { selectFactions } from '../modules/catalog/faction-model.mjs';
import { renderFactionPage } from '../modules/catalog/faction-template.mjs';
import { buildFactionHierarchy } from '../modules/catalog/faction-hierarchy.mjs';

const catalog = readFactionCatalog();
const entries = catalog.flatMap(category => category.entries);
const byId = new Map(entries.map(entry => [entry.id, entry]));
const json = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

test('all five supplied registers retain their records, provenance, ambiguous names and strike markings', () => {
  assert.deepEqual(catalog.map(category => [category.id, category.entries.length]), [
    ['gilden', 94], ['orden', 41], ['organisationen', 42], ['dunkle-gilden', 19], ['kulte', 28],
  ]);
  for (const source of json('../docs/import-manifest.json')) {
    const original = readFileSync(new URL(`../${source.file}`, import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'), source.sha256);
    const imported = entries.filter(entry => entry.source.document === source.file);
    assert.equal(imported.length, source.importedEntries);
    assert.equal(new Set(imported.map(entry => `${entry.source.row}:${entry.source.column}`)).size, imported.length);
  }
  for (const id of ['wintersonne', 'runenkrieger', 'ost-kaiserliche-handelsgilde', 'daemmerwacht-12']) assert.equal(byId.get(id).status, 'struck');
  assert.equal(entries.filter(entry => entry.status === 'unnamed').length, 2);
  assert.equal(byId.get('musen-der-maid').source.href, 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=531');
  assert.equal(byId.get('erben-des-ersten-schwurs').source.href, 'https://www.animexx.de/zirkel/ichbinreiter/tafel/?seite=2442');
  assert.notEqual(byId.get('hetaeren-der-lytheris').source.href, byId.get('hetaeren-der-lytheris-1400').source.href);
  assert.notEqual(byId.get('mardrans-contubernium').source.href, byId.get('mardrans-contubernium-724').source.href);
});

test('supervisory bodies and subordinate banners remain explicit, without putting cults under a guild', () => {
  for (const [id, parentId] of Object.entries({
    'die-beobachter': 'wolken-der-daemmerung', 'markt-der-fortuna': 'wolken-der-daemmerung',
    'mariels-gabe': 'markt-der-fortuna', 'geeinte-haende': 'markt-der-fortuna',
    'formwandler': 'musen-der-maid', 'narrenzunft': 'musen-der-maid',
    'eidbrecher': 'loge-der-daemmerung', 'blutsegel-marodeure': 'loge-der-daemmerung',
    'sirenenzahn': 'blutsegel-marodeure', 'sanktoren-orden': 'die-alerische-kirche',
    'die-hainsprecher': 'erben-des-ersten-schwurs', 'balthors-soehne': 'der-schwanen-orden',
    'sturmrufer': 'die-blauschwingen', 'blauschwingen': 'die-blauschwingen',
  })) assert.equal(byId.get(id).parentId, parentId, id);
  assert.ok(catalog.find(category => category.id === 'kulte').entries.every(entry => entry.parentId === null));
  assert.equal(byId.get('die-erben-der-morgenroete').affiliations[0].entryId, 'daemmerwacht');
  assert.equal(byId.get('kammer-der-fuersten').categoryId, 'organisationen');
  assert.equal(byId.get('kammer-der-fuersten').affiliations[0].entryId, 'fianna');
  assert.equal(byId.get('die-alerische-kirche').href, '../Religionen/religionen/alerische-kirche/index.html');
});

test('all nineteen infernal deities have cults using the canonical deity symbols and lore links', () => {
  const cults = catalog.find(category => category.id === 'kulte');
  const infernal = json('../../Religionen/data/infernaler-kreis.json');
  const deityIds = infernal.groups.filter(group => ['infernale', 'untergoetter'].includes(group.id))
    .flatMap(group => group.entries.map(path => path.split('/').at(-2)));
  assert.deepEqual(new Set(cults.groups.map(group => group.deityId).filter(Boolean)), new Set(deityIds));
  for (const group of cults.groups.filter(group => group.deityId)) {
    assert.ok(group.deity.symbol.startsWith('../Religionen/assets/infernal-icons/'));
    assert.ok(cults.entries.some(entry => entry.groupId === group.id));
  }
  assert.equal(cults.entries.filter(entry => entry.source.kind === 'user-directed-addition').length, 11);
  for (const image of json('../assets/emblem-sources.json')) {
    assert.ok(!image.error, image.id);
    assert.ok(readFileSync(new URL(`../${image.file}`, import.meta.url)).byteLength > 100, image.id);
  }
});

test('guild families, order branches and banners share their parent bundle without duplicating entries', () => {
  const nodes = new Map();
  const collect = groups => groups.forEach(group => group.nodes.forEach(node => {
    assert.ok(!nodes.has(node.entry.id), `Doppelter Eintrag: ${node.entry.id}`);
    nodes.set(node.entry.id, node);
    collect(node.groups);
  }));
  const original = JSON.stringify(catalog);
  catalog.forEach(category => {
    const groups = buildFactionHierarchy(category);
    assert.equal(groups.reduce((sum, group) => sum + group.size, 0), category.entries.length);
    collect(groups);
  });
  assert.equal(nodes.size, 224);
  assert.equal(JSON.stringify(catalog), original);
  const directChildren = id => nodes.get(id).groups.flatMap(group => group.nodes.map(node => node.entry.id));
  assert.deepEqual(directChildren('markt-der-fortuna'), ['mariels-gabe', 'geeinte-haende']);
  assert.ok(directChildren('wolken-der-daemmerung').includes('markt-der-fortuna'));
  assert.ok(!directChildren('wolken-der-daemmerung').includes('mariels-gabe'));
  assert.deepEqual(directChildren('blutsegel-marodeure'), ['klauen-des-leviathan', 'schwarzblut-marodeure', 'sirenenzahn']);
  assert.equal(directChildren('musen-der-maid').length, 7);
  assert.equal(directChildren('der-schwanen-orden').length, 6);
  assert.equal(directChildren('die-blauschwingen').length, 6);
  assert.equal(nodes.get('die-erben-der-morgenroete').groups.length, 0);
});

test('the hierarchy validator rejects missing parents, circular affiliations of command and duplicate IDs', () => {
  const broken = structuredClone(catalog);
  broken[0].entries[0].parentId = 'does-not-exist';
  assert.throws(() => validateFactionCatalog(broken), /Übergeordnete Fraktion fehlt/);
  broken[0].entries[0].parentId = 'die-beobachter';
  assert.throws(() => validateFactionCatalog(broken), /Zyklische/);
  broken[0].entries[0].parentId = null;
  broken[0].entries[1].id = broken[0].entries[0].id;
  assert.throws(() => validateFactionCatalog(broken), /doppelte Fraktions-ID/);
});

test('search preserves two levels of command as context and combines category, multiple terms and umlauts', () => {
  const sample = [
    { id: 'wolken', categoryId: 'gilden', search: 'Wolken der Dämmerung' },
    { id: 'fortuna', parentId: 'wolken', categoryId: 'gilden', search: 'Markt der Fortuna' },
    { id: 'mariel', parentId: 'fortuna', categoryId: 'gilden', search: 'Mariels Gabe Dämmerung' },
    { id: 'loge', categoryId: 'dunkle-gilden', search: 'Loge der Dämmerung' },
  ];
  let result = selectFactions(sample, { query: 'Gabe daemmerung', categoryId: 'gilden' });
  assert.deepEqual([...result.matches], ['mariel']);
  assert.deepEqual([...result.visible], ['mariel', 'fortuna', 'wolken']);
  result = selectFactions(sample, { query: 'DÄMMERUNG', categoryId: 'dunkle-gilden' });
  assert.deepEqual([...result.matches], ['loge']);
  assert.equal(selectFactions(sample, { query: 'kein-solcher-name' }).visible.size, 0);
  assert.equal(selectFactions(sample).matches.size, 4);
});

test('the generated document keeps all records accessible without JavaScript and resolves every fragment', () => {
  const html = renderFactionPage(catalog);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
  assert.equal((html.match(/data-faction-id=/g) || []).length, 224);
  assert.doesNotMatch(html, /\son(?:click|input|change|error)=/);
  assert.doesNotMatch(html, /<img[^>]+src="https?:/);
  assert.doesNotMatch(html, /animexx/i);
  assert.equal(readFileSync(new URL('../index.html', import.meta.url), 'utf8'), html);
});

test('Almanach navigation exposes one working faction link in place of the five former tabs', () => {
  let rendered = '';
  const source = readFileSync(new URL('../../AleriaAlmanach/modules/sidebar/sidebar-registers.js', import.meta.url), 'utf8');
  vm.runInNewContext(source, {
    escapeHtml: value => String(value),
    document: { querySelector: () => ({ set innerHTML(value) { rendered = value; } }) },
  });
  assert.match(rendered, /href="\.\.\/Fraktionen\/index\.html"/);
  assert.match(rendered, /Fraktionen\.svg/);
  assert.equal((rendered.match(/data-register-key="fraktionen"/g) || []).length, 1);
  assert.doesNotMatch(rendered, /data-register-key="(?:kulte|dunkle-gilden|organisationen|orden|gilden)"/);
});
