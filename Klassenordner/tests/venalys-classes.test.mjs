import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import {
  VENALYS_CLASS_IDS,
  getVenalysClassDefinition,
  getVenalysClassDefinitions
} from '../../AleriaAlmanach/modules/classes/venalys/venalys-class-registry.js';
import { getVenalysClassProgression } from '../../AleriaAlmanach/modules/classes/venalys/venalys-class-progression.js';
import { classifyCharacterArchiveEntries } from '../../AleriaAlmanach/modules/character-archive/character-archive-classification.js';
import { getCharacterArchiveClassLinks } from '../../AleriaAlmanach/modules/character-archive/character-archive-class-links.js';
import { HOUSE_FALVERI_FAMILY } from '../../Stammbäume/assets/js/data/house-falveri-family.js';
import { resolveCultureClassDocument } from '../modules/culture/culture-class-content.js';
import { getCultureClassPageHref } from '../modules/culture/culture-class-registry.js';
import { getCultureClassProgression } from '../modules/culture/culture-class-progression.js';
import { validateCultureOrderOverview } from '../modules/culture/culture-order-overview.js';
import { CLASS_LORE } from '../modules/lore/class-lore-data.js';

const root = new URL('../../', import.meta.url);
const expectedImages = Object.freeze({
  limita: 'https://i.imgur.com/XZceDty.png',
  condottieri: 'https://i.imgur.com/gKl9fXV.png',
  gondoleri: 'https://i.imgur.com/oSquWWx.png',
  lancieri: 'https://i.imgur.com/Cv8LgL4.png',
  stralieri: 'https://i.imgur.com/AmUesQT.png'
});

test('Venalys registry exposes five safe 1–20 class shells and stable aliases', () => {
  const definitions = getVenalysClassDefinitions();
  assert.deepEqual(definitions.map(entry => entry.classId), VENALYS_CLASS_IDS);
  assert.equal(new Set(definitions.map(entry => entry.id)).size, 5);
  for (const definition of definitions) {
    assert.equal(definition.progressionStatus, 'structure-only');
    assert.deepEqual(definition.combatStyleGrants, []);
    assert.equal(definition.minimumLevel, 1);
    assert.equal(definition.maximumLevel, 20);
    assert.equal(definition.techniqueBudget.total, 0);
    assert(definition.weaponTraining.primary.length > 0);
  }
  assert.equal(getVenalysClassDefinition('Condottiere').classId, 'condottieri');
  assert.equal(getVenalysClassDefinition('Cavaliere').classId, 'condottieri');
  assert.equal(getVenalysClassDefinition('Armbrustschütze').classId, 'stralieri');
  assert.equal(getVenalysClassDefinition('missing'), null);
});

test('Venalys progression remains combat-neutral through all twenty levels', () => {
  for (const id of VENALYS_CLASS_IDS) {
    const plan = getVenalysClassProgression(id, 30);
    assert.equal(plan.selectedLevel, 20);
    assert.equal(plan.levels.length, 20);
    assert.deepEqual(plan.styles, []);
    assert.deepEqual(plan.attackCatalog, []);
    assert.deepEqual(plan.availableAttacks, []);
    assert.deepEqual(plan.earnedTechniqueSlots, []);
  }
  assert.equal(getCultureClassProgression('venalys-gondoleri', 7).selectedLevel, 7);
});

test('Venalys social order agrees with the existing Falveri family source', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Venalys/kultur.json', root), 'utf8'));
  const overview = validateCultureOrderOverview(culture.orderOverview);
  const estate = HOUSE_FALVERI_FAMILY.extensions.venalysEstate;
  assert.deepEqual(overview.hierarchy, estate.socialOrder);
  assert.equal(estate.rankId, 'magnarian');
  assert.equal(estate.patricianFounderHouse, false);
  assert.equal(estate.feudalKnightHouse, false);
  assert.equal(estate.maleHonorific, 'Don');
  assert.match(overview.introduction, /keine feudale Ritterhierarchie/);
  assert.deepEqual(overview.castes.map(entry => entry.id), VENALYS_CLASS_IDS);
});

