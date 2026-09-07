import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import {
  NORDMAENNER_CLASS_IDS,
  getNordmaennerClassDefinition,
  getNordmaennerClassDefinitions
} from '../../AleriaAlmanach/modules/classes/nordmaenner/nordmaenner-class-registry.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';

const root = new URL('../../', import.meta.url);
const expectedArt = Object.freeze({
  'hird-kona': [500, 745],
  stjorn: [500, 745],
  ravnar: [500, 333],
  ulfhednar: [500, 745],
  berserkir: [500, 745],
  veigir: [500, 745],
  tungur: [500, 745],
  hestgar: [500, 273]
});
const expectedLore = Object.freeze({
  'hird-kona': /bewaffnete Gemeinschaft des Clans/,
  stjorn: /das Gefecht lenkt/,
  ravnar: /Rabenkrieger/,
  ulfhednar: /Werwolf oder Werbär/,
  berserkir: /Berserkerpilzen/,
  veigir: /Sonnensteinen/,
  tungur: /archaischen Form von Magie/,
  hestgar: /Hest-Rösser/
});

test('Nordmänner registry keeps eight lore-only classes without inventing progression', () => {
  const definitions = getNordmaennerClassDefinitions();
  assert.equal(definitions.length, 8);
  assert.deepEqual(definitions.map(entry => entry.classId), NORDMAENNER_CLASS_IDS);
  assert.equal(new Set(definitions.map(entry => entry.id)).size, definitions.length);
  for (const definition of definitions) {
    assert.equal(definition.status, 'lore-only');
    assert.equal(definition.progressionStatus, 'not-authored');
    assert.deepEqual(definition.combatStyleGrants, []);
    assert.equal('minimumLevel' in definition, false);
    assert.equal('maximumLevel' in definition, false);
    assert.equal('trainingPhases' in definition, false);
  }
  const changed = getNordmaennerClassDefinition('stjorn');
  changed.name = 'Geändert';
  assert.equal(getNordmaennerClassDefinition('nordmaenner-stjorn').name, 'Stjorn');
  assert.equal(getNordmaennerClassDefinition('berserker').classId, 'berserkir');
  assert.equal(getNordmaennerClassDefinition('schildmaid').classId, 'hird-kona');
  assert.equal(getNordmaennerClassDefinition('missing'), null);
});

test('all supplied Nordmänner documents retain their lore, art and clean pending chapters', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Nordmaenner/kultur.json', root), 'utf8'));
  assert.match(culture.sharedSections.kriegertum, /Norrnaigh/);
  assert.match(culture.sharedSections.grundstil, /Halten.*Vorrücken.*Brechen/);
  for (const id of NORDMAENNER_CLASS_IDS) {
    const source = JSON.parse(await readFile(new URL(`Klassenordner/Nordmaenner/${id}/klasse.json`, root), 'utf8'));
    const document = resolveCultureClassDocument(source, culture);
    assert.equal(document.cultureId, 'nordmaenner');
    assert.equal(document.sections.filter(section => section.status === 'written').length, 8);
    assert.deepEqual(document.sections.filter(section => section.status === 'pending').map(section => section.id), ['trivia', 'historische-figuren']);
    assert.deepEqual([document.artwork.width, document.artwork.height], expectedArt[id]);
    assert.match(document.sections.find(section => section.id === 'geschichte').html, /Kriegertum der Nordmänner/);
    assert.match(document.sections.find(section => section.id === 'kampfkunst').html, /gemeinsamen, überlieferten Grundstil/);
    assert.match(JSON.stringify(document.sections), expectedLore[id]);
    assert(!/〈Motto〉|Titel hier|Dialog von Figur|Beschreibung \.\.\.|Animexx/i.test(JSON.stringify(document)));
    assert.match(document.source.sha256, /^[a-f0-9]{64}$/);
  }
});

test('generated Nordmänner pages are linked, responsive documents without a level system', async () => {
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  for (const id of NORDMAENNER_CLASS_IDS) {
    const definition = getNordmaennerClassDefinition(id);
    const pageUrl = new URL(definition.pagePath, root);
    await access(pageUrl);
    const page = await readFile(pageUrl, 'utf8');
    assert(catalog.includes(`id="klasse-nordmaenner-${id}"`));
    assert(catalog.includes(`href="Nordmaenner/${id}/index.html"`));
    assert(page.includes('data-culture="nordmaenner"'));
    assert(page.includes('nordmaenner-class-page.css'));
    assert(page.includes('class-mobile-nav'));
    assert(page.includes('Klassen der Nordmänner'));
    assert(!page.includes('data-culture-class='));
    assert(!page.includes('id="ausbildungsplan"'));
    assert(!page.includes('data-role="training-level"'));
    assert(!page.includes('culture-class-page.js'));
    assert(!/\bon(?:click|change|input)\s*=/i.test(page));
  }
});

test('the character archive resolves every supplied Nordmänner page without combat grants', async () => {
  for (const id of NORDMAENNER_CLASS_IDS) {
    const definition = getNordmaennerClassDefinition(id);
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: definition.name, data: { id } }]);
    const links = getCharacterArchiveClassLinks(entry);
    assert(links.some(link => link.href.endsWith(definition.pagePath)), `${definition.name}: archive link`);
    assert.equal(entry.data.cultureClassProfiles, undefined, `${definition.name}: no premature progression`);
  }
});
