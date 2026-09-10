import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { RELIGION_ROOT, readReligionCatalog, entryPagePath, entrySearchText } from '../modules/content/content-repository.mjs';
import { readClergyCatalog, validateClergyCatalog, clergyArt, clergyPagePath, getClergyPageInputs } from '../modules/clergy/clergy-repository.mjs';
import { clergyDirectoryEntries } from '../modules/clergy/clergy-directory-template.mjs';
import { renderClergyPages } from '../modules/clergy/clergy-pages.mjs';
import { renderClergyProfile } from '../modules/clergy/clergy-profile-template.mjs';
import { readClergyCaste, writeClergyCaste } from '../modules/clergy/clergy-state.mjs';
import { filterEntries } from '../modules/catalog/catalog-model.mjs';

const workspace = resolve(RELIGION_ROOT, '..');
const catalog = readReligionCatalog();
const clergy = readClergyCatalog(catalog);
const casteIds = ['priester', 'moenche', 'paladine', 'asketen', 'magister', 'gelaeuterte'];

test('clergy preserves nineteen individual traditions and all six castes', () => {
  assert.deepEqual(clergy.castes.map(caste => caste.id), casteIds);
  assert.deepEqual(clergy.deities, catalog.entries.filter(entry => entry.collectionId === clergy.collectionId).map(entry => entry.id));
  assert.equal(clergy.profiles.length, 19);
  for (const profile of clergy.profiles) {
    assert.deepEqual(Object.keys(profile.castes), casteIds);
    assert(profile.castes.moenche.guilds.length >= 2, profile.godId);
    for (const caste of clergy.castes) {
      assert.equal(Object.hasOwn(profile.castes[caste.id], 'guilds'), caste.id === 'moenche');
    }
  }
  for (const casteId of ['priester', 'moenche', 'paladine', 'asketen', 'gelaeuterte']) {
    assert.equal(new Set(clergy.profiles.map(profile => profile.castes[casteId].paragraphs.join(' '))).size, 19, casteId);
  }
});

test('only Orin, Auron and Orith have scientific branches and their supplied portraits', () => {
  const magister = clergy.castes.find(caste => caste.id === 'magister');
  assert.deepEqual(clergy.faculties.fields.map(field => field.godId), ['orin', 'auron', 'orith']);
  for (const profile of clergy.profiles) {
    const ownsField = ['orin', 'auron', 'orith'].includes(profile.godId);
    assert.equal(profile.castes.magister.presence, ownsField ? 'fest' : 'angebunden');
    assert.equal(clergyArt(clergy, profile, magister)?.src || null, ownsField ? `Religionen/klerus/assets/magister-${profile.godId}.png` : null);
  }
  const sources = JSON.parse(readFileSync(resolve(RELIGION_ROOT, 'klerus/assets/sources.json'), 'utf8'));
  assert.deepEqual(sources.images.filter(image => image.src.includes('/magister-')).map(image => image.url), ['https://i.imgur.com/slpFhs5.png', 'https://i.imgur.com/qICwB6G.png', 'https://i.imgur.com/SzqWfji.png']);
  for (const image of sources.images) {
    const bytes = readFileSync(resolve(workspace, image.src));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.equal(bytes.readUInt32BE(16), image.width);
    assert.equal(bytes.readUInt32BE(20), image.height);
  }
});

test('hierarchies preserve leadership, service, academic offices and the end of penitence', () => {
  const caste = id => clergy.castes.find(item => item.id === id);
  assert.deepEqual(caste('priester').hierarchy.ranks.map(rank => rank.title), ['Laie', 'Oblat', 'Novize', 'Adept', 'Kurator', 'Priester / Priesterin', 'Diakon / Diakonin · Pastor', 'Vikar / Vikarin', 'Prälat / Prälatin', 'Bischof / Bischöfin', 'Erzbischof / Erzbischöfin', 'Patriarch / Matriarchin', 'Erzpatriarch / Erzmatriarchin', 'Hierarch']);
  assert.match(caste('priester').hierarchy.ranks[7].duty, /Bannkreis.*Diakone/);
  assert.match(caste('priester').hierarchy.ranks[9].duty, /Optional.*Baron.*zugleich Patriarch/);
  assert.match(caste('priester').hierarchy.ranks[11].duty, /feudalen Struktur.*Grafschaft oder Baronie/);
  assert.match(caste('priester').hierarchy.ranks[12].duty, /Cenyr oder Aldrimar.*großer Orden/);
  assert.equal(caste('priester').hierarchy.ranks[0].title, 'Laie');
  assert.equal(caste('priester').hierarchy.ranks.at(-1).title, 'Hierarch');
  assert.match(caste('moenche').hierarchy.ranks.at(-1).title, /Abt/);
  assert.match(caste('asketen').hierarchy.ranks.at(-1).title, /Meister.*des Pfades/);
  assert.match(caste('magister').hierarchy.ranks.at(-1).title, /Rektor/);
  assert.deepEqual(caste('gelaeuterte').hierarchy.ranks.map(rank => rank.title), ['Bußgänger', 'Geläuterter']);
  assert.match(caste('gelaeuterte').hierarchy.ranks[0].duty, /Eid und Schweigegelübde/);
  assert.match(caste('gelaeuterte').hierarchy.ranks[1].duty, /befreit.*freier Mensch.*Gesellschaft/);
});

