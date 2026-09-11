import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';

const definitions = [
  ['illysywen', 'Rhonwens_Traenen', 4, 2, 20],
  ['gafyr', 'Llamreis_Ankunft', 7, 3, 20],
  ['wyrm', 'Llamreis_Ankunft', 6, 2, 20],
  ['saethwyr', 'Llamreis_Ankunft', 8, 2, 20],
  ['gwefrydd', 'Artus_Streben', 9, 3, 20],
  ['gwyvern', 'Gwendolyns_Ufer', 6, 2, 13],
  ['arwydd', 'Rhonwens_Traenen', 1, 3, 20],
];
const pageUrl = new URL('../haus.html', import.meta.url);
const treeUrl = new URL('../../Stammbäume/Stammbaum.html', import.meta.url);
const context = vm.createContext({ window: {} });
vm.runInContext(await readFile(new URL('../haeuser.registry.js', import.meta.url), 'utf8'), context);

for (const [house, region, headCount, heirCount, silhouetteCount] of definitions) {
  const directory = new URL(`../Estryll/Cenyr/Celtigerns_Wacht/${region}/Haus_${house[0].toUpperCase() + house.slice(1)}/`, import.meta.url);
  const { HOUSE_CONTENT: content } = await import(new URL('haus.content.mjs', directory));
  const page = createHousePageData(content);
  const biography = createHouseBiography(content);
  const family = getRegisteredFamily(content.id).family;

  test(`${house}: veröffentlichte Hausseite und kurze Bio sind verbunden`, async () => {
    const entry = context.window.HaeuserRegistry.byId(content.id);
    assert.equal(entry.status, 'active');
    const dataUrl = new URL(entry.data, pageUrl);
    dataUrl.search = '';
    vm.runInContext(await readFile(dataUrl, 'utf8'), context);
    assert.deepEqual(JSON.parse(JSON.stringify(context.window.HAEUSER_DATA)), page);
    assert.deepEqual(family.extensions.houseBiographyModule, biography);
    const documentLink = new URL(biography.house.documents[0].link, treeUrl);
    assert.equal(documentLink.searchParams.get('haus'), content.id);
    documentLink.search = '';
    await access(documentLink);
    await access(new URL(page.images['haus-banner'].href, pageUrl));
    assert.ok(Object.values(content.biographySummary).join(' ').split(/\s+/).length < 200);
    assert.deepEqual(biography.house.abilities, []);
    assert.deepEqual(biography.house.works, []);
    for (const key of ['overview','history','traditions','knighthood','succession','holdings','cultureReligion','conflictsAlliances','values','court','familyTree','historicalFigures']) assert.ok(page.sections[key], key);
  });

  test(`${house}: vollständige Hofdaten, Silhouetten und gültige Personenlinks`, async () => {
    assert.equal(content.heads.length, headCount);
    assert.equal(content.heirs.length, heirCount);
    assert.equal(content.offices.length, 20);
    assert.equal(content.offices.filter(entry => entry.silhouette).length, silhouetteCount);
    for (const entry of [...content.heads, ...content.heirs, ...content.offices, ...content.figures]) {
      if (!entry.id) continue;
      assert.ok(getRegisteredFamily(entry.familyId)?.family.persons.some(person => person.id === entry.id), entry.id);
    }
    for (const image of Object.values(page.images)) {
      assert.ok(image.src && !/^https?:/.test(image.src), image.src);
      await access(new URL(image.src, pageUrl));
    }
    for (const src of [biography.image, biography.house.crestImage, ...biography.house.connections.map(e => e.image)]) await access(new URL(src, treeUrl));
    if (house === 'illysywen') {
      assert.ok(biography.stats.some(([label, text]) => label === 'Status' && text.includes('ausgestorben')));
      assert.ok(!biography.stats.some(([label]) => label === 'Oberhaupt' || label === 'Erbe'));
    }
    if (house === 'arwydd') assert.equal(biography.quote, 'Wir sind das Schild des Drachen');
    if (['gwefrydd','gwyvern'].includes(house)) assert.equal(biography.stats.find(([label]) => label === 'Rang')[1], 'Baron');
  });

  test(`${house}: Bio-Ergänzung erhält den Familiengraphen und eigene Texte`, () => {
    const old = structuredClone(family);
    old.extensions.sourceRevision -= 1;
    delete old.extensions.houseBiographyModule;
    const normalized = normalizeFamily(old);
    const upgraded = resolveRegisteredFamilyUpgrade(family, old);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, biography);
    for (const key of ['persons','partnerships','parentages','houses','cadetBranches','timeJumps']) {
      const defaults = entries => entries.map(entry => ({ ...entry, extensions: entry.extensions || {} }));
      assert.deepEqual(defaults(upgraded[key]), defaults(normalized[key]), key);
    }
    old.extensions.houseBiographyModule = { ...biography, description: 'Eigene Hausgeschichte' };
    assert.equal(resolveRegisteredFamilyUpgrade(family, old).extensions.houseBiographyModule.description, 'Eigene Hausgeschichte');
    old.extensions.houseBiographyModule = null;
    assert.equal(resolveRegisteredFamilyUpgrade(family, old).extensions.houseBiographyModule, null);
  });
}
