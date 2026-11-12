import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { HOUSE_CONTENT as content } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Melog/haus.content.mjs';
import { HOUSE_BIOGRAPHY as biography } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Melog/haus.biography.mjs';
import { HOUSE_CONTENT as perllan } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.content.mjs';
import { HOUSE_MELOG_FAMILY as family } from '../../Stammbäume/assets/js/data/house-melog-family.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { hasNobleCourt } from '../modules/court/house-court-model.mjs';

const feature = new URL('../', import.meta.url);
const house = new URL('Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Melog/', feature);
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('haus.data.js', house), 'utf8'), context);
const page = context.window.HAEUSER_DATA;

test('Melog original remains byte-identical and editorial decisions distinguish gaps from facts', () => {
  const manifest = JSON.parse(readFileSync(new URL('source-manifest.json', house), 'utf8'));
  const digest = createHash('sha256').update(readFileSync(new URL('animexx-original.html', house))).digest('hex');
  assert.equal(digest, manifest.source.sha256);
  assert.equal(manifest.familyId, family.document.id);
  assert.equal(manifest.houseId, 'house-melog');
  const familyDigest = createHash('sha256').update(readFileSync(new URL('melog-original.json', house))).digest('hex');
  assert.equal(familyDigest, manifest.familySource.sha256);
  assert.ok(manifest.coverage.some(entry => entry.includes('Neid')));
  assert.ok(manifest.decisions.some(entry => entry.includes('keine nachträglich behauptete alte Rezeptur')));
});

test('Melog retains its commoner profile and does not invent a founder or hereditary offices', () => {
  assert.equal(content.type, 'Bürgerliches Haus');
  assert.equal(content.profile.rank, 'Bürgerlich');
  assert.equal(content.profile.seat, 'Gwynthor · Zum Honigtörtchen');
  assert.equal(content.profile.liege, 'Haus Draig');
  assert.equal(content.profile.people, 'Cenyri');
  assert.equal(content.profile.wealth, 'Beschaulich');
  assert.equal(content.profile.religion, 'Alerische Kirche');
  assert.match(content.profile.patronDeities, /Tharim, der Knecht/);
  assert.equal(content.founder, null);
  assert.equal(content.parentHouseId, '');
  assert.equal(content.heirs.length, 0);
  assert.equal(content.offices.length, 7);
  assert.equal(content.cadets.length, 0);
  assert.equal(hasNobleCourt(page), false);
  assert.deepEqual(Array.from(page.hiddenProfileGroups), ['military']);
  assert.equal(content.currentHead, 'Tewdwr · Konditor- und Bäckermeister');
  assert.equal(content.officesTitle, 'Aufgaben im Familienbetrieb');
  assert.equal(content.profile.motto, '');
});

test('house history preserves the complete rescue and later wedding commissions', () => {
  const history = content.sections.history;
  for (const phrase of ['1690', 'Ithel', 'Tewdwr', 'Meurig Draig und Heledd Gwyvern', 'Castell Draig', 'fünfzehnjährigen Sohn', 'Hofküche', 'innerhalb weniger Stunden', 'silbernes Tortenmesser', 'Rhys Draig und Brona Eisenherz', 'Alicyn Draig und Sir Egon Gafyr', 'Rhys und Alicyn sind Kinder Meurigs']) assert.ok(history.includes(phrase), phrase);
  assert.match(history, /ursprüngliche Torte verschwinden ließ.*nicht/s);
  assert.match(history, /Ithel lebte von 1647 bis 1723/);
  assert.match(history, /1675 geborener Sohn Tewdwr/);
  assert.match(history, /fehlende Generationen, nicht für eine unmittelbare biologische Elternschaft/);
  assert.match(content.sections.traditions, /einfachen Arbeiten einer Backstube/);
  assert.match(content.sections.traditions, /wesentliche Charakter/);
  assert.match(content.sections.traditions, /keine feste Zutatenliste/);
});

test('all building areas, faith and source perspectives are retained without turning rumors into findings', () => {
  for (const phrase of ['Verkaufsraum', 'Gastraum', 'Backstube', 'Vorratsräume', 'Arbeitsbereiche', 'Wohnräume', 'Vitrine', 'nicht zum Verkaufssortiment']) assert.ok(content.sections.holdings.includes(phrase), phrase);
  assert.match(content.sections.cultureReligion, /Neun Göttlichen.*Tharim/s);
  assert.match(content.sections.cultureReligion, /Hochzeiten, Geburtsfeiern und andere Festlichkeiten/);
  assert.match(content.sections.conflictsAlliances, /keine bedeutenden politischen Bündnisse/);
  assert.match(content.sections.conflictsAlliances, /Behauptung bleibt die Sicht der Konkurrenten/);
  assert.match(content.sections.conflictsAlliances, /Müllern, Bauern, Händlern und anderen Handwerkern/);
  assert.match(content.sections.values, /Fleiß, Ehrlichkeit, Zuverlässigkeit und handwerkliche Sorgfalt/);
});

