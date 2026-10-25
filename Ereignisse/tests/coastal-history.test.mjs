import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { COASTAL_ORIGINALS, coastalSource, applyCoastalEdition } from '../../shared/coastal-history/coastal-sources.mjs';
import { PIRATES, GREAT_PIRATES, LEITHEACH_PIRATES, pirateChildren } from '../../shared/coastal-history/pirates.mjs';
import { COASTAL_EVENT_PAGES, VENNYR_FIGURES, LEITHEACH_INCIDENTS } from '../modules/coastal-history/coastal-events.mjs';
import { coastalArt } from '../../shared/coastal-history/art.mjs';
import { piracySections } from '../../Piraterie/modules/piracy-module-build.mjs';
import { readFactionCatalog } from '../../Fraktionen/modules/catalog/faction-repository.mjs';
import { EVENTS } from '../modules/catalog/events-data.mjs';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { LEITHEACH_ROUTE } from '../../shared/coastal-history/leitheach-route.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const json = file => JSON.parse(read(file));
const hash = file => createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex');
const files = [...COASTAL_EVENT_PAGES.map(page => page.file), 'Piraterie/index.html', ...PIRATES.flatMap(entry => [entry.profileHref, entry.factionHref]), 'shared/coastal-history/redaktion.html'];