test('five supplied ascetic portraits accompany established communities; other gods have rare or no branches', () => {
  const ascetics = clergy.castes.find(caste => caste.id === 'asketen');
  const imageIds = ['ordan', 'baldran', 'maldras', 'sylvana', 'kharon'];
  for (const profile of clergy.profiles) {
    const art = clergyArt(clergy, profile, ascetics);
    if (imageIds.includes(profile.godId)) {
      assert.equal(art.src, `Religionen/klerus/assets/asketen-${profile.godId}.png`);
      assert.equal(art.placeholder, false);
    } else {
      assert(['selten', 'eingebunden'].includes(profile.castes.asketen.presence), profile.godId);
      assert.equal(art, null, profile.godId);
    }
  }
  const sources = JSON.parse(readFileSync(resolve(RELIGION_ROOT, 'klerus/assets/sources.json'), 'utf8'));
  assert.deepEqual(sources.images.filter(image => image.src.includes('/asketen-')).map(image => image.url), ['https://i.imgur.com/FvG0ui2.png', 'https://i.imgur.com/SbPh8zh.png', 'https://i.imgur.com/ULQcr8N.png', 'https://i.imgur.com/Cn4WszI.png', 'https://i.imgur.com/EhvU0ya.png']);
});

test('clergy register searches monastic guilds, tasks and alternate divine names', () => {
  const entries = clergyDirectoryEntries(clergy, catalog).map(entry => ({ ...entry, searchText: entrySearchText(entry) }));
  assert.deepEqual(filterEntries(entries, { query: 'Feinwerker' }).map(entry => entry.id), ['auron']);
  assert.deepEqual(filterEntries(entries, { query: 'Arvendil' }).map(entry => entry.id), ['auron']);
  for (const [chapterId, count] of [['goettliche', 9], ['souveraene', 5], ['untergoetter', 5]]) {
    assert.equal(filterEntries(entries, { chapterId }).length, count);
  }
  for (const entry of entries) assert.equal(entryPagePath(entry), clergyPagePath(entry.id));
});

test('invalid caste, guild, faculty and profile data fails before generation', () => {
  const cases = [
    [copy => { copy.profiles[0].castes.priester.guilds = []; }, /Zünfte nur/],
    [copy => { copy.profiles[0].castes.moenche.guilds.push(copy.profiles[0].castes.moenche.guilds[0]); }, /Doppelte.*Zunft/],
    [copy => { copy.profiles[0].castes.magister.presence = 'fest'; }, /Magisterium/],
    [copy => { copy.faculties.fields.push(copy.faculties.fields[0]); }, /Fachbereich/],
    [copy => { copy.profiles.pop(); }, /Klerusregister/],
    [copy => { delete copy.profiles[0].castes.asketen; }, /Unvollständige/],
    [copy => { copy.castes[0].art = { src: '../escape.png' }; }, /lokaler Pfad/],
    [copy => { copy.overview.communities[0].text = ''; }, /Klerustext fehlt/]
  ];
  for (const [mutate, pattern] of cases) {
    const copy = structuredClone(clergy);
    mutate(copy);
    assert.throws(() => validateClergyCatalog(copy, catalog), pattern);
  }
  assert.throws(() => clergyPagePath('../escape'), /Ungültige Gottheit/);
});

test('caste deep links preserve other URL state and recover from malformed fragments', () => {
  const target = writeClergyCaste('https://example.test/klerus/ordan/?ref=almanach#priester', 'moenche', casteIds);
  assert.equal(readClergyCaste(target, casteIds), 'moenche');
  assert.equal(target.search, '?ref=almanach');
  assert.equal(target.pathname, '/klerus/ordan/');
  for (const hash of ['#unbekannt', '#%E0%A4%A', '']) assert.equal(readClergyCaste(`https://example.test/${hash}`, casteIds), 'priester');
  assert.throws(() => writeClergyCaste(target, 'unknown', casteIds), /Unbekannte Kaste/);
});

test('twenty generated pages are current, statically readable and locally linked', () => {
  const pages = renderClergyPages(clergy, catalog);
  assert.equal(pages.length, 20);
  assert.equal(Object.keys(getClergyPageInputs()).length, 20);
  const sourceFor = path => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  for (const [path, html] of pages) {
    assert.equal(sourceFor(resolve(workspace, path)), html, path);
    assert(!/\son(?:click|change|input|error)=|AlerischerKlerus\.html|https?:\/\/i\.imgur/.test(html), path);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${path}`);
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(match[1].replace(/&amp;/g, '&'), `https://local.test/${path}`);
      assert.equal(url.hostname, 'local.test');
      const target = resolve(workspace, `.${decodeURIComponent(url.pathname)}`);
      assert(existsSync(target), `${path}: ${target}`);
      if (url.hash) assert(sourceFor(target).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${path}: ${url.hash}`);
    }
    if (path.includes('/gottheiten/')) {
      assert.equal((html.match(/data-caste-panel=/g) || []).length, 6);
      assert.equal((html.match(/class="clergy-guilds"/g) || []).length, 1);
      assert.equal((html.match(/class="clergy-ranks"/g) || []).length, 6);
    }
  }
  const hostile = structuredClone(clergy.profiles[0]);
  hostile.intro = '<script>alert("x")</script>';
  const html = renderClergyProfile(clergy, catalog, hostile);
  assert(!html.includes(hostile.intro));
  assert(html.includes('&lt;script&gt;'));
});

test('divine profiles and active entry points link to the new clergy section', () => {
  for (const profile of clergy.profiles) {
    const god = catalog.entries.find(entry => entry.id === profile.godId);
    assert(god.links.some(link => link.href === clergyPagePath(god.id)));
  }
  for (const path of ['index.html', 'Hauptseite/index.html', 'Religionen/index.html', 'Religionen/pantheons/neun-goettliche/index.html', 'Religionen/religionen/alerische-kirche/index.html']) {
    const html = readFileSync(resolve(workspace, path), 'utf8');
    assert(!html.includes('AleriaKlerus/AlerischerKlerus.html'), path);
    assert(html.includes('klerus/index.html'), path);
  }
});
