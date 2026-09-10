import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import {
  MORGORN_CLASS_IDS,
  getMorgornClassDefinition,
  getMorgornClassDefinitions
} from '../../AleriaAlmanach/modules/classes/morgorn/morgorn-class-registry.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { validateCultureOrderOverview } from '../modules/culture/culture-order-overview.js';
import { getCultureClassPageHref } from '../modules/culture/culture-class-registry.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';

const root = new URL('../../', import.meta.url);
const expectedArt = Object.freeze({
  karnach: [1024, 1536],
  haldr: [1024, 1536],
  zernach: [1024, 1536],
  wairg: [1024, 1536],
  dornach: [1024, 1536],
  skarrach: [1024, 1536],
  rheach: [1024, 1536],
  garnach: [916, 1373]
});

test('Morgorn registry keeps eight lore-only castes without inventing progression', () => {
  const definitions = getMorgornClassDefinitions();
  assert.equal(definitions.length, 8);
  assert.deepEqual(definitions.map(entry => entry.classId), MORGORN_CLASS_IDS);
  assert.equal(new Set(definitions.map(entry => entry.id)).size, definitions.length);
  for (const definition of definitions) {
    assert.equal(definition.status, 'lore-only');
    assert.equal(definition.progressionStatus, 'not-authored');
    assert.deepEqual(definition.combatStyleGrants, []);
    assert.equal('minimumLevel' in definition, false);
    assert.equal('maximumLevel' in definition, false);
    assert.equal('trainingPhases' in definition, false);
  }
  const changed = getMorgornClassDefinition('karnach');
  changed.name = 'Geändert';
  assert.equal(getMorgornClassDefinition('morgorn-karnach').name, 'Karnach');
  assert.equal(getMorgornClassDefinition('Bergknecht').classId, 'karnach');
  assert.equal(getMorgornClassDefinition('Hüter').classId, 'haldr');
  assert.equal(getMorgornClassDefinition('Rheas Jünger').classId, 'rheach');
  assert.equal(getMorgornClassDefinition('missing'), null);
});

test('Morgorn culture data separates noble hierarchy from the warrior castes', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Morgorn/kultur.json', root), 'utf8'));
  const overview = validateCultureOrderOverview(culture.orderOverview);
  assert.deepEqual(overview.hierarchy, ['Urortharn', 'Lannach', 'Karnath', 'Haldran', 'Rannach']);
  assert.deepEqual(overview.nobleRanks.map(rank => rank.scope), ['Reich', 'Land', 'Feste', 'Halle', 'Sippe']);
  assert.deepEqual(overview.castes.map(caste => caste.id), MORGORN_CLASS_IDS);
  assert.match(overview.introduction, /ohne ihn dadurch automatisch zu adeln/);
  assert.match(overview.castesIntroduction, /rechtlich und gesellschaftlich getrennt/);
  assert.equal(overview.quote, 'Ein Wort gilt erst dann, wenn sein Träger es mit Tat, Stein oder Eid beschwert.');
});

test('all Morgorn caste documents retain supplied roles, artwork and open progression cleanly', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Morgorn/kultur.json', root), 'utf8'));
  for (const id of MORGORN_CLASS_IDS) {
    const source = JSON.parse(await readFile(new URL(`Klassenordner/Morgorn/${id}/klasse.json`, root), 'utf8'));
    const document = resolveCultureClassDocument(source, culture);
    assert.equal(document.cultureId, 'morgorn');
    assert.equal(document.sections.filter(section => section.status === 'written').length, 7);
    assert.deepEqual(document.sections.filter(section => section.status === 'pending').map(section => section.id), ['gefaehrten', 'trivia', 'historische-figuren']);
    assert.deepEqual([document.artwork.width, document.artwork.height], expectedArt[id]);
    assert.match(document.sections.find(section => section.id === 'geschichte').html, /keine zweite Adelshierarchie/);
    assert.match(document.sections.find(section => section.id === 'kampfkunst').html, /Stufenplan/);
    assert.equal(document.source.kind, 'user-provided-lore');
    assert(!/〈Motto〉|Titel hier|Beschreibung \.\.\.|Animexx/i.test(JSON.stringify(document)));
  }
});

test('generated Morgorn pages expose hierarchy, caste navigation and no premature level system', async () => {
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  assert(catalog.includes('id="morgorn"'));
  assert(catalog.includes('Urortharn</span><b aria-hidden="true">›</b><span>Lannach'));
  assert.match(catalog, /Kaste und Adel bleiben getrennt/);
  for (const id of MORGORN_CLASS_IDS) {
    const definition = getMorgornClassDefinition(id);
    const pageUrl = new URL(definition.pagePath, root);
    await access(pageUrl);
    const page = await readFile(pageUrl, 'utf8');
    assert(catalog.includes(`id="klasse-morgorn-${id}"`));
    assert(catalog.includes(`href="Morgorn/${id}/index.html"`));
    assert.equal(getCultureClassPageHref('morgorn', id), `Morgorn/${id}/index.html`);
    assert(page.includes('data-culture="morgorn"'));
    assert(page.includes('morgorn-class-page.css'));
    assert(page.includes('data-culture-order'));
    assert(page.includes('id="gesellschaftsordnung"'));
    assert(page.includes(`href="../../Morgorn/${id}/index.html" aria-current="page"`));
    assert(page.includes('class-mobile-nav'));
    assert(!page.includes('id="ausbildungsplan"'));
    assert(!page.includes('data-role="training-level"'));
    assert(!page.includes('culture-class-page.js'));
    assert(!/\bon(?:click|change|input)\s*=/i.test(page));
  }
});

test('the character archive resolves every Morgorn lore page without premature combat grants', async () => {
  for (const id of MORGORN_CLASS_IDS) {
    const definition = getMorgornClassDefinition(id);
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: definition.name, data: { id } }]);
    const links = getCharacterArchiveClassLinks(entry);
    assert(links.some(link => link.href.endsWith(definition.pagePath)), `${definition.name}: archive link`);
    assert.equal(entry.data.cultureClassProfiles.length, 1, `${definition.name}: cultural profile`);
    assert.equal(entry.data.cultureClassProfiles[0].progressionStatus, 'not-authored');
    assert.deepEqual(entry.data.cultureClassProfiles[0].combatStyleGrants, [], `${definition.name}: no premature grants`);
  }
});
