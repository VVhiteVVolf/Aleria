import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { HOUSE_CONTENT as content } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.content.mjs';
import { HOUSE_BIOGRAPHY as biography } from '../Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.biography.mjs';
import { HOUSE_PERLLAN_FAMILY as sourceFamily } from '../../Stammbäume/assets/js/data/house-perllan-family.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { hasNobleCourt } from '../modules/court/house-court-model.mjs';
import { createHousePageData } from '../modules/house-content/house-content-outputs.mjs';

const feature = new URL('../', import.meta.url);
const treeRoot = new URL('../../Stammbäume/', import.meta.url);
const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Perllan/haus.data.js', feature), 'utf8'), context);
const page = context.window.HAEUSER_DATA;

test('member headings honor existing editorial labels while both established template defaults remain available', () => {
  assert.equal(createHousePageData(content).figures.heading, 'Belegte Angehörige');
  const unlabelled = { ...content, sectionTitles: {} };
  assert.equal(createHousePageData(unlabelled).figures.heading, '11. Historische Figuren');
  assert.equal(createHousePageData({ ...unlabelled, page: 'haus.html' }).figures.heading, '12. Historische Figuren');
});

test('Perllan keeps its sourced commoner profile and the gaps in its history', () => {
  assert.equal(content.type, 'Bürgerliches Haus');
  assert.equal(content.profile.highestTitle, 'Bürgerlich');
  assert.equal(content.profile.seat, 'Gwynthor');
  assert.equal(content.profile.origin, 'Gwynthor');
  assert.equal(content.profile.founding, 'ca. 1240');
  assert.equal(content.profile.people, 'Cenyri');
  assert.equal(content.profile.religion, 'Alerische Kirche');
  assert.equal(content.profile.liege, '');
  assert.equal(content.parentHouseId, '');
  assert.equal(content.founder, null);
  assert.equal(content.heirs.length, 0);
  assert.equal(content.offices.length, 0);
  assert.ok(!hasNobleCourt(page));
  assert.match(content.sections.history, /Zeitsprung/);
  assert.match(content.sections.history, /Onnen ist verstorben; sein Todesjahr ist unbekannt/);
  assert.match(content.sections.knighthood, /Helygen.*Knappe.*Brwyn.*Page/s);
  assert.match(content.biographySummary.character, /Waldgrün/);
  assert.match(content.biographySummary.holdings, /wirtschaftliche Grundlage.*offen/);
  assert.match(content.biographySummary.customs, /Onn.*Eichhörnchen.*Rotkehlchen.*Lili.*Kaninchen.*Blaumeise/s);
  assert.deepEqual(Array.from(page.hiddenProfileGroups), ['military']);
});

test('every named Perllan person has a real linked portrait card without publishing unknown founders as named people', () => {
  const named = sourceFamily.persons.filter(person => !/^(?:\?+|Unbekannt)/i.test(person.name));
  assert.deepEqual(content.figures.map(person => person.id), named.map(person => person.id));
  for (const person of named) {
    const figure = content.figures.find(row => row.id === person.id);
    assert.equal(figure.familyId, 'perllan');
    assert.equal(figure.name, person.name);
    assert.ok(person.portrait, person.id);
    assert.ok(existsSync(new URL(figure.image, feature)), figure.image);
  }
  for (const image of Object.values(page.images).filter(image => image.href?.includes('&person='))) {
    const url = new URL(image.href, 'https://aleria.example/Familien%20H%C3%A4user%20und%20Clans/');
    assert.equal(url.searchParams.get('family'), 'perllan');
    assert.equal(url.searchParams.get('mode'), 'view');
    assert.ok(sourceFamily.persons.some(person => person.id === url.searchParams.get('person')));
  }
  assert.ok(page.figures.entries.length >= 27);
  assert.equal(page.figures.heading, 'Belegte Angehörige');
});

test('Perllan house page, biography and registry share canonical links and local images', () => {
  const registryContext = { window: {} };
  vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
  const entries = registryContext.window.HAEUSER_REGISTRY.filter(row => row.id === 'perllan');
  assert.equal(entries.length, 1);
  assert.equal(registryContext.window.HAEUSER_REGISTRY.some(row => row.id === 'haus-perllan'), false, 'discarded unpublished family ID must not survive as a second house page');
  assert.equal(entries[0].page, 'kleinehaeuser.html');
  assert.equal(entries[0].type, 'family');
  assert.ok(existsSync(new URL(entries[0].data, feature)));
  const tree = new URL(page.familyTreeEmbed.src, 'https://aleria.example/Familien%20H%C3%A4user%20und%20Clans/');
  assert.equal(tree.searchParams.get('family'), 'perllan');
  assert.equal(tree.searchParams.get('mode'), 'view');
  const houseDocument = biography.house.documents[0];
  assert.equal(new URL(houseDocument.link, 'https://aleria.example/Stammb%C3%A4ume/').searchParams.get('haus'), 'perllan');
  assert.deepEqual(readFileSync(new URL(biography.image, treeRoot)), readFileSync(new URL(content.images.scene, feature)));
  assert.deepEqual(readFileSync(new URL(content.images.crest, feature)), readFileSync(new URL(sourceFamily.document.emblem, treeRoot)));
  for (const image of Object.values(page.images)) if (image.src) assert.ok(existsSync(new URL(image.src, feature)), image.src);
  assert.ok(existsSync(new URL(content.territoryHref, feature)));
});

test('house biography registration preserves all Perllan identities and family relationships', () => {
  const records = FAMILY_REGISTRY.filter(row => row.id === 'perllan');
  assert.equal(records.length, 1);
  assert.equal(FAMILY_REGISTRY.some(row => row.id === 'haus-perllan'), false, 'the existing public perllan identity must remain unique');
  const registered = records[0].family;
  for (const key of ['persons', 'partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage']) {
    assert.deepEqual(registered[key], sourceFamily[key], key);
  }
  assert.equal(registered.extensions.houseBiographyModule.pageTitle, content.name);
  assert.equal(registered.extensions.houseBiographyModule.house.documents[0].link, biography.house.documents[0].link);
});
