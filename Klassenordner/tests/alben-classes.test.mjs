import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import {
  ALBEN_CLASS_IDS,
  getAlbenClassDefinition,
  getAlbenClassDefinitions
} from '../../AleriaAlmanach/modules/classes/alben/alben-class-registry.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';

const root = new URL('../../', import.meta.url);
const expectedArt = Object.freeze({
  kern: [500, 416],
  cateran: [500, 363],
  mormaer: [500, 247],
  serf: [500, 745],
  airig: [500, 359],
  currach: [500, 344],
  'ceolaire-piobaire': [500, 436],
  riada: [500, 352],
  galloghlaigh: [500, 750],
  fathach: [500, 750],
  silvaner: [500, 247]
});

test('Alben registry keeps eleven lore-only classes without inventing progression', () => {
  const definitions = getAlbenClassDefinitions();
  assert.equal(definitions.length, 11);
  assert.deepEqual(definitions.map(entry => entry.classId), ALBEN_CLASS_IDS);
  assert.equal(new Set(definitions.map(entry => entry.id)).size, definitions.length);
  for (const definition of definitions) {
    assert.equal(definition.status, 'lore-only');
    assert.equal(definition.progressionStatus, 'not-authored');
    assert.deepEqual(definition.combatStyleGrants, []);
    assert.equal('minimumLevel' in definition, false);
    assert.equal('maximumLevel' in definition, false);
    assert.equal('trainingPhases' in definition, false);
  }
  const changed = getAlbenClassDefinition('kern');
  changed.name = 'Geändert';
  assert.equal(getAlbenClassDefinition('alben-kern').name, 'Kern');
  assert.equal(getAlbenClassDefinition('galloglaigh').classId, 'galloghlaigh');
  assert.equal(getAlbenClassDefinition('missing'), null);
});

test('all supplied Alben documents retain their lore, art and pending placeholders cleanly', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Alben/kultur.json', root), 'utf8'));
  for (const id of ALBEN_CLASS_IDS) {
    const source = JSON.parse(await readFile(new URL(`Klassenordner/Alben/${id}/klasse.json`, root), 'utf8'));
    const document = resolveCultureClassDocument(source, culture);
    assert.equal(document.cultureId, 'alben');
    assert.equal(document.sections.filter(section => section.status === 'written').length, 8);
    assert.deepEqual(document.sections.filter(section => section.status === 'pending').map(section => section.id), ['trivia', 'historische-figuren']);
    assert.deepEqual([document.artwork.width, document.artwork.height], expectedArt[id]);
    assert.match(document.sections.find(section => section.id === 'geschichte').html, /Tiarnatum/);
    assert.match(document.sections.find(section => section.id === 'kampfkunst').html, /Grundschule des Tiarnatum/);
    if (id === 'silvaner') {
      assert.match(document.sections.find(section => section.id === 'einfuehrung').html, /Seele Dun Rothars/);
      assert.match(document.sections.find(section => section.id === 'faehigkeiten').html, /Nautik &amp; Navigation/);
    }
    assert(!/〈Motto〉|Titel hier|Beschreibung \.\.\.|Animexx/i.test(JSON.stringify(document)));
    assert.match(document.source.sha256, /^[a-f0-9]{64}$/);
  }
});

test('generated Alben pages are linked, responsive documents without a level system', async () => {
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  for (const id of ALBEN_CLASS_IDS) {
    const definition = getAlbenClassDefinition(id);
    const pageUrl = new URL(definition.pagePath, root);
    await access(pageUrl);
    const page = await readFile(pageUrl, 'utf8');
    assert(catalog.includes(`id="klasse-alben-${id}"`));
    assert(catalog.includes(`href="Alben/${id}/index.html"`));
    assert(page.includes('data-culture="alben"'));
    assert(page.includes('alben-class-page.css'));
    assert(page.includes('class-mobile-nav'));
    assert(!page.includes('data-culture-class='));
    assert(!page.includes('id="ausbildungsplan"'));
    assert(!page.includes('data-role="training-level"'));
    assert(!page.includes('culture-class-page.js'));
    assert(!/\bon(?:click|change|input)\s*=/i.test(page));
  }
  const silvanerCard = catalog.match(/<a\b[^>]*id="klasse-alben-silvaner"[^>]*>/)?.[0] || '';
  assert.match(silvanerCard, /href="Alben\/silvaner\/index\.html"/);
  assert(!silvanerCard.includes('data-action="open-class"'));
});

test('the character archive resolves every supplied Alben lore page without combat grants', async () => {
  for (const id of ALBEN_CLASS_IDS) {
    const definition = getAlbenClassDefinition(id);
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: definition.name, data: { id } }]);
    const links = getCharacterArchiveClassLinks(entry);
    assert(links.some(link => link.href.endsWith(definition.pagePath)), `${definition.name}: archive link`);
    assert.equal(entry.data.cultureClassProfiles, undefined, `${definition.name}: no premature progression`);
  }
});

test('Currach preserves the supplied ship illustration as a companion artwork', async () => {
  const source = JSON.parse(await readFile(new URL('Klassenordner/Alben/currach/klasse.json', root), 'utf8'));
  assert.deepEqual(source.companionArtwork, {
    source: 'https://i.imgur.com/UKHiCxy.png',
    width: 300,
    height: 300,
    caption: 'Albisches Hochseeschiff'
  });
  const page = await readFile(new URL('Klassenordner/Alben/currach/index.html', root), 'utf8');
  assert.equal((page.match(/https:\/\/i\.imgur\.com\/UKHiCxy\.png/g) || []).length, 1);
});