test('all five Venalys documents retain the supplied art and authored roles', async () => {
  const culture = JSON.parse(await readFile(new URL('Klassenordner/Venalys/kultur.json', root), 'utf8'));
  for (const id of VENALYS_CLASS_IDS) {
    const source = JSON.parse(await readFile(new URL(`Klassenordner/Venalys/${id}/klasse.json`, root), 'utf8'));
    const document = resolveCultureClassDocument(source, culture);
    assert.equal(document.cultureId, 'venalys');
    assert.equal(document.icon, expectedImages[id]);
    assert.equal(document.illustration, expectedImages[id]);
    assert.deepEqual([document.artwork.width, document.artwork.height], [1024, 1536]);
    assert.equal(document.sections.filter(section => section.status === 'written').length, 7);
    assert.deepEqual(document.sections.filter(section => section.status === 'pending').map(section => section.id), ['gefaehrten', 'trivia', 'historische-figuren']);
    assert.match(document.sections.find(section => section.id === 'kampfkunst').html, /kampfneutral/);
    assert(!/Animexx|Sir Aldo|feudaler Ritterrang/i.test(JSON.stringify(document)));
  }
});

test('Venalys uses the standard catalog header and collapsed background', async () => {
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  assert.match(catalog, /<section class="land-section section-venalys" id="venalys" data-class-group>/);
  assert.match(catalog, /<div class="land-header header-venalys">\s*<img class="land-banner"[^>]+alt="Venalys"[^>]*>\s*<div class="land-info"><h2>Venalys<\/h2><\/div>/);
  assert.equal(CLASS_LORE.venalys.subtitle, 'Die Republik der Patrizier');
  assert.match(CLASS_LORE.venalys.warriorhood, /Cavaliere/);
  assert.equal(CLASS_LORE.venalys.hierarchy[1].rank, 'Magnarier');
});

test('generated Venalys pages connect catalog, navigation, hierarchy and training shell', async () => {
  const catalog = await readFile(new URL('Klassenordner/Klassenseite.html', root), 'utf8');
  for (const id of VENALYS_CLASS_IDS) {
    const definition = getVenalysClassDefinition(id);
    await access(new URL(definition.pagePath, root));
    const page = await readFile(new URL(definition.pagePath, root), 'utf8');
    assert(catalog.includes(`id="klasse-venalys-${id}"`));
    assert.equal(getCultureClassPageHref('venalys', id), `Venalys/${id}/index.html`);
    assert(page.includes('data-culture="venalys"'));
    assert(page.includes('venalys-class-page.css'));
    assert(page.includes('data-culture-order'));
    assert(page.includes('data-role="training-level"'));
    assert(page.includes(`data-culture-class="venalys-${id}"`));
    assert(page.includes(`href="../../Venalys/${id}/index.html" aria-current="page"`));
    assert(page.includes('Keine Attacke, kein Bonus und keine Ressource wird automatisch vergeben.'));
    assert(!/\bon(?:click|change|input)\s*=/i.test(page));
  }
});

test('the character archive links every Venalys class without combat grants', () => {
  for (const id of VENALYS_CLASS_IDS) {
    const definition = getVenalysClassDefinition(id);
    const [entry] = classifyCharacterArchiveEntries([{ kind: 'class', name: definition.name, data: { id } }]);
    const links = getCharacterArchiveClassLinks(entry);
    assert(links.some(link => link.href.endsWith(definition.pagePath)), `${definition.name}: archive link`);
    assert.equal(entry.data.cultureClassProfiles.length, 1);
    assert.equal(entry.data.cultureClassProfiles[0].progressionStatus, 'structure-only');
    assert.deepEqual(entry.data.cultureClassProfiles[0].combatStyleGrants, []);
  }
});
