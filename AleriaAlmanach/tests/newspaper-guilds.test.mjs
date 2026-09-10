import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const guildFiles = ['celtigerns-echo', 'schwarzbote', 'kronenspiegel', 'fluesterfaecher', 'waffengang', 'ross-und-sporn'];
const loadSource = name => readFileSync(new URL(`../modules/newspaper-guilds/${name}.js`, import.meta.url), 'utf8');
function loadGuilds() {
  const context = vm.createContext({ SECTIONS: [{ key: 'Existing', entries: [{ id: 'existing-module' }] }] });
  vm.runInContext(loadSource('newspaper-guilds-module'), context);
  const register = () => guildFiles.forEach(name => vm.runInContext(loadSource(name), context));
  register();
  vm.runInContext(readFileSync(new URL('../modules/comments/comments-routing.js', import.meta.url), 'utf8'), context);
  return { context, register, section: context.SECTIONS[1] };
}

test('all six guilds share the requested category without replacing existing content or duplicating on registration', () => {
  const { context, register, section } = loadGuilds();
  register();
  assert.equal(context.SECTIONS.length, 2);
  assert.equal(context.SECTIONS[0].entries[0].id, 'existing-module');
  assert.equal(section.tab, 'Gilden & Zünfte');
  assert.deepEqual(Array.from(section.path), ['Nachrichten und Schreibergilden']);
  assert.equal(new Set(section.entries.map(entry => entry.id)).size, 6);
  assert.equal(section.entries.length, 6);
  for (const entry of section.entries) {
    assert.equal(entry.pages.length, 5);
    assert.equal(entry.enablePageComments, false);
    assert.deepEqual(Array.from(entry.pages, page => !!page.enableComments), [true, false, false, false, true]);
    assert.deepEqual(Array.from(entry.pages, (page, index) => !!context.getInlineCommentThreadForPage(page, entry, index)), [true, false, false, false, true]);
    assert.equal(entry.appendCommentsPage, false);
    assert(entry.pages[1].guildPage && entry.pages[2].hierarchyPage && entry.pages[3].organizationNetworkPage);
    assert.equal(entry.pages[2].hierarchy.levels.length, 3);
    assert.equal(entry.pages[2].hierarchy.levels.flatMap(level => level.nodes).length, 6);
    assert.equal(entry.pages[2].hierarchy.quote, '');
  }
});

test('the network distinguishes known headquarters from local offices and preserves each publication scope', () => {
  const { section } = loadGuilds();
  const byId = id => section.entries.find(entry => entry.id === `zeitungsgilde-${id}`);
  const network = id => byId(id).pages[3].organizationNetwork;
  assert.match(network('celtigerns-echo').reach, /Nur Celtigerns Wacht/);
  assert.equal(network('celtigerns-echo').sites.find(site => site.kind === 'headquarters').name, 'Gwynthor');
  assert.equal(network('schwarzbote').sites.filter(site => site.kind === 'headquarters').length, 0);
  assert.match(network('kronenspiegel').reach, /Nur Cenyr/);
  assert.equal(network('kronenspiegel').sites.find(site => site.kind === 'headquarters').name, 'Mathragon');
  assert.equal(network('kronenspiegel').sites.filter(site => site.kind === 'printing').length, 4);
  assert.equal(network('fluesterfaecher').sites.find(site => site.kind === 'headquarters').name, 'Blutstadt');
  for (const id of ['waffengang', 'ross-und-sporn']) {
    assert.match(network(id).reach, /Weltweit/);
    assert.equal(network(id).sites.find(site => site.kind === 'headquarters').name, 'Blutstadt');
    assert(network(id).sites.some(site => /jeder Hauptstadt/.test(site.name)));
    for (const name of ['Abergwint', 'Rhosmere']) assert(network(id).sites.some(site => site.name === name));
  }
  assert.match(network('ross-und-sporn').sites.find(site => /Lothir/.test(site.name)).region, /Kontinent/);
  assert(byId('ross-und-sporn').pages[1].guild.connections.some(connection => connection.name === 'Owain Draig'));
});

test('guild artwork and location links resolve locally, and all twelve scenes have the requested 2:3 format', () => {
  const { section } = loadGuilds();
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  const checkReferences = value => {
    if (Array.isArray(value)) value.forEach(checkReferences);
    else if (value && typeof value === 'object') Object.values(value).forEach(checkReferences);
    else if (typeof value === 'string' && /^\.\.?\//.test(value)) {
      const url = new URL(value, base);
      url.search = '';
      assert(existsSync(url), `Missing local reference: ${value}`);
    }
  };
  checkReferences(section);
  const scenes = section.entries.flatMap(entry => [entry.pages[0].image, entry.pages[4].image]);
  assert.equal(new Set(scenes).size, 12);
  for (const scene of scenes) {
    const url = new URL(scene, base);
    url.search = '';
    const bytes = readFileSync(url);
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
  }
});