test('all named relatives have real family links while unknown founders remain in the tree', () => {
  assert.equal(content.heads.length, 2);
  const named = family.persons.filter(person => !/^Unbekannt/i.test(person.name));
  assert.equal(content.figures.length, 16);
  assert.deepEqual(content.figures.map(row => row.id), named.map(person => person.id));
  assert.equal(new Set(content.figures.map(row => row.id)).size, 16);
  assert.deepEqual(content.heads.map(row => row.id), ['person-29ef1c22', 'person-0c68dade']);
  for (const person of named) {
    const card = content.figures.find(row => row.id === person.id);
    assert.equal(card.familyId, 'melog');
    assert.equal(card.name, person.name);
    assert.ok(card.role);
    const image = Object.values(page.images).find(image => image.href?.endsWith(`&person=${person.id}`));
    assert.ok(image, person.id);
    assert.equal(new URL(image.href, 'https://aleria.example/Familien/').searchParams.get('family'), 'melog');
  }
  assert.equal(page.familyTreeEmbed.src, '../Stammb%C3%A4ume/Stammbaum.html?family=melog&mode=view&embed=1');
  assert.equal(page.figures.mobileLayout, 'stacked');
  assert.match(content.sections.familyTree, /18 gelieferten Personen/);
  assert.match(content.sections.familyTree, /Überlieferungslücke/);
  for (const [id, birth] of [['person-9ffeda8d', '1697'], ['person-d32c2160', '1696'], ['person-4c366307', '1731'], ['person-157c1853', '1732']]) {
    assert.equal(family.persons.find(person => person.id === id).birth, birth);
    assert.match(content.figures.find(person => person.id === id).detail, new RegExp(birth));
  }
  assert.match(content.sections.court, /Cerys und Iddon bleiben Kinder/);
  for (const office of content.offices) assert.ok(named.some(person => person.id === office.id));
});

test('house page, biography and registry share canonical images and shop navigation', () => {
  const registryContext = { window: {} };
  vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
  const entries = registryContext.window.HAEUSER_REGISTRY.filter(row => row.id === 'melog');
  assert.equal(entries.length, 1);
  assert.equal(registryContext.window.HAEUSER_REGISTRY.some(row => row.id === 'haus-melog'), false);
  assert.equal(entries[0].page, 'kleinehaeuser.html');
  assert.equal(entries[0].type, 'family');
  const expectedShopLink = '../AleriaAlmanach/AleriaAlmanach.html?entry=zum-honigtoertchen';
  assert.equal(page.images['haus-hauptbild'].href, expectedShopLink);
  assert.equal(biography.house.documents.at(-1).link, expectedShopLink);
  const treeRoot = new URL('../../Stammbäume/', import.meta.url);
  assert.deepEqual(readFileSync(new URL(content.images.crest, feature)), readFileSync(new URL(family.document.emblem, treeRoot)));
  assert.deepEqual(readFileSync(new URL(biography.image, treeRoot)), readFileSync(new URL(content.images.scene, feature)));
  for (const image of Object.values(page.images)) if (image.src) assert.ok(existsSync(new URL(image.src, feature)), image.src);
  assert.ok(existsSync(new URL(content.territoryHref, feature)));
  for (const ally of content.allies) assert.ok(existsSync(new URL(ally.image, feature)), ally.image);
});

test('registered short biography preserves the family graph and every authored chapter', () => {
  const records = FAMILY_REGISTRY.filter(row => row.id === 'melog');
  assert.equal(records.length, 1);
  const registered = records[0].family;
  for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage']) assert.deepEqual(registered[key], family[key], key);
  assert.equal(registered.extensions.houseBiographyModule.pageTitle, 'Familie Melog');
  assert.equal(registered.extensions.houseBiographyModule.house.documents.length, 2);
  assert.deepEqual(createHouseBiography(content), biography);
  const bioText = JSON.stringify(biography);
  for (const phrase of ['1690', 'Rhys Draig', 'Alicyn Draig', 'Tharim', 'Vitrine', 'Zuverlässigkeit']) assert.ok(bioText.includes(phrase), phrase);
});

test('optional house illustration navigation leaves unrelated existing pages unchanged', () => {
  const withoutNavigation = createHousePageData(perllan);
  assert.equal(Object.hasOwn(withoutNavigation.images['haus-hauptbild'], 'href'), false);
  assert.equal(Object.hasOwn(withoutNavigation.figures, 'mobileLayout'), false);
  assert.equal(withoutNavigation.familyTreeEmbed.src, '../Stammb%C3%A4ume/Stammbaum.html?family=perllan&mode=view');
  const withNavigation = createHousePageData({ ...perllan, images: { ...perllan.images, sceneHref: 'backstube.html' } });
  assert.equal(withNavigation.images['haus-hauptbild'].href, 'backstube.html');
  assert.deepEqual({ ...withNavigation, images: withoutNavigation.images }, withoutNavigation);
});
