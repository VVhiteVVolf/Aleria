import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_CONTENT as grianlaoch } from '../Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Grianlaoch/haus.content.mjs';
import { HOUSE_CONTENT as llythfor } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Llythfor/haus.content.mjs';
import { HOUSE_BIOGRAPHY as cwingodBiography } from '../Estryll/Cenyr/Klaueninsel/Talklaue/Haus_Cwingod/haus.biography.mjs';
import { CENYR_TERRITORY_COMMONER_DEFINITIONS } from '../../Stammbäume/assets/js/data/cenyr-territory-commoner-definitions.js';

test('Grianlaoch page header and classification retain its canonical Ritterherr rank', () => {
  const record = FAMILY_REGISTRY.find(row => row.id === 'haus-grianlaoch');
  assert.equal(record.houseProfile.rankId, 'knight');
  assert.equal(grianlaoch.type, 'Ritterhaus');
  assert.equal(grianlaoch.profile.highestTitle, 'Ritterherr');
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('../Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Grianlaoch/haus.data.js', import.meta.url), 'utf8'), context);
  assert.equal(context.window.HAEUSER_DATA.meta.type, 'Ritterhaus');
  assert.equal(context.window.HAEUSER_DATA.classification.houseType, 'Ritterhaus');
});

test('Llythfor presents the existing reporter as an ordinary relative without assigning family leadership', () => {
  assert.equal(llythfor.currentHead, '');
  const cynddelw = llythfor.heads.find(person => person.id === 'cynddelw-llythfor');
  assert.equal(cynddelw.role, 'Berichterstatter');
  assert.equal(llythfor.headsTitle, 'Bekannte Angehörige');
  assert.doesNotMatch(cynddelw.role, /Hausführung|Oberhaupt|Vorstand/);
  assert.ok(FAMILY_REGISTRY.find(row => row.id === 'haus-llythfor').family.persons.some(person => person.id === cynddelw.id));
});

test('the ten territorial commoner overviews contain one residential introduction', async () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('../haeuser.registry.js', import.meta.url), 'utf8'), context);
  for (const definition of CENYR_TERRITORY_COMMONER_DEFINITIONS) {
    const registered = context.window.HaeuserRegistry.byId(definition.id);
    const path = registered.data.split('?')[0].replace(/haus\.data\.js$/, 'haus.content.mjs');
    const content = (await import(new URL(`../${path}`, import.meta.url))).HOUSE_CONTENT;
    assert.equal(content.sections.overview.split(/\n\n/).length, 1, definition.id);
    assert.equal(content.biographySummary.overview, content.sections.overview);
    assert.match(content.sections.overview, new RegExp(definition.houseProfile.seat));
  }
});

test('the retained full Cwingod biography omits obsolete military counts while keeping its prose', () => {
  assert.ok(cwingodBiography.house.historyText.length > 100);
  assert.ok(cwingodBiography.house.biographyText.length > 100);
  assert.ok(cwingodBiography.stats.some(([label]) => label === 'Registerort / Sitz'));
  assert.ok(cwingodBiography.stats.every(([label]) => !/Truppenstärke|Flotte/.test(label)));
});