test('all eighteen original attachments remain hash-identical; duplicate is retained explicitly', () => {
  assert.equal(COASTAL_ORIGINALS.length, 18);
  for (const source of COASTAL_ORIGINALS) assert.equal(hash(`Archiv/Quellen/kuestenchroniken-2026-10-24/${source.file}`), source.sha256);
  assert.equal(COASTAL_ORIGINALS[14].duplicateOf, 'coastal-11');
  assert.equal(COASTAL_ORIGINALS[14].sha256, COASTAL_ORIGINALS[10].sha256);
});
test('edition is guarded, leaves originals intact and fixes copied identities, places and times', () => {
  assert.match(COASTAL_ORIGINALS[15].title, /Sirenenzahn/);
  assert.equal(coastalSource('coastal-16').blocks[0].text, 'Die Klauen des Leviathan');
  assert.match(coastalSource('coastal-03').blocks[6].rows[1][1].text, /04:00/);
  assert.match(coastalSource('coastal-04').blocks[6].rows[1][1].text, /18:00–21:30/);
  assert.match(coastalSource('coastal-04').blocks[6].rows[2][1].text, /Broch an Clais/);
  assert.doesNotMatch(JSON.stringify(coastalSource('coastal-04')), /Vernichtung Seannbails|Laird Puirseil/);
  assert.throws(() => applyCoastalEdition(COASTAL_ORIGINALS, [{ sourceId: 'coastal-01', block: 4, before: 'wrong', after: 'test' }]), /veraltet/);
});
test('four great pirate groups are peers; exactly seventeen real subordinate names, never template placeholders', () => {
  assert.equal(PIRATES.length, 21);
  assert.equal(GREAT_PIRATES.length, 4);
  assert.equal(new Set(PIRATES.map(entry => entry.id)).size, 21);
  assert.ok(GREAT_PIRATES.every(entry => entry.parentId === null));
  assert.deepEqual(GREAT_PIRATES.map(entry => pirateChildren(entry.id).length), [0, 5, 9, 3]);
  assert.ok(PIRATES.every(entry => !/könig der see/i.test(entry.name)));
  const records = readFactionCatalog().flatMap(category => category.entries);
  for (const entry of PIRATES) {
    const faction = records.find(record => record.id === entry.id);
    assert.equal(faction.parentId, entry.parentId || 'loge-der-daemmerung');
    assert.equal(faction.href, entry.factionHref.replace('Fraktionen/', ''));
  }
});
test('raid totals count crews once and do not silently allocate unknown ships to individual attacks', () => {
  assert.equal(LEITHEACH_PIRATES.reduce((total, entry) => total + entry.ships, 0), 15);
  assert.equal(LEITHEACH_PIRATES.reduce((total, entry) => total + entry.crew[0], 0), 710);
  assert.equal(LEITHEACH_PIRATES.reduce((total, entry) => total + entry.crew[1], 0), 880);
  for (const event of LEITHEACH_INCIDENTS) assert.equal('startDate' in event, false);
  for (const event of EVENTS.filter(entry => entry.id.startsWith('leitheach-'))) assert.equal('startDate' in event, false);
});
test('1720 portraits preserve genealogical ages and do not invent a birth year for Ketill', () => {
  assert.deepEqual(VENNYR_FIGURES.slice(0, 3).map(person => person.year - person.birth), [50, 58, 63]);
  assert.equal(VENNYR_FIGURES[3].birth, null);
  assert.match(VENNYR_FIGURES[1].note, /Verwundung 1719/);
  for (const figure of VENNYR_FIGURES.filter(person => person.family)) {
    const person = getRegisteredFamily(figure.family).family.persons.find(person => person.id === figure.person);
    assert.equal(Number(person.birth), figure.birth);
    assert.equal(Number(person.death), figure.death);
  }
});
test('all nine Schwarzblut crews have distinct generated scenes; rejected elven versions never consumed', () => {
  const crews = pirateChildren('schwarzblut-marodeure');
  assert.equal(new Set(crews.map(entry => entry.image)).size, 9);
  assert.ok(crews.every(entry => entry.image === coastalArt(entry.id)));
  const active = json('Ereignisse/assets/coastal-history/image-assets.json').filter(asset => asset.active);
  assert.equal(active.length, 22);
  for (const asset of active) assert.equal(hash(asset.file), asset.sha256);
  for (const file of files) assert.doesNotMatch(read(file), /(?:flutbeisser|schwarzbucht-marodeure)-v1\.(?:png|webp)/);
  const production = json('Ereignisse/assets/coastal-history/image-production.json');
  assert.ok(production.jobs.filter(job => job.version === 2).every(job => /KEINE ELFEN/.test(job.prompt) && !/dezent spitzen/.test(job.prompt)));
});
test('prepared Almanach modules use one source and form the requested nested tree without duplicate IDs', () => {
  const sections = piracySections();
  const context = vm.createContext({});
  vm.runInContext(read('AleriaAlmanach/modules/piracy/piracy-entries.js'), context);
  assert.equal(JSON.stringify(context.createPiracySections()), JSON.stringify(sections));
  assert.deepEqual(sections.slice(2).map(section => section.path), GREAT_PIRATES.map(entry => ['Piratenbanden', entry.name]));
  const modules = sections.flatMap(section => section.entries);
  assert.equal(modules.length, 23);
  assert.equal(new Set(modules.map(entry => entry.id)).size, 23);
  for (const pirate of PIRATES) assert.ok(modules.some(entry => entry.id === pirate.moduleId));
  assert.doesNotMatch(read('AleriaAlmanach/modules/piracy/piracy-entries.js'), /firebase|fetch\(/i);
});
test('transferred map geometry preserves source anchors, four phases and the user distance reference', () => {
  const route = json('shared/coastal-history/leitheach-route.json');
  assert.equal(route.markers.length, 17);
  assert.equal(LEITHEACH_ROUTE.stages.length, 4);
  assert.equal(route.events.length, 7);
  assert.equal(hash(route.sourceMap.image), route.sourceMap.sha256);
  assert.ok(route.calibration.fitRmsPx < 1);
  for (const marker of route.markers) assert.ok(marker.x >= 0 && marker.x <= 1 && marker.y >= 0 && marker.y <= 1);
  assert.match(JSON.stringify(route.distanceReference), /30\+ km/);
  assert.equal(route.version, 2);
  assert.equal(route.chronologyFile, 'shared/coastal-history/leitheach-chronology.json');
  assert.equal('chronologyReview' in route, false);
  assert.ok(route.events.every(event => !('time' in event)));
});
test('Dun Laog offers four accessible faction dialogs with module and guild links', () => {
  const html = read(LEITHEACH_INCIDENTS.at(-1).file);
  assert.equal((html.match(/<dialog /g) || []).length, 4);
  for (const pirate of LEITHEACH_PIRATES) {
    assert.ok(html.includes(pirate.moduleId));
    assert.ok(html.includes(`Fraktionen/Piraten/${pirate.id}.html`));
  }
  assert.doesNotMatch(html, /\son(?:click|input|change)=/);
});
test('all generated pages have valid local links, images, styles and scripts; no invented exact dates', () => {
  for (const file of files) {
    const html = read(file);
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, file);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const href = match[1].replaceAll('&amp;', '&');
      if (/^(?:https?:|data:|#|mailto:)/.test(href)) continue;
      const path = href.split(/[?#]/)[0];
      assert.ok(existsSync(resolve(dirname(resolve(root, file)), decodeURIComponent(path))), `${file} → ${path}`);
    }
  }
});
